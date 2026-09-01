import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalStringify, hashCanonical, deepFreezeJson } from '../src/canonical.mjs';
import { createStoryshipResult, createConstitutionReceipt, admitSourceCut } from '../src/contract.mjs';
import { createStoryshipEvent, appendStoryshipEvent } from '../src/ledger.mjs';
import { replayStoryship } from '../src/replay.mjs';
import { sealTransferPacket, validateTransferPacket } from '../src/packet.mjs';
import { createCrossingReceipt } from '../src/receipt.mjs';
import { SHA, FOUNDING_CONSTITUTION_INPUT, SOURCE_CUT_INPUT, makeEventInput, makeTwinVoyageFixture, makeSameBytesTwinFixture, makeUnselectedTwinFixture } from './helpers/fixture.mjs';
const expectCode = code => error => error?.code === code;
function packetPair(){const {constitution,events}=makeTwinVoyageFixture();const replay=replayStoryship({constitution,events,cut:events.length});return {replay,packet:sealTransferPacket({replay,packet_label:'000'})};}

test('01 replay and re-entry', () => {
  const {constitution,events}=makeTwinVoyageFixture();
  const a=replayStoryship({constitution,events,cut:events.length});
  const b=replayStoryship({constitution:structuredClone(constitution),events:structuredClone(events),cut:events.length});
  assert.equal(canonicalStringify(a),canonicalStringify(b));
});

test('02 stale cut', () => {
  const {constitution,events}=makeTwinVoyageFixture(); const cut=events.length;
  const before=replayStoryship({constitution,events,cut});
  const later=appendStoryshipEvent(events,makeEventInput({constitutionId:constitution.constitution_id,sourceCut:events[0].source_cut,eventSeq:cut+1,eventType:'interpretation-recorded',payload:{text:'later'}}));
  const after=replayStoryship({constitution,events:later,cut});
  assert.equal(canonicalStringify(sealTransferPacket({replay:before,packet_label:'000'})),canonicalStringify(sealTransferPacket({replay:after,packet_label:'000'})));
});

test('03 twin branch preservation', () => {
  const {constitution,events}=makeTwinVoyageFixture(); const replay=replayStoryship({constitution,events,cut:events.length});
  assert.deepEqual(replay.projections.branch_heads.value.map(x=>[x.branch_id,x.status]),[['branch-a','live'],['branch-b','dormant']]);
});

test('04 ambiguous heads', () => {
  const {constitution,events}=makeUnselectedTwinFixture(); const replay=replayStoryship({constitution,events,cut:events.length});
  assert.equal(replay.currentness,'unresolved');
});

test('05 history reinterpretation', () => {
  const {constitution,events}=makeTwinVoyageFixture(); const old=replayStoryship({constitution,events,cut:events.length});
  const extended=appendStoryshipEvent(events,makeEventInput({constitutionId:constitution.constitution_id,sourceCut:events[0].source_cut,eventSeq:events.length+1,eventType:'interpretation-recorded',narrativeInterpretations:[{interpretation_id:'n2',text:'later reading',basis_event_ids:[events[0].event_id],authority_scope:'human-interpretation'}]}));
  const sameCut=replayStoryship({constitution,events:extended,cut:events.length});
  assert.equal(old.projections.narrative.projection_id,sameCut.projections.narrative.projection_id);
});

test('06 protected-silence attack', () => {
  const {replay}=packetPair(); const attack=structuredClone(replay);
  const effect={kind:'open-berth',effect_id:'attack',status:'open',question_or_possibility:'x',source_class:'protected silence',basis_event_ids:[],allowed_scope:'fixture',explicit_non_imports:[],opened_by:'operator'};
  const body={schema:'storyship/projection/v0',voyage_id:attack.voyage_id,event_cut:attack.event_cut,projector:'open_berth',projector_version:'v0',value:[effect]};
  attack.projections.open_berth=deepFreezeJson({...body,projection_id:hashCanonical(body)});
  assert.throws(()=>sealTransferPacket({replay:attack,packet_label:'000'}),expectCode('FORBIDDEN_OPEN_BERTH_IMPORT'));
});

test('07 narrative overwrite attack', () => {
  const constitution=createConstitutionReceipt(FOUNDING_CONSTITUTION_INPUT); const sourceCut=admitSourceCut(SOURCE_CUT_INPUT);
  assert.throws(()=>createStoryshipEvent(makeEventInput({constitutionId:constitution.constitution_id,sourceCut:[sourceCut],narrativeInterpretations:[{interpretation_id:'x',text:'rewrite',basis_event_ids:[],authority_scope:'human',replaces_reality_record_id:'raw-1'}]})),expectCode('INVALID_STORYSHIP_EVENT'));
});

test('08 relationship-carrier confusion', () => {
  const digest=SHA('c'); const original={provider_identity:'provider-a',content_digest:digest}; const lookalike={provider_identity:'provider-b',content_digest:digest};
  original.artifact_id=hashCanonical(original); lookalike.artifact_id=hashCanonical(lookalike);
  assert.equal(original.content_digest,lookalike.content_digest); assert.notEqual(original.artifact_id,lookalike.artifact_id);
  const result=createStoryshipResult({result:'unresolved',target:'lineage_claim',basis_event_ids:[],reason_codes:['same-bytes-without-attributable-road']});
  assert.equal(result.result,'unresolved');
});

test('09 abstraction counterexample', () => {
  const result=createStoryshipResult({result:'refuses',target:'observation_method',basis_event_ids:[],reason_codes:['fixture-method-failed']});
  assert.equal(result.target,'observation_method'); assert.notEqual(result.target,'continuity_law');
});

test('10 customs boundary', () => {
  const receipt=createCrossingReceipt({constitution_id:SHA('a'),voyage_id:'v',branch_id:'a',parent_state_ids:[],input_packet_id:SHA('b'),event_cut:1,source_cut_ids:[],request_identity:'r',provider_visible_fields:{},observed_sibling_artifact_ids:[],actual_credit_debit:0,encounter_id:'e',selector_receipt_id:SHA('c'),selection_outcome:'hold',appended_event_ids:[],resulting_branch_heads:[],projection_ids:{},projector_versions:{},canonicalization_policy:'storyship-canonical-json-v1',execution_environment:{},unresolved_residue:[],refused_residue:[],dormant_residue:[],previous_receipt_ids:[],customs_receipt_ref:null});
  assert.equal(receipt.destination_status,'unadmitted');
});

test('11 tamper evidence', () => {
  const {packet,replay}=packetPair(); const tampered=structuredClone(packet); tampered.event_cut += 1;
  assert.throws(()=>validateTransferPacket(tampered,replay),expectCode('INVALID_STORYSHIP_PACKET'));
});
