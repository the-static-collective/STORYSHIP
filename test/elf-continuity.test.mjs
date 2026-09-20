import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, rm, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { sealElfArk, receiveElfArk } from '../src/elf-ark.mjs';
import { witnessElfArkArrival } from '../src/elf-continuity.mjs';
const sha = value => createHash('sha256').update(value).digest('hex');

async function specimen(t) {
  const root = await mkdtemp(join(tmpdir(),'storyship-continuity-'));
  t.after(()=>rm(root,{recursive:true,force:true}));
  const occurrenceId = 'a'.repeat(32);
  const occurrence = join(root,occurrenceId);
  await mkdir(occurrence);
  const bytes=Buffer.from('continuity specimen\n');
  const receipt={
    schema:'static.genesis-elf-occurrence/v0', occurrence_id:occurrenceId,
    seed_sha256:sha('seed'),input_sha256:sha('continuity specimen\n'),
    output_sha256:sha(bytes),operation:'copy',parent_receipt_sha256:null,
    producer:'deterministic_fixture_not_openmanus',status:'produced_unverified',
    semantic_authority:false,admitted:false
  };
  await writeFile(join(occurrence,'artifact.txt'),bytes);
  await writeFile(join(occurrence,'receipt.json'),JSON.stringify(receipt)+'\n');
  const arkDirectory=join(root,'ark');
  const arrivalDirectory=join(root,'arrival');
  await sealElfArk({occurrence,destination:arkDirectory});
  await receiveElfArk({arkDirectory,destination:arrivalDirectory});
  return {arkDirectory,arrivalDirectory};
}

test('verifies one Ark and one new arrival without inventing cold-boot or authority',async t=>{
  const paths=await specimen(t);
  const evidence=await witnessElfArkArrival(paths);
  assert.equal(evidence.schema,'storyship/elf-continuity-evidence/v0');
  assert.equal(evidence.local_material,'verified');
  assert.equal(evidence.cold_boot,'not_observed');
  assert.equal(evidence.original_elf_execution,'not_verified');
  assert.equal(evidence.successor_elf,'not_observed');
  assert.equal(evidence.authority,'none');
  assert.equal(evidence.evidence_id,(await witnessElfArkArrival(paths)).evidence_id);
});
test('changed received bytes and forged destination authority refuse',async t=>{
  const paths=await specimen(t);
  const input=join(paths.arrivalDirectory,'input.txt');
  await writeFile(input,'changed');
  await assert.rejects(()=>witnessElfArkArrival(paths),/ARRIVAL_SOURCE_BYTES_MISMATCH/);
  const reset=await specimen(t);
  const path=join(reset.arrivalDirectory,'arrival.json');
  const arrival=JSON.parse(await readFile(path,'utf8'));
  arrival.authority='root';
  await writeFile(path,JSON.stringify(arrival)+'\n');
  await assert.rejects(()=>witnessElfArkArrival(reset),/ARRIVAL_MANIFEST_MISMATCH/);
});
test('changed seed and fake cold-boot claim refuse',async t=>{
  const paths=await specimen(t);
  await writeFile(join(paths.arrivalDirectory,'seed.json'),'{}\n');
  await assert.rejects(()=>witnessElfArkArrival(paths),/ARRIVAL_SEED_MISMATCH/);
  const next=await specimen(t);
  const path=join(next.arrivalDirectory,'arrival.json');
  const arrival=JSON.parse(await readFile(path,'utf8'));
  arrival.cold_boot='verified';
  await writeFile(path,JSON.stringify(arrival)+'\n');
  await assert.rejects(()=>witnessElfArkArrival(next),/INVALID_ARRIVAL_FIELDS/);
});
