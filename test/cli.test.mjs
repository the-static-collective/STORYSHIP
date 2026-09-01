import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
function runCli(args){return spawnSync(process.execPath,['cli/storyship.mjs',...args],{cwd:new URL('..',import.meta.url),encoding:'utf8'});}
function snapshotDirectory(dir){
  const walk=p=>readdirSync(p).sort().map(name=>{const q=join(p,name);return statSync(q).isDirectory()?[name,walk(q)]:[name,readFileSync(q,'utf8')];});
  return JSON.stringify(walk(dir));
}

test('verify prints the seven operator questions', () => {
  const result=runCli(['verify','fixtures/voyage-000']); assert.equal(result.status,0,result.stderr);
  for(const heading of ['WHERE AM I?','WHAT IS TRUE?','WHAT ARE WE CARRYING?','WHAT IS OPEN?','WHAT HAPPENED?','WHAT CAN I DO NEXT?','WHAT IS NOT MINE TO DECIDE?']) assert.match(result.stdout,new RegExp(heading.replace('?','\\?')));
});

test('forbidden authority commands do not exist', () => {
  for(const command of ['decide','rank','admit']){const result=runCli([command]);assert.notEqual(result.status,0);assert.match(result.stderr,/unknown command/);}
});

test('fixture preflight is provider-free and leaves files unchanged', () => {
  const before=snapshotDirectory('fixtures/voyage-000'); const result=runCli(['preflight','fixtures/voyage-000']); const after=snapshotDirectory('fixtures/voyage-000');
  assert.equal(before,after); assert.match(result.stdout,/LIVE DEPARTURE: BLOCKED/);
});

test('constitution verify and replay are readable operator actions', () => {
  const c=runCli(['constitution','verify','fixtures/voyage-000/constitution.json']); assert.equal(c.status,0,c.stderr); assert.match(c.stdout,/constitution: valid/);
  const r=runCli(['replay','fixtures/voyage-000','--cut','3']); assert.equal(r.status,0,r.stderr); assert.match(r.stdout,/storyship\/replay\/v0/);
});
