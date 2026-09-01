import test from 'node:test';
import assert from 'node:assert/strict';
import { createConstitutionReceipt, admitSourceCut, createSelectorReceipt, createReserveReceipt, createLaunchGoReceipt } from '../src/contract.mjs';
import { sealTransferPacket } from '../src/packet.mjs';
import { replayStoryship } from '../src/replay.mjs';
import { evaluatePreflight } from '../src/preflight.mjs';
import { FOUNDING_CONSTITUTION_INPUT, SOURCE_CUT_INPUT, makeTwinVoyageFixture, SHA } from './helpers/fixture.mjs';

function baseInput(){
  const constitution=createConstitutionReceipt(FOUNDING_CONSTITUTION_INPUT);
  const {events}=makeTwinVoyageFixture(); const replay=replayStoryship({constitution,events,cut:events.length}); const packet=sealTransferPacket({replay,packet_label:'000'});
  const selector=createSelectorReceipt({mechanism_id:'selector-live',recovery_status:'recovered',evidence_refs:['source:real'],operator_inputs_visible:['siblings'],allowed_outcomes:['continue-a','continue-b','hold-both','stop'],non_selected_treatment:'dormant',unresolved_notes:[]});
  const reserve=createReserveReceipt({observed_available_credits:1000,protected_reserve_credits:100,observed_at:'2026-09-01T00:00:00Z',basis_ref:'human:balance'});
  const vault=admitSourceCut({...SOURCE_CUT_INPUT,stable_locator:'vault://raw/track-001',content_digest_when_available:SHA('9')});
  const head='a'.repeat(40); const go=createLaunchGoReceipt({launch_candidate_head_sha:head,packet_id:packet.packet_id,reserve_receipt_id:reserve.reserve_receipt_id,selector_receipt_id:selector.selector_receipt_id,approved_by:'human:operator',approved_at:'2026-09-01T00:01:00Z'});
  return {constitution,continuity_crucible_passed:true,fresh_process_reentry_passed:true,selector_receipt:selector,vault_source_cut:vault,packet_000:packet,reserve_receipt:reserve,launch_go_receipt:go,current_head_sha:head,third_arm_machine_verdict_enabled:false};
}

test('fixture source never authorizes live spend', () => {
  const input=baseInput(); input.vault_source_cut=admitSourceCut(SOURCE_CUT_INPUT);
  const result=evaluatePreflight(input); assert.equal(result.ready,false); assert.equal(result.gates.real_vault_source.state,'fail');
});

test('partial selector remains unresolved', () => {
  const input=baseInput(); input.selector_receipt=createSelectorReceipt({mechanism_id:'selector-partial',recovery_status:'partial',evidence_refs:['source:one'],operator_inputs_visible:['siblings'],allowed_outcomes:['continue-a','continue-b'],non_selected_treatment:'dormant',unresolved_notes:['cadence unknown']});
  const result=evaluatePreflight(input); assert.equal(result.gates.historical_selector.state,'unresolved'); assert.equal(result.ready,false);
});

test('GO must match exact current head and packet identities', () => {
  const input=baseInput(); input.current_head_sha='f'.repeat(40);
  const result=evaluatePreflight(input); assert.equal(result.gates.human_go.state,'fail'); assert.equal(result.ready,false);
});

test('third-arm machine verdict capability blocks launch', () => {
  const input=baseInput(); input.third_arm_machine_verdict_enabled=true;
  const result=evaluatePreflight(input); assert.equal(result.gates.third_arm_nonclaim.state,'fail'); assert.equal(result.ready,false);
});

test('all exact gates can pass only when every boundary is satisfied', () => {
  const result=evaluatePreflight(baseInput()); assert.equal(result.ready,true); assert(Object.values(result.gates).every(g=>g.state==='pass'));
});
