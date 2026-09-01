import test from 'node:test';
import assert from 'node:assert/strict';
import { hashCanonical } from '../src/canonical.mjs';
import { createConstitutionReceipt, admitSourceCut } from '../src/contract.mjs';
import { createStoryshipEvent, appendStoryshipEvent, verifyStoryshipLedger, validateStoryshipEvent } from '../src/ledger.mjs';
import { SHA, FOUNDING_CONSTITUTION_INPUT, SOURCE_CUT_INPUT, makeEventInput } from './helpers/fixture.mjs';
const expectCode = code => error => error?.code === code;
const base = () => ({constitution:createConstitutionReceipt(FOUNDING_CONSTITUTION_INPUT), sourceCut:admitSourceCut(SOURCE_CUT_INPUT)});

test('append is immutable and event_seq is the only ledger order', () => {
  const {constitution,sourceCut}=base();
  const one=appendStoryshipEvent([],makeEventInput({constitutionId:constitution.constitution_id,sourceCut:[sourceCut],eventSeq:1,recordedAt:'2026-08-31T12:10:00.000Z'}));
  const snapshot=JSON.stringify(one);
  const two=appendStoryshipEvent(one,makeEventInput({constitutionId:constitution.constitution_id,sourceCut:[sourceCut],eventSeq:2,eventType:'interpretation-recorded',occurredAtSourceRaw:'1999-ish/provider-local',observedAt:'2026-08-31T11:00:00.000Z',recordedAt:'2026-08-31T11:00:01.000Z',payload:{text:'late-discovered earlier occurrence'}}));
  assert.equal(JSON.stringify(one),snapshot); assert.equal(two[1].event_seq,2); assert.equal(verifyStoryshipLedger({constitution,events:two}).event_count,2);
});

test('narrative cannot overwrite reality', () => {
  const {constitution,sourceCut}=base();
  const attack={interpretation_id:'cleanup',text:'cleaner story',basis_event_ids:[SHA('1')],authority_scope:'human-interpretation',replaces_reality_record_id:'raw-1'};
  assert.throws(()=>createStoryshipEvent(makeEventInput({constitutionId:constitution.constitution_id,sourceCut:[sourceCut],narrativeInterpretations:[attack]})),expectCode('INVALID_STORYSHIP_EVENT'));
});

test('provider artifact identity binds provider identity and bytes', () => {
  const {constitution,sourceCut}=base(); const provider_identity='provider-artifact-a'; const content_digest=SHA('c');
  const artifact_id=hashCanonical({provider_identity,content_digest});
  const event=createStoryshipEvent(makeEventInput({constitutionId:constitution.constitution_id,sourceCut:[sourceCut],eventType:'generation-observed',payload:{request_event_id:SHA('d'),artifact:{artifact_id,provider_identity,content_digest},branch_effects:[{branch_id:'branch-a',parent_branch_ids:['branch-root'],status:'live'}]}}));
  assert.equal(event.payload.artifact.artifact_id,artifact_id); assert.equal(validateStoryshipEvent(event),true);
});

test('ledger rejects sequence gaps and mixed voyage', () => {
  const {constitution,sourceCut}=base();
  assert.throws(()=>appendStoryshipEvent([],makeEventInput({constitutionId:constitution.constitution_id,sourceCut:[sourceCut],eventSeq:2})),expectCode('INVALID_STORYSHIP_LEDGER'));
  const first=createStoryshipEvent(makeEventInput({constitutionId:constitution.constitution_id,sourceCut:[sourceCut]}));
  const second=createStoryshipEvent(makeEventInput({constitutionId:constitution.constitution_id,sourceCut:[sourceCut],eventSeq:2,voyageId:'other',eventType:'interpretation-recorded'}));
  assert.throws(()=>verifyStoryshipLedger({constitution,events:[first,second]}),expectCode('INVALID_STORYSHIP_LEDGER'));
});
