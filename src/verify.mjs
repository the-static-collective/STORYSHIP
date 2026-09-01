import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { canonicalStringify, deepFreezeJson } from './canonical.mjs';
import { validateConstitutionReceipt } from './contract.mjs';
import { verifyStoryshipLedger } from './ledger.mjs';
import { replayStoryship } from './replay.mjs';
import { validateTransferPacket } from './packet.mjs';
import { validateCheckpointReceipt } from './receipt.mjs';

async function readJson(path){return JSON.parse(await readFile(path,'utf8'));}
export async function verifyVoyageBundle(directory){
  const constitution=await readJson(join(directory,'constitution.json'));
  const events=await readJson(join(directory,'events.json'));
  const packet=await readJson(join(directory,'packet-000.json'));
  const checkpoint=await readJson(join(directory,'checkpoint.json'));
  validateConstitutionReceipt(constitution);
  const ledger=verifyStoryshipLedger({constitution,events});
  const packetReplay=replayStoryship({constitution,events,cut:packet.event_cut});
  validateTransferPacket(packet,packetReplay);
  const finalReplay=replayStoryship({constitution,events,cut:events.length});
  validateCheckpointReceipt(checkpoint);
  if(checkpoint.replay_id!==finalReplay.replay_id||checkpoint.packet_id!==packet.packet_id||checkpoint.event_cut!==events.length) throw Object.assign(new TypeError('checkpoint does not bind final replay'),{code:'INVALID_STORYSHIP_BUNDLE'});
  return deepFreezeJson({schema:'storyship/verification-summary/v0',voyage_id:ledger.voyage_id,constitution_id:constitution.constitution_id,event_count:ledger.event_count,tip_event_id:ledger.tip_event_id,packet_id:packet.packet_id,checkpoint_receipt_id:checkpoint.checkpoint_receipt_id,replay_id:finalReplay.replay_id,currentness:finalReplay.currentness,branch_heads:finalReplay.projections.branch_heads.value});
}
export async function verifyVoyageBundleCanonical(directory){return canonicalStringify(await verifyVoyageBundle(directory));}
