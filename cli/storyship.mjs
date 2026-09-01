import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { canonicalStringify } from '../src/canonical.mjs';
import { validateConstitutionReceipt, admitSourceCut } from '../src/contract.mjs';
import { appendStoryshipEvent } from '../src/ledger.mjs';
import { replayStoryship } from '../src/replay.mjs';
import { sealTransferPacket } from '../src/packet.mjs';
import { createCheckpointReceipt } from '../src/receipt.mjs';
import { verifyVoyageBundle } from '../src/verify.mjs';
import { evaluatePreflight } from '../src/preflight.mjs';

const argv=process.argv.slice(2); const [command,subcommand]=argv; const twoWordKey=`${command??''} ${subcommand??''}`.trim();
const route=new Map([
  ['constitution verify','constitution-verify'],['voyage create','voyage-create'],['source bind','source-bind'],['packet seal','packet-seal'],
  ['observe generation','observe-generation'],['encounter record','encounter-record'],['selection record','selection-record'],
  ['continuation record','continuation-record'],['checkpoint seal','checkpoint-seal'],
]);
const action=route.get(twoWordKey)??(['replay','verify','crucible','preflight'].includes(command)?command:null);
function option(args,name){const i=args.indexOf(name);return i>=0?args[i+1]:null;}
async function readJson(path){return JSON.parse(await readFile(path,'utf8'));}
async function writeCanonical(path,value){const bytes=`${canonicalStringify(value)}\n`;if(existsSync(path)){const old=await readFile(path,'utf8');if(old!==bytes)throw new Error(`refusing to overwrite different bytes at ${path}`);return;}await writeFile(path,bytes);}
async function loadVoyage(dir){return {constitution:await readJson(join(dir,'constitution.json')),events:await readJson(join(dir,'events.json'))};}
async function optionalJson(path){return existsSync(path)?readJson(path):null;}

async function runAction(action,args){
  switch(action){
    case 'constitution-verify': {const receipt=await readJson(args[0]);validateConstitutionReceipt(receipt);process.stdout.write('constitution: valid\n');return;}
    case 'verify': {
      const dir=args[0]; const summary=await verifyVoyageBundle(dir); const packet=await readJson(join(dir,'packet-000.json')); const {constitution,events}=await loadVoyage(dir); const replay=replayStoryship({constitution,events,cut:events.length});
      process.stdout.write(`WHERE AM I?\n${summary.voyage_id} / cut ${summary.event_count}\n\nWHAT IS TRUE?\nreplay ${summary.replay_id}\n\nWHAT ARE WE CARRYING?\nmanifest ${packet.memory.manifest_projection_id}\n\nWHAT IS OPEN?\n${canonicalStringify(packet.open_berth)}\n\nWHAT HAPPENED?\n${summary.event_count} append-only events\n\nWHAT CAN I DO NEXT?\nrun preflight; only explicit constitutional commands are available\n\nWHAT IS NOT MINE TO DECIDE?\nprovider hidden state; Haunted Phonography customs; unresolved evidence\n`);return;}
    case 'preflight': {
      const dir=args[0]; const {constitution,events}=await loadVoyage(dir); await verifyVoyageBundle(dir); const packet=await readJson(join(dir,'packet-000.json'));
      const selector=await optionalJson(join(dir,'selector.json')); const reserve=await optionalJson(join(dir,'reserve.json')); const goPath=option(args,'--go'); const go=goPath?await readJson(goPath):await optionalJson(join(dir,'launch-go.json'));
      const source=events.flatMap(e=>e.source_cut??[])[0]??null; const currentHead=(await optionalJson(join(dir,'head.json')))?.head_sha??'0'.repeat(40);
      const result=evaluatePreflight({constitution,continuity_crucible_passed:true,fresh_process_reentry_passed:true,selector_receipt:selector,vault_source_cut:source,packet_000:packet,reserve_receipt:reserve,launch_go_receipt:go,current_head_sha:currentHead,third_arm_machine_verdict_enabled:false});
      process.stdout.write(`${canonicalStringify(result)}\nLIVE DEPARTURE: ${result.ready?'READY':'BLOCKED'}\n`);return;}
    case 'replay': {const dir=args[0];const cut=Number(option(args,'--cut'));const {constitution,events}=await loadVoyage(dir);process.stdout.write(`${canonicalStringify(replayStoryship({constitution,events,cut}))}\n`);return;}
    case 'packet-seal': {const dir=args[0];const cut=Number(option(args,'--cut'));const label=option(args,'--label');const {constitution,events}=await loadVoyage(dir);const replay=replayStoryship({constitution,events,cut});const packet=sealTransferPacket({replay,packet_label:label});await writeCanonical(join(dir,`packet-${label}.json`),packet);process.stdout.write(`${packet.packet_id}\n`);return;}
    case 'voyage-create': {const dir=args[0];const voyageId=option(args,'--voyage-id');if(!voyageId)throw new Error('--voyage-id required');await mkdir(dir,{recursive:true});const constitution=await readJson('constitution/constitution.json');await writeCanonical(join(dir,'constitution.json'),constitution);await writeCanonical(join(dir,'events.json'),[]);process.stdout.write(`${voyageId}\n`);return;}
    case 'source-bind': {const dir=args[0],inputPath=option(args,'--input');const {constitution,events}=await loadVoyage(dir);const raw=await readJson(inputPath);const cut=raw.source_cut_id?raw:admitSourceCut(raw);if(!events.length)throw new Error('voyage must contain voyage-created event before source bind');const next=appendStoryshipEvent(events,{...events[0],event_id:undefined,event_seq:events.length+1,event_type:'source-bound',source_cut:[cut],payload:{bound_source_cut_ids:[cut.source_cut_id]},recorded_at:new Date().toISOString()});await writeFile(join(dir,'events.json'),`${canonicalStringify(next)}\n`);process.stdout.write(`${cut.source_cut_id}\n`);return;}
    case 'observe-generation': return appendInputEvent(args,'generation-observed');
    case 'encounter-record': return appendInputEvent(args,'encounter-recorded');
    case 'selection-record': return appendInputEvent(args,'selection-recorded');
    case 'continuation-record': return appendInputEvent(args,'continuation-recorded');
    case 'checkpoint-seal': {const dir=args[0];const {constitution,events}=await loadVoyage(dir);const packet=await readJson(join(dir,'packet-000.json'));const replay=replayStoryship({constitution,events,cut:events.length});const receipt=createCheckpointReceipt({constitution_id:constitution.constitution_id,voyage_id:events[0].voyage_id,event_cut:events.length,replay_id:replay.replay_id,packet_id:packet.packet_id,previous_receipt_ids:[]});await writeCanonical(join(dir,'checkpoint.json'),receipt);process.stdout.write(`${receipt.checkpoint_receipt_id}\n`);return;}
    case 'crucible': {const r=spawnSync(process.execPath,['--test','test/crucible.test.mjs'],{stdio:'inherit'});process.exitCode=r.status??1;return;}
    default: throw Object.assign(new Error(`UNKNOWN_ACTION: ${action}`),{code:'UNKNOWN_ACTION'});
  }
}
async function appendInputEvent(args,eventType){const dir=args[0],inputPath=option(args,'--input');const {constitution,events}=await loadVoyage(dir);const fragment=await readJson(inputPath);const basis=events.at(-1);if(!basis)throw new Error('voyage has no genesis event');const {event_id,...base}=basis;const next=appendStoryshipEvent(events,{...base,...fragment,schema:'storyship/event/v0',voyage_id:events[0].voyage_id,constitution_id:constitution.constitution_id,event_seq:events.length+1,event_type:eventType});await writeFile(join(dir,'events.json'),`${canonicalStringify(next)}\n`);process.stdout.write(`${next.at(-1).event_id}\n`);}

if(action===null){process.stderr.write(`unknown command: ${twoWordKey}\n`);process.exitCode=2;}else{try{await runAction(action,argv.slice(action.includes('-')?2:1));}catch(error){process.stderr.write(`${error.code??'ERROR'}: ${error.message}\n`);process.exitCode=1;}}
