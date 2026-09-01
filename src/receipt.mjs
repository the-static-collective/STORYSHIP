import { canonicalStringify, deepFreezeJson, hashCanonical } from './canonical.mjs';
const CHECKPOINT_SCHEMA='storyship/checkpoint-receipt/v0';
const CROSSING_SCHEMA='storyship/crossing-receipt/v0';
function fail(msg){const e=new TypeError(msg);e.code='INVALID_STORYSHIP_RECEIPT';throw e;}
function ensureObject(v,l){if(!v||typeof v!=='object'||Array.isArray(v))fail(`${l} must be object`);return v;}
function ensureArray(v,l){if(!Array.isArray(v))fail(`${l} must be array`);return v;}
function ensureString(v,l){if(typeof v!=='string'||!v)fail(`${l} must be non-empty`);return v;}
function ensureInt(v,l){if(!Number.isInteger(v)||v<0)fail(`${l} must be non-negative integer`);return v;}
function makeId(body,idKey){return deepFreezeJson({...body,[idKey]:hashCanonical(body)});}
export function createCheckpointReceipt(input){
  if(Object.hasOwn(input,'authority')||Object.hasOwn(input,'checkpoint_receipt_id')) fail('checkpoint derived fields are not caller input');
  const body={schema:CHECKPOINT_SCHEMA,constitution_id:ensureString(input.constitution_id,'constitution_id'),voyage_id:ensureString(input.voyage_id,'voyage_id'),event_cut:ensureInt(input.event_cut,'event_cut'),replay_id:ensureString(input.replay_id,'replay_id'),packet_id:ensureString(input.packet_id,'packet_id'),previous_receipt_ids:ensureArray(input.previous_receipt_ids,'previous_receipt_ids'),authority:'receipt-only'};
  return makeId(body,'checkpoint_receipt_id');
}
export function validateCheckpointReceipt(receipt){
  const expected=createCheckpointReceipt({constitution_id:receipt.constitution_id,voyage_id:receipt.voyage_id,event_cut:receipt.event_cut,replay_id:receipt.replay_id,packet_id:receipt.packet_id,previous_receipt_ids:receipt.previous_receipt_ids});
  if(receipt.schema!==CHECKPOINT_SCHEMA||canonicalStringify(receipt)!==canonicalStringify(expected)) fail('checkpoint receipt invalid');
  return true;
}
export function createCrossingReceipt(input){
  if(Object.hasOwn(input,'destination_status')||Object.hasOwn(input,'crossing_receipt_id')||Object.hasOwn(input,'authority')) fail('derived crossing fields are not caller input');
  ensureInt(input.actual_credit_debit,'actual_credit_debit'); ensureInt(input.event_cut,'event_cut');
  if(input.customs_receipt_ref!==null){ensureObject(input.customs_receipt_ref,'customs_receipt_ref');ensureString(input.customs_receipt_ref.owning_world,'customs owning_world');ensureString(input.customs_receipt_ref.source_cut_id,'customs source_cut_id');}
  const body={schema:CROSSING_SCHEMA,
    constitution_id:ensureString(input.constitution_id,'constitution_id'),voyage_id:ensureString(input.voyage_id,'voyage_id'),branch_id:ensureString(input.branch_id,'branch_id'),parent_state_ids:ensureArray(input.parent_state_ids,'parent_state_ids'),input_packet_id:ensureString(input.input_packet_id,'input_packet_id'),event_cut:input.event_cut,source_cut_ids:ensureArray(input.source_cut_ids,'source_cut_ids'),request_identity:ensureString(input.request_identity,'request_identity'),provider_visible_fields:ensureObject(input.provider_visible_fields,'provider_visible_fields'),observed_sibling_artifact_ids:ensureArray(input.observed_sibling_artifact_ids,'observed_sibling_artifact_ids'),actual_credit_debit:input.actual_credit_debit,encounter_id:ensureString(input.encounter_id,'encounter_id'),selector_receipt_id:ensureString(input.selector_receipt_id,'selector_receipt_id'),selection_outcome:ensureString(input.selection_outcome,'selection_outcome'),appended_event_ids:ensureArray(input.appended_event_ids,'appended_event_ids'),resulting_branch_heads:ensureArray(input.resulting_branch_heads,'resulting_branch_heads'),projection_ids:ensureObject(input.projection_ids,'projection_ids'),projector_versions:ensureObject(input.projector_versions,'projector_versions'),canonicalization_policy:ensureString(input.canonicalization_policy,'canonicalization_policy'),execution_environment:ensureObject(input.execution_environment,'execution_environment'),unresolved_residue:ensureArray(input.unresolved_residue,'unresolved_residue'),refused_residue:ensureArray(input.refused_residue,'refused_residue'),dormant_residue:ensureArray(input.dormant_residue,'dormant_residue'),previous_receipt_ids:ensureArray(input.previous_receipt_ids,'previous_receipt_ids'),customs_receipt_ref:input.customs_receipt_ref,
    destination_status:input.customs_receipt_ref===null?'unadmitted':'customs-receipt-linked',authority:'receipt-only'};
  return makeId(body,'crossing_receipt_id');
}
export function validateCrossingReceipt(receipt){
  const {schema,destination_status,authority,crossing_receipt_id,...input}=receipt;
  const expected=createCrossingReceipt(input);
  if(schema!==CROSSING_SCHEMA||destination_status!==expected.destination_status||authority!=='receipt-only'||crossing_receipt_id!==expected.crossing_receipt_id||canonicalStringify(receipt)!==canonicalStringify(expected)) fail('crossing receipt invalid');
  return true;
}
