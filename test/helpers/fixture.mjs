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
