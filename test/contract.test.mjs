import test from 'node:test';
import assert from 'node:assert/strict';
import { SHA, FOUNDING_CONSTITUTION_INPUT, SOURCE_CUT_INPUT } from './helpers/fixture.mjs';
import {
  STORYSHIP_EVENT_TYPES, STORYSHIP_RESULT_VALUES, STORYSHIP_RESULT_TARGETS, STORYSHIP_FORBIDDEN_BERTH_CLASSES,
  createConstitutionReceipt, validateConstitutionReceipt, admitSourceCut, validateSourceCut,
  createStoryshipResult, validateStoryshipResult, createSelectorReceipt, validateSelectorReceipt,
  createReserveReceipt, validateReserveReceipt, createLaunchGoReceipt, validateLaunchGoReceipt,
} from '../src/contract.mjs';

test('native constitution identity depends on ordered path/blob pairs, not later head', () => {
  const first = createConstitutionReceipt(FOUNDING_CONSTITUTION_INPUT);
  const later = createConstitutionReceipt({...FOUNDING_CONSTITUTION_INPUT, owner_head_sha: 'f'.repeat(40)});
  assert.equal(first.schema, 'storyship/constitution-receipt/v0');
  assert.equal(first.canonicalization_policy, 'storyship-canonical-json-v1');
  assert.equal(first.constitution_id, later.constitution_id);
  assert.equal(validateConstitutionReceipt(first), true);
});

test('native vocabularies are bounded and frozen', () => {
  assert(STORYSHIP_EVENT_TYPES.includes('generation-observed'));
  assert.deepEqual(STORYSHIP_RESULT_VALUES, ['supports','refuses','unresolved']);
  assert(STORYSHIP_RESULT_TARGETS.includes('destination_admission'));
  assert(STORYSHIP_FORBIDDEN_BERTH_CLASSES.includes('protected silence'));
  assert(Object.isFrozen(STORYSHIP_EVENT_TYPES));
});

test('source cut and machine result remain typed', () => {
  const cut = admitSourceCut(SOURCE_CUT_INPUT);
  assert.equal(validateSourceCut(cut), true);
  const result = createStoryshipResult({result:'supports', target:'destination_admission', basis_event_ids:[], reason_codes:['fixture']});
  assert.equal(result.authority, 'machine-test-only');
  assert.equal(result.owner_gate_status, 'not-constituted');
  assert.equal(validateStoryshipResult(result), true);
});

test('selector recovery remains typed', () => {
  for (const recovery_status of ['recovered','partial','unresolved']) {
    const receipt = createSelectorReceipt({mechanism_id:`selector-${recovery_status}`, recovery_status,
      evidence_refs: recovery_status === 'unresolved' ? [] : ['source:fixture'],
      operator_inputs_visible:['sibling audio','prompt','lyrics'],
      allowed_outcomes:['continue-a','continue-b','hold-both','stop'], non_selected_treatment:'dormant',
      unresolved_notes: recovery_status === 'recovered' ? [] : ['historical cadence unresolved']});
    assert.equal(receipt.recovery_status, recovery_status);
    assert.equal(validateSelectorReceipt(receipt), true);
  }
});

test('reserve and GO bind actual accounting identities', () => {
  const reserve = createReserveReceipt({observed_available_credits:1000, protected_reserve_credits:150,
    observed_at:'2026-08-31T00:00:00.000Z', basis_ref:'human-observation:fixture'});
  assert.equal(reserve.spendable_credits, 850);
  assert.equal(validateReserveReceipt(reserve), true);
  const go = createLaunchGoReceipt({launch_candidate_head_sha:'a'.repeat(40), packet_id:SHA('b'),
    reserve_receipt_id:reserve.reserve_receipt_id, selector_receipt_id:SHA('c'), approved_by:'human:operator-000',
    approved_at:'2026-08-31T00:01:00.000Z'});
  assert.equal(go.packet_id, SHA('b'));
  assert.equal(validateLaunchGoReceipt(go), true);
});

test('invalid reserve and fabricated recovered selector fail closed', () => {
  assert.throws(() => createReserveReceipt({observed_available_credits:100, protected_reserve_credits:101, observed_at:'x', basis_ref:'r'}), /protected reserve/);
  assert.throws(() => createSelectorReceipt({mechanism_id:'s', recovery_status:'recovered', evidence_refs:[], operator_inputs_visible:['x'], allowed_outcomes:['y'], non_selected_treatment:'dormant', unresolved_notes:[]}), /evidence/);
});
