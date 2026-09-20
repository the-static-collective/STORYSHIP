// STORYSHIP-ELF-ARK-001: a transport adapter, NOT the music-voyage packet.
// All inputs are deliberately small, data-only, and manually selected.
import { createHash, randomUUID } from 'node:crypto';
import { lstat, mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { canonicalStringify, hashCanonical, STORYSHIP_CANONICALIZATION_POLICY } from './canonical.mjs';

const SCHEMA = 'storyship/elf-ark/v0';
const ARRIVAL = 'storyship/elf-arrival/v0';
const ORIGINAL = 'static.genesis-elf-occurrence/v0';
const SEED = 'static.genesis-elf-seed/v0';
const HEX = /^[0-9a-f]{64}$/;
const ID = /^[0-9a-f]{32}$/;
const ARTIFACT_LIMIT = 65536;
const RECEIPT_LIMIT = 16384;
const EXPECTED_RECEIPT_KEYS = [
  'schema','occurrence_id','seed_sha256','input_sha256','output_sha256',
  'operation','parent_receipt_sha256','producer','status','semantic_authority','admitted'
].sort();

function refuse(code) { const error = new Error(code); error.code = code; throw error; }
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const prefixed = bytes => `sha256:${sha(bytes)}`;
function inside(parent, child) {
  const part = relative(resolve(parent), resolve(child));
  return part === '' || (part !== '..' && !part.startsWith(`..${'/'}`) && !part.startsWith(`..${'\\'}`) && !part.startsWith('/'));
}
function separate(a, b) {
  if (inside(a,b) || inside(b,a)) refuse('OVERLAPPING_SOURCE_AND_DESTINATION');
}
async function isMissing(path) {
  try { await lstat(path); return false; }
  catch (e) { if (e.code === 'ENOENT') return true; throw e; }
}
async function checkedDir(path) {
  const info = await lstat(path);
  if (!info.isDirectory() || info.isSymbolicLink()) refuse('NOT_A_REAL_DIRECTORY');
}
async function checkedFile(path, maximum) {
  const info = await lstat(path);
  if (!info.isFile() || info.isSymbolicLink() || info.size > maximum) refuse('INVALID_OR_OVERSIZED_FILE');
  const data = await readFile(path);
  if (data.length > maximum) refuse('OVERSIZED_FILE');
  return data;
}
async function onlyNames(path, names) {
  const found = (await readdir(path)).sort();
  if (canonicalStringify(found) !== canonicalStringify([...names].sort())) refuse('UNEXPECTED_FILES');
}
function parseReceipt(bytes, occurrenceId) {
  let value;
  try { value = JSON.parse(bytes.toString('utf8')); } catch { refuse('INVALID_ELF_RECEIPT'); }
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      canonicalStringify(Object.keys(value).sort()) !== canonicalStringify(EXPECTED_RECEIPT_KEYS)) refuse('UNEXPECTED_RECEIPT_FIELDS');
  if (value.schema !== ORIGINAL || !ID.test(value.occurrence_id) ||
      (occurrenceId !== null && value.occurrence_id !== occurrenceId) ||
      value.producer !== 'deterministic_fixture_not_openmanus' ||
      value.status !== 'produced_unverified' ||
      value.semantic_authority !== false || value.admitted !== false ||
      !['copy','uppercase_ascii'].includes(value.operation) ||
      ![value.seed_sha256, value.input_sha256, value.output_sha256].every(v => typeof v === 'string' && HEX.test(v)) ||
      (value.parent_receipt_sha256 !== null &&
       (typeof value.parent_receipt_sha256 !== 'string' || !HEX.test(value.parent_receipt_sha256)))) {
    refuse('INVALID_ELF_RECEIPT');
  }
  return value;
}
function expectedArk(artifact, receiptBytes, receipt) {
  const body = {
    schema: SCHEMA,
    canonicalization_policy: STORYSHIP_CANONICALIZATION_POLICY,
    source_project: 'the-static-collective/static-workbench',
    origin_occurrence_id: receipt.occurrence_id,
    origin_producer: receipt.producer,
    declared_parent_receipt_sha256: receipt.parent_receipt_sha256,
    origin_seed_sha256: receipt.seed_sha256,
    artifact_sha256: prefixed(artifact),
    origin_receipt_sha256: prefixed(receiptBytes),
    passage: 'operator-carried',
    destination_status: 'unadmitted',
    authority: 'none'
  };
  return {...body, ark_id: hashCanonical(body)};
}
async function readPayload(directory, expectSealed) {
  await checkedDir(directory);
  await onlyNames(directory, expectSealed ? ['ark.json','artifact.txt','receipt.json'] : ['artifact.txt','receipt.json']);
  const artifact = await checkedFile(join(directory, 'artifact.txt'), ARTIFACT_LIMIT);
  const receiptBytes = await checkedFile(join(directory, 'receipt.json'), RECEIPT_LIMIT);
  const receipt = parseReceipt(receiptBytes, expectSealed ? null : basename(resolve(directory)));
  if (receipt.output_sha256 !== sha(artifact)) refuse('ARTIFACT_RECEIPT_DIGEST_MISMATCH');
  return {artifact, receiptBytes, receipt};
}
export async function sealElfArk({occurrence, destination}) {
  separate(occurrence, destination);
  await checkedDir(dirname(destination));
  if (!await isMissing(destination)) refuse('DESTINATION_ALREADY_EXISTS');
  const {artifact, receiptBytes, receipt} = await readPayload(occurrence, false);
  const ark = expectedArk(artifact, receiptBytes, receipt);
  const staging = await mkdtemp(join(dirname(destination), '.storyship-elf-ark-'));
  let committed = false;
  try {
    await writeFile(join(staging, 'artifact.txt'), artifact, {flag:'wx',mode:0o600});
    await writeFile(join(staging, 'receipt.json'), receiptBytes, {flag:'wx',mode:0o600});
    await writeFile(join(staging, 'ark.json'), `${canonicalStringify(ark)}\n`, {flag:'wx',mode:0o600});
    if (!await isMissing(destination)) refuse('DESTINATION_ALREADY_EXISTS');
    await rename(staging, destination);
    committed = true;
    return ark;
  } finally {
    if (!committed) await rm(staging, {recursive:true,force:true});
  }
}
export async function verifyElfArk(directory) {
  const {artifact, receiptBytes, receipt} = await readPayload(directory, true);
  const arkBytes = await checkedFile(join(directory, 'ark.json'), RECEIPT_LIMIT);
  let actual;
  try { actual = JSON.parse(arkBytes.toString('utf8')); } catch { refuse('INVALID_ARK_MANIFEST'); }
  const expected = expectedArk(artifact, receiptBytes, receipt);
  if (canonicalStringify(actual) !== canonicalStringify(expected)) refuse('ARK_MANIFEST_MISMATCH');
  return {ark:expected,artifact,receiptBytes};
}
export async function receiveElfArk({arkDirectory, destination}) {
  separate(arkDirectory,destination);
  await checkedDir(dirname(destination));
  if (!await isMissing(destination)) refuse('DESTINATION_ALREADY_EXISTS');
  const {ark, artifact, receiptBytes} = await verifyElfArk(arkDirectory);
  const seed = {
    schema: SEED,
    operation:'copy',
    input_sha256: sha(artifact),
    parent_receipt_sha256: sha(receiptBytes)
  };
  const seedBytes = Buffer.from(`${JSON.stringify(seed)}\n`, 'utf8');
  const body = {
    schema:ARRIVAL, ark_id:ark.ark_id,
    arrival_occurrence_id:randomUUID(),
    recorded_at:new Date().toISOString(),
    input_sha256:prefixed(artifact),
    origin_receipt_sha256:prefixed(receiptBytes),
    new_seed_sha256:prefixed(seedBytes),
    destination_status:'materialized_unadmitted',
    authority:'none',
    elf_hatched:false
  };
  const arrival = {...body,arrival_id:hashCanonical(body)};
  const staging = await mkdtemp(join(dirname(destination), '.storyship-elf-arrival-'));
  let committed=false;
  try {
    await writeFile(join(staging,'input.txt'), artifact, {flag:'wx',mode:0o600});
    await writeFile(join(staging,'parent-receipt.json'), receiptBytes, {flag:'wx',mode:0o600});
    await writeFile(join(staging,'seed.json'), seedBytes, {flag:'wx',mode:0o600});
    await writeFile(join(staging,'arrival.json'), `${canonicalStringify(arrival)}\n`, {flag:'wx',mode:0o600});
    if (!await isMissing(destination)) refuse('DESTINATION_ALREADY_EXISTS');
    await rename(staging,destination);
    committed=true;
    return arrival;
  } finally {
    if (!committed) await rm(staging,{recursive:true,force:true});
  }
}
