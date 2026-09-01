import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalStringify, hashCanonical, deepFreezeJson } from '../src/canonical.mjs';
import { sealTransferPacket, validateTransferPacket } from '../src/packet.mjs';
import { replayStoryship } from '../src/replay.mjs';
import { appendStoryshipEvent } from '../src/ledger.mjs';
import { makeTwinVoyageFixture, makeEventInput } from './helpers/fixture.mjs';
const expectCode = code => error => error?.code === code;

function packetReplay() {
  const {constitution, events} = makeTwinVoyageFixture();
  return replayStoryship({constitution,events,cut:events.length});
}

test('packet binds REALITY, MEMORY, and OPEN BERTH at one cut', () => {
  const replay=packetReplay(); const packet=sealTransferPacket({replay,packet_label:'000'});
  assert.equal(packet.schema,'storyship/packet/v0');
  assert.equal(packet.event_cut,replay.event_cut);
  assert.equal(packet.reality_projection_id,replay.projections.reality.projection_id);
  assert.equal(packet.memory.manifest_projection_id,replay.projections.manifest.projection_id);
  assert.equal(validateTransferPacket(packet,replay),true);
});

test('later append does not mutate an older sealed cut', () => {
  const {constitution, events}=makeTwinVoyageFixture();
  const cut=events.length; const before=replayStoryship({constitution,events,cut});
  const later=appendStoryshipEvent(events,makeEventInput({constitutionId:constitution.constitution_id,sourceCut:events[0].source_cut,eventSeq:cut+1,eventType:'interpretation-recorded',payload:{text:'later'}}));
  const after=replayStoryship({constitution,events:later,cut});
  assert.equal(canonicalStringify(sealTransferPacket({replay:before,packet_label:'000'})),canonicalStringify(sealTransferPacket({replay:after,packet_label:'000'})));
});

test('protected silence cannot become OPEN BERTH', () => {
  const replay=packetReplay();
  const attack=structuredClone(replay);
  const effect={kind:'open-berth',effect_id:'berth-attack',status:'open',question_or_possibility:'unknown passenger',source_class:'protected silence',basis_event_ids:[],allowed_scope:'fixture',explicit_non_imports:[],opened_by:'operator'};
  const body={schema:'storyship/projection/v0',voyage_id:attack.voyage_id,event_cut:attack.event_cut,projector:'open_berth',projector_version:'v0',value:[effect]};
  attack.projections.open_berth=deepFreezeJson({...body,projection_id:hashCanonical(body)});
  assert.throws(()=>sealTransferPacket({replay:attack,packet_label:'000'}),expectCode('FORBIDDEN_OPEN_BERTH_IMPORT'));
});

test('tampered packet fails validation', () => {
  const replay=packetReplay(); const packet=sealTransferPacket({replay,packet_label:'000'}); const bad=structuredClone(packet); bad.event_cut += 1;
  assert.throws(()=>validateTransferPacket(bad,replay),expectCode('INVALID_STORYSHIP_PACKET'));
});
