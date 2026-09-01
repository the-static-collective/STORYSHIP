import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { STORYSHIP_CANONICALIZATION_POLICY, canonicalStringify, hashCanonical } from '../src/canonical.mjs';
const fixture = JSON.parse(await readFile(new URL('../fixtures/compat/hp-canonical-v1.json', import.meta.url), 'utf8'));
test('native policy is STORYSHIP-owned while bytes remain deterministic', () => {
  assert.equal(STORYSHIP_CANONICALIZATION_POLICY, 'storyship-canonical-json-v1');
  assert.equal(canonicalStringify(fixture.input), fixture.canonical);
  assert.equal(hashCanonical(fixture.input), fixture.hash);
});
test('key insertion order does not change identity', () => assert.equal(hashCanonical({b:2,a:1}), hashCanonical({a:1,b:2})));
test('invalid JSON shapes fail closed', () => {
  assert.throws(() => canonicalStringify({value:Number.NaN}), /finite numbers/);
  assert.throws(() => canonicalStringify({value:undefined}), /JSON-safe/);
  const cyclic={}; cyclic.self=cyclic; assert.throws(() => canonicalStringify(cyclic), /cycles/);
});
