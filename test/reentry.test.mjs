import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { canonicalStringify } from '../src/canonical.mjs';

async function expectedSummary(){return JSON.parse(await readFile(new URL('../fixtures/voyage-000/expected-summary.json',import.meta.url),'utf8'));}
function runFresh(){return spawnSync(process.execPath,['test/helpers/reentry-child.mjs','fixtures/voyage-000'],{cwd:new URL('..',import.meta.url),encoding:'utf8'});}

test('fresh processes reproduce byte-identical verification summary', async () => {
  const expectedCanonicalSummary=canonicalStringify(await expectedSummary());
  const first=runFresh(); const second=runFresh();
  assert.equal(first.status,0,first.stderr); assert.equal(second.status,0,second.stderr);
  assert.equal(first.stdout,second.stdout); assert.equal(first.stdout.trim(),expectedCanonicalSummary);
});
