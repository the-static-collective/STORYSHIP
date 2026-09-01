import { canonicalStringify, deepFreezeJson, hashCanonical } from './canonical.mjs';
import { STORYSHIP_FORBIDDEN_BERTH_CLASSES } from './contract.mjs';

const PACKET_SCHEMA='storyship/packet/v0';
function fail(code,msg){const e=new TypeError(msg);e.code=code;throw e;}
function openBerthFromReplay(replay){
  const effects = replay?.projections?.open_berth?.value;
  if(!Array.isArray(effects)) fail('INVALID_STORYSHIP_PACKET','open berth projection missing');
  for(const effect of effects){
    const candidates=[effect?.source_class,effect?.record_class,effect?.import_class].filter(Boolean);
    if(candidates.some(x=>STORYSHIP_FORBIDDEN_BERTH_CLASSES.includes(x))) fail('FORBIDDEN_OPEN_BERTH_IMPORT',`forbidden OPEN BERTH import: ${candidates.join(',')}`);
  }
  return effects;
}
export function sealTransferPacket({replay,packet_label}){
  if(!replay||typeof replay!=='object'||typeof packet_label!=='string'||!packet_label) fail('INVALID_STORYSHIP_PACKET','invalid packet input');
  const open_berth=openBerthFromReplay(replay);
  const narrative_relation_ids=[...new Set((replay.projections.manifest.value??[]).flatMap(effect=>Array.isArray(effect?.narrative_relation_ids)?effect.narrative_relation_ids:[]))].sort();
  const body={schema:PACKET_SCHEMA,voyage_id:replay.voyage_id,event_cut:replay.event_cut,constitution_id:replay.constitution_id,replay_id:replay.replay_id,reality_projection_id:replay.projections.reality.projection_id,memory:{manifest_projection_id:replay.projections.manifest.projection_id,narrative_relation_ids},open_berth,branch_heads:replay.projections.branch_heads.value,source_cut_ids:replay.source_cut_ids,packet_label};
  return deepFreezeJson({...body,packet_id:hashCanonical(body)});
}
export function validateTransferPacket(packet,replay){
  const expected=sealTransferPacket({replay,packet_label:packet.packet_label});
  if(canonicalStringify(packet)!==canonicalStringify(expected)) fail('INVALID_STORYSHIP_PACKET','packet does not match replay cut');
  return true;
}
