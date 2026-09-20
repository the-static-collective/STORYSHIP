// FLIGHT-002: independent, read-only local arrival consistency witness.
// Verification here cannot attest a shutdown, physical transfer, sender identity,
// original ELF execution, or TranchNode admission. No authority is transmitted.
import { createHash } from 'node:crypto';
import { lstat, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { canonicalStringify, hashCanonical } from './canonical.mjs';
import { verifyElfArk } from './elf-ark.mjs';

const sha = bytes => 'sha256:' + createHash('sha256').update(bytes).digest('hex');
function refuse(code) { const error = new Error(code); error.code = code; throw error; }
const ARRIVAL_KEYS = [
  'schema','ark_id','arrival_occurrence_id','recorded_at','input_sha256',
  'origin_receipt_sha256','new_seed_sha256','destination_status',
  'authority','elf_hatched','arrival_id'
].sort();

async function regular(path, max) {
  const st = await lstat(path);
  if (!st.isFile() || st.isSymbolicLink() || st.size > max) refuse('INVALID_ARRIVAL_FILE');
  const bytes = await readFile(path);
  if (bytes.length > max) refuse('OVERSIZED_ARRIVAL_FILE');
  return bytes;
}

export async function witnessElfArkArrival({arkDirectory, arrivalDirectory}) {
  // Storyship's own verifier owns all original Ark/receipt/artifact consistency.
  const {ark, artifact, receiptBytes} = await verifyElfArk(arkDirectory);
  const stat = await lstat(arrivalDirectory);
  if (!stat.isDirectory() || stat.isSymbolicLink()) refuse('INVALID_ARRIVAL_DIRECTORY');
  const names = await readdir(arrivalDirectory);
  if (canonicalStringify(names.sort()) !== canonicalStringify(
    ['input.txt','parent-receipt.json','seed.json','arrival.json'].sort())) {
    refuse('UNEXPECTED_ARRIVAL_FILES');
  }
  const input = await regular(join(arrivalDirectory,'input.txt'),65536);
  const parentReceipt = await regular(join(arrivalDirectory,'parent-receipt.json'),16384);
  const seedBytes = await regular(join(arrivalDirectory,'seed.json'),16384);
  const arrivalBytes = await regular(join(arrivalDirectory,'arrival.json'),16384);
  if (!input.equals(artifact) || !parentReceipt.equals(receiptBytes)) {
    refuse('ARRIVAL_SOURCE_BYTES_MISMATCH');
  }
  let seed, arrival;
  try {
    seed = JSON.parse(seedBytes.toString('utf8'));
    arrival = JSON.parse(arrivalBytes.toString('utf8'));
  } catch {
    refuse('INVALID_ARRIVAL_JSON');
  }
  const expectedSeed = {
    schema: 'static.genesis-elf-seed/v0', operation:'copy',
    input_sha256: sha(artifact).slice(7),
    parent_receipt_sha256: sha(receiptBytes).slice(7)
  };
  if (canonicalStringify(seed) !== canonicalStringify(expectedSeed)) {
    refuse('ARRIVAL_SEED_MISMATCH');
  }
  if (!arrival || typeof arrival !== 'object' || Array.isArray(arrival) ||
      canonicalStringify(Object.keys(arrival).sort()) !== canonicalStringify(ARRIVAL_KEYS)) {
    refuse('INVALID_ARRIVAL_FIELDS');
  }
  const {arrival_id, ...body} = arrival;
  if (arrival.schema !== 'storyship/elf-arrival/v0' ||
      arrival.ark_id !== ark.ark_id ||
      arrival.input_sha256 !== sha(artifact) ||
      arrival.origin_receipt_sha256 !== sha(receiptBytes) ||
      arrival.new_seed_sha256 !== sha(seedBytes) ||
      arrival.destination_status !== 'materialized_unadmitted' ||
      arrival.authority !== 'none' || arrival.elf_hatched !== false ||
      typeof arrival.arrival_occurrence_id !== 'string' ||
      !/^[0-9a-f-]{36}$/.test(arrival.arrival_occurrence_id) ||
      typeof arrival.recorded_at !== 'string' ||
      !Number.isFinite(Date.parse(arrival.recorded_at)) ||
      arrival_id !== hashCanonical(body)) {
    refuse('ARRIVAL_MANIFEST_MISMATCH');
  }
  const evidence = {
    schema: 'storyship/elf-continuity-evidence/v0',
    ark_id: ark.ark_id,
    origin_occurrence_id: ark.origin_occurrence_id,
    origin_receipt_sha256: ark.origin_receipt_sha256,
    declared_parent_receipt_sha256: ark.declared_parent_receipt_sha256,
    artifact_sha256: ark.artifact_sha256,
    arrival_id,
    arrival_occurrence_id: arrival.arrival_occurrence_id,
    local_material: 'verified',
    cold_boot: 'not_observed',
    original_elf_execution: 'not_verified',
    successor_elf: 'not_observed',
    external_witness: 'none',
    destination_status: 'materialized_unadmitted',
    authority: 'none'
  };
  return {...evidence, evidence_id: hashCanonical(evidence)};
}
