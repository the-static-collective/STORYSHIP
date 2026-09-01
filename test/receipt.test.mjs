import test from 'node:test';
import assert from 'node:assert/strict';
import { SHA } from './helpers/fixture.mjs';
import { createCheckpointReceipt, validateCheckpointReceipt, createCrossingReceipt, validateCrossingReceipt } from '../src/receipt.mjs';
const expectCode = code => error => error?.code === code;
function makeCrossingInput(overrides={}) {
  return {
    constitution_id: SHA('a'), voyage_id:'voyage-000', branch_id:'branch-a', parent_state_ids:[SHA('b')],
    input_packet_id:SHA('c'), event_cut:4, source_cut_ids:[SHA('d')], request_identity:'request-000',
    provider_visible_fields:{prompt:'fixture'}, observed_sibling_artifact_ids:[SHA('1'),SHA('2')], actual_credit_debit:0,
    encounter_id:'encounter-000', selector_receipt_id:SHA('3'), selection_outcome:'continue-a', appended_event_ids:[SHA('4')],
    resulting_branch_heads:[{branch_id:'branch-a',state_id:SHA('5'),status:'live'}], projection_ids:{reality:SHA('6')},
    projector_versions:{reality:'v0'}, canonicalization_policy:'storyship-canonical-json-v1', execution_environment:{node:'22'},
    unresolved_residue:[], refused_residue:[], dormant_residue:['branch-b'], previous_receipt_ids:[], customs_receipt_ref:null,
    ...overrides,
  };
}

test('arrival without HP receipt remains unadmitted', () => {
  const receipt=createCrossingReceipt(makeCrossingInput({customs_receipt_ref:null}));
  assert.equal(receipt.destination_status,'unadmitted');
  assert.equal(validateCrossingReceipt(receipt),true);
});

test('HP customs reference does not become Storyship admission', () => {
  const receipt=createCrossingReceipt(makeCrossingInput({customs_receipt_ref:{owning_world:'the-static-collective/the-haunted-phonography',source_cut_id:SHA('e')}}));
  assert.equal(receipt.destination_status,'customs-receipt-linked');
  assert.notEqual(receipt.destination_status,'admitted');
});

test('credit debit must be observed non-negative integer accounting', () => {
  assert.throws(()=>createCrossingReceipt(makeCrossingInput({actual_credit_debit:-1})),expectCode('INVALID_STORYSHIP_RECEIPT'));
  assert.throws(()=>createCrossingReceipt(makeCrossingInput({actual_credit_debit:1.5})),expectCode('INVALID_STORYSHIP_RECEIPT'));
});

test('checkpoint binds packet and replay without granting authority', () => {
  const checkpoint=createCheckpointReceipt({constitution_id:SHA('a'),voyage_id:'voyage-000',event_cut:4,replay_id:SHA('f'),packet_id:SHA('c'),previous_receipt_ids:[]});
  assert.equal(checkpoint.authority,'receipt-only');
  assert.equal(validateCheckpointReceipt(checkpoint),true);
});

test('caller cannot smuggle destination status', () => {
  assert.throws(()=>createCrossingReceipt({...makeCrossingInput(),destination_status:'admitted'}),expectCode('INVALID_STORYSHIP_RECEIPT'));
});
