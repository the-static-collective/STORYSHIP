import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { evaluatePreflight } from '../src/preflight.mjs';

const selector = JSON.parse(await readFile(new URL('../voyages/storyship-001/selector.json', import.meta.url), 'utf8'));

test('partial historical selector remains unresolved and no real Vault cut is fabricated', () => {
  const preflight = evaluatePreflight({
    constitution_valid:true,
    continuity_crucible_passed:true,
    fresh_process_reentry_passed:true,
    selector_receipt:selector,
    vault_source_cut:null,
    packet_000_valid:true,
    reserve_receipt:null,
    launch_go:null,
    current_head_sha:'a'.repeat(40),
    packet_id:'sha256:'+'b'.repeat(64),
    third_arm_machine_verdict_enabled:false,
  });
  assert.equal(preflight.gates.historical_selector.state, 'unresolved');
  assert.notEqual(preflight.gates.real_vault_source.state, 'pass');
  assert.equal(preflight.ready, false);
});
