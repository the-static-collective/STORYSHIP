export const SHA = ch => `sha256:${ch.repeat(64).slice(0, 64)}`;
export const FOUNDING_CONSTITUTION_INPUT = Object.freeze({
  owner_repository: 'the-static-collective/STORYSHIP',
  owner_head_sha: '6a941263363c43b47c7e1803cb8d825bd59efcb1',
  ordered_constitutive_paths: Object.freeze(['docs/superpowers/specs/2026-08-31-storyship-launch-keel-design.md']),
  blob_sha_for_each_path: Object.freeze({'docs/superpowers/specs/2026-08-31-storyship-launch-keel-design.md':'c52c3dd93b537cc0798cae4b8be42c01f3d5d5dd'})
});
export const SOURCE_CUT_INPUT = Object.freeze({
  owning_world: 'autodiscography-vault', stable_locator: 'fixture://vault/000',
  revision_or_provider_identity: 'vault-revision-000', content_digest_when_available: SHA('a'),
  acquisition_time: '2026-08-31T00:00:00.000Z', availability_status: 'available', evidence_class: 'raw-owner-evidence'
});

export function makeEventInput({
  constitutionId, sourceCut = [], voyageId='storyship-voyage-000', eventSeq=1,
  eventType='voyage-created', branchId='branch-root', parentStateIds=[],
  actor={owning_world:'human',actor_id:'operator-000',role:'operator'}, occurredAtSourceRaw=null,
  observedAt='2026-08-31T12:00:01.000Z', recordedAt='2026-08-31T12:00:02.000Z', payload={},
  realityEffects=[], narrativeInterpretations=[], manifestEffects=[], uncertainty=[],
  authority={owning_world:'storyship',scope:'fixture-only'}, previousReceiptIds=[]
}={}) {
  return {schema:'storyship/event/v0',voyage_id:voyageId,event_seq:eventSeq,event_type:eventType,branch_id:branchId,
    parent_state_ids:parentStateIds,constitution_id:constitutionId,source_cut:sourceCut,actor,
    occurred_at_source_raw:occurredAtSourceRaw,observed_at:observedAt,recorded_at:recordedAt,payload,
    reality_effects:realityEffects,narrative_interpretations:narrativeInterpretations,manifest_effects:manifestEffects,
    uncertainty,authority,previous_receipt_ids:previousReceiptIds};
}

import { createConstitutionReceipt, admitSourceCut } from '../../src/contract.mjs';
import { appendStoryshipEvent } from '../../src/ledger.mjs';
import { hashCanonical } from '../../src/canonical.mjs';

function fixtureBase() {
  return { constitution: createConstitutionReceipt(FOUNDING_CONSTITUTION_INPUT), sourceCut: admitSourceCut(SOURCE_CUT_INPUT) };
}

export function makeTwinVoyageFixture({select=true, sameBytes=false}={}) {
  const {constitution, sourceCut} = fixtureBase();
  let events = [];
  events = appendStoryshipEvent(events, makeEventInput({constitutionId:constitution.constitution_id, sourceCut:[sourceCut], eventSeq:1, eventType:'voyage-created'}));
  const digestA = SHA('1');
  const digestB = sameBytes ? digestA : SHA('2');
  const aProvider='provider-a'; const bProvider='provider-b';
  const artA={provider_identity:aProvider,content_digest:digestA,artifact_id:hashCanonical({provider_identity:aProvider,content_digest:digestA})};
  const artB={provider_identity:bProvider,content_digest:digestB,artifact_id:hashCanonical({provider_identity:bProvider,content_digest:digestB})};
  events = appendStoryshipEvent(events, makeEventInput({constitutionId:constitution.constitution_id, sourceCut:[sourceCut], eventSeq:2, eventType:'generation-observed', branchId:'branch-a', payload:{request_event_id:SHA('a'),artifact:artA,branch_effects:[{branch_id:'branch-a',parent_branch_ids:['branch-root'],status:'live'}]}}));
  events = appendStoryshipEvent(events, makeEventInput({constitutionId:constitution.constitution_id, sourceCut:[sourceCut], eventSeq:3, eventType:'generation-observed', branchId:'branch-b', payload:{request_event_id:SHA('a'),artifact:artB,branch_effects:[{branch_id:'branch-b',parent_branch_ids:['branch-root'],status:'live'}]}}));
  if (select) events = appendStoryshipEvent(events, makeEventInput({constitutionId:constitution.constitution_id, sourceCut:[sourceCut], eventSeq:4, eventType:'selection-recorded', branchId:'branch-a', payload:{mechanism:'selector-fixture',selected_branch_ids:['branch-a'],unselected_branch_ids:['branch-b']}}));
  return {constitution, events};
}
export const makeSameBytesTwinFixture = () => makeTwinVoyageFixture({select:false,sameBytes:true});
export const makeUnselectedTwinFixture = () => makeTwinVoyageFixture({select:false,sameBytes:false});
