import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { cp, mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sealElfArk, verifyElfArk, receiveElfArk } from '../src/elf-ark.mjs';

const cli = fileURLToPath(new URL('../cli/elf-ark.mjs', import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

async function specimen(t) {
  const root = await mkdtemp(join(tmpdir(), 'storyship-elf-ark-test-'));
  t.after(()=>rm(root,{recursive:true,force:true}));
  const occurrence = join(root,'a'.repeat(32));
  await mkdir(occurrence);
  const artifact = Buffer.from('SEED BECOMES SIGNAL\n');
  const receipt = {
    schema:'static.genesis-elf-occurrence/v0',
    occurrence_id:'a'.repeat(32),
    seed_sha256:sha(Buffer.from('seed-specimen')),
    input_sha256:sha(Buffer.from('seed becomes signal\n')),
    output_sha256:sha(artifact),
    operation:'uppercase_ascii',parent_receipt_sha256:null,
    producer:'deterministic_fixture_not_openmanus',
    status:'produced_unverified',semantic_authority:false,admitted:false
  };
  await writeFile(join(occurrence,'artifact.txt'),artifact);
  await writeFile(join(occurrence,'receipt.json'),JSON.stringify(receipt)+'\n');
  return {root,occurrence,artifact,receipt};
}
const invoke = args => spawnSync(process.execPath,[cli,...args],{encoding:'utf8'});

test('seal -> manually copy -> independent fresh process verify -> receive',async t=>{
  const {root,occurrence,artifact}=await specimen(t);
  const carrier=join(root,'carrier');
  const sealed=await sealElfArk({occurrence,destination:carrier});
  assert.equal(sealed.destination_status,'unadmitted');
  assert.equal(sealed.authority,'none');
  assert.equal(sealed.origin_producer,'deterministic_fixture_not_openmanus');
  assert.deepEqual((await readdir(carrier)).sort(),['ark.json','artifact.txt','receipt.json']);
  const transferred=join(root,'transferred');
  await cp(carrier,transferred,{recursive:true});
  const verified=invoke(['verify','--ark',transferred]);
  assert.equal(verified.status,0,verified.stderr);
  assert.equal(JSON.parse(verified.stdout).ark_id,sealed.ark_id);
  const incoming=join(root,'incoming');
  const result=invoke(['receive','--ark',transferred,'--destination',incoming]);
  assert.equal(result.status,0,result.stderr);
  const arrival=JSON.parse(result.stdout);
  assert.equal(arrival.elf_hatched,false);
  assert.equal(arrival.authority,'none');
  assert.equal(arrival.destination_status,'materialized_unadmitted');
  assert.deepEqual(await readFile(join(incoming,'input.txt')),artifact);
  const originalReceipt=await readFile(join(occurrence,'receipt.json'));
  assert.deepEqual(await readFile(join(incoming,'parent-receipt.json')),originalReceipt);
  const seed=JSON.parse(await readFile(join(incoming,'seed.json'),'utf8'));
  assert.equal(seed.input_sha256,sha(artifact));
  assert.equal(seed.parent_receipt_sha256,sha(originalReceipt));
  assert.equal(seed.operation,'copy');
  assert.deepEqual((await readdir(incoming)).sort(),['arrival.json','input.txt','parent-receipt.json','seed.json']);
});

test('modifying artifact after sealing refuses arrival and creates no destination',async t=>{
  const {root,occurrence}=await specimen(t);
  const carrier=join(root,'carrier'); await sealElfArk({occurrence,destination:carrier});
  await writeFile(join(carrier,'artifact.txt'),'tampered');
  assert.rejects(()=>verifyElfArk(carrier),/ARTIFACT_RECEIPT_DIGEST_MISMATCH/);
  const incoming=join(root,'incoming');
  await assert.rejects(()=>receiveElfArk({arkDirectory:carrier,destination:incoming}),/ARTIFACT_RECEIPT_DIGEST_MISMATCH/);
  assert.rejects(()=>readdir(incoming),{code:'ENOENT'});
});

test('modifying manifest after sealing refuses independent verification',async t=>{
  const {root,occurrence}=await specimen(t);
  const carrier=join(root,'carrier'); await sealElfArk({occurrence,destination:carrier});
  const manifest=JSON.parse(await readFile(join(carrier,'ark.json'),'utf8'));
  manifest.authority='root';
  await writeFile(join(carrier,'ark.json'),JSON.stringify(manifest));
  await assert.rejects(()=>verifyElfArk(carrier),/ARK_MANIFEST_MISMATCH/);
});

test('receipt with added credentials, promoted status or mismatched artifact refuses sealing',async t=>{
  const {root,occurrence,receipt}=await specimen(t);
  for (const [name,change] of [
    ['secrets',r=>{r.api_key='not-a-secret';}],
    ['authority',r=>{r.admitted=true;}],
    ['false-provider',r=>{r.producer='openmanus';}],
    ['false-output',r=>{r.output_sha256='0'.repeat(64);}]
  ]) {
    const modified={...receipt};change(modified);
    await writeFile(join(occurrence,'receipt.json'),JSON.stringify(modified));
    await assert.rejects(()=>sealElfArk({occurrence,destination:join(root,name)}));
    await assert.rejects(()=>readdir(join(root,name)),{code:'ENOENT'});
  }
});

test('symlinked source payload and unexpected carrier additions refuse',async t=>{
  const {root,occurrence}=await specimen(t);
  const carrier=join(root,'carrier');await sealElfArk({occurrence,destination:carrier});
  await writeFile(join(carrier,'extra.txt'),'unexpected');
  await assert.rejects(()=>verifyElfArk(carrier),/UNEXPECTED_FILES/);
  await rm(join(carrier,'extra.txt'));
  await rm(join(carrier,'artifact.txt'));
  await symlink(join(occurrence,'artifact.txt'),join(carrier,'artifact.txt'));
  await assert.rejects(()=>verifyElfArk(carrier),/INVALID_OR_OVERSIZED_FILE/);
});

test('source and destination cannot overlap or overwrite existing paths',async t=>{
  const {root,occurrence}=await specimen(t);
  await assert.rejects(()=>sealElfArk({occurrence,destination:join(occurrence,'ark')}),/OVERLAPPING_SOURCE_AND_DESTINATION/);
  await assert.rejects(()=>sealElfArk({occurrence,destination:root}),/OVERLAPPING_SOURCE_AND_DESTINATION/);
  const carrier=join(root,'carrier');await sealElfArk({occurrence,destination:carrier});
  await assert.rejects(()=>sealElfArk({occurrence,destination:carrier}),/DESTINATION_ALREADY_EXISTS/);
  await assert.rejects(()=>receiveElfArk({arkDirectory:carrier,destination:carrier}),/OVERLAPPING_SOURCE_AND_DESTINATION/);
});

test('missing parent receipt authority is not inferred; receiving material does not hatch',async t=>{
  const {root,occurrence,receipt}=await specimen(t);
  const modified={...receipt,parent_receipt_sha256:'f'.repeat(64)};
  await writeFile(join(occurrence,'receipt.json'),JSON.stringify(modified));
  const carrier=join(root,'carrier');const ark=await sealElfArk({occurrence,destination:carrier});
  assert.equal(ark.declared_parent_receipt_sha256,'f'.repeat(64));
  assert.equal(ark.destination_status,'unadmitted');
  const incoming=join(root,'incoming');
  const arrival=await receiveElfArk({arkDirectory:carrier,destination:incoming});
  assert.equal(arrival.elf_hatched,false);
  assert.equal(arrival.authority,'none');
  // The previous parent is declared, but the adapter never asserts its existence.
  assert.equal(JSON.parse(await readFile(join(incoming,'seed.json'),'utf8')).parent_receipt_sha256,
    sha(await readFile(join(occurrence,'receipt.json'))));
});

test('two arrivals from the same sealed Ark have distinct occurrence identities',async t=>{
  const {root,occurrence}=await specimen(t);
  const carrier=join(root,'carrier');await sealElfArk({occurrence,destination:carrier});
  const first=await receiveElfArk({arkDirectory:carrier,destination:join(root,'arrival-one')});
  const second=await receiveElfArk({arkDirectory:carrier,destination:join(root,'arrival-two')});
  assert.equal(first.ark_id,second.ark_id);
  assert.notEqual(first.arrival_occurrence_id,second.arrival_occurrence_id);
  assert.notEqual(first.arrival_id,second.arrival_id);
  assert.equal(first.elf_hatched,false);
  assert.equal(second.elf_hatched,false);
});
