import test from 'node:test';
import assert from 'node:assert/strict';
import { projectNavigationTurn } from '../src/navigation-turn.mjs';
import { makeTwinVoyageFixture } from './helpers/fixture.mjs';
import { replayStoryship } from '../src/replay.mjs';
import { canonicalStringify } from '../src/canonical.mjs';

const scenario = () => {
 const { constitution, events } = makeTwinVoyageFixture();
 const cut = events.length;
 const basis = [events[0].event_id];
 return {constitution, events, cut, navigator:{disclosure:'REVIEW_ONLY',question:'How can a stranger choose a different ending?'}, interpretations:[
  {key:'room', text:'A room is an opportunity to host voluntary participation.', basis_event_ids:basis},
  {key:'boundary', text:'A room could also conceal unequal power; participation must be contestable.', basis_event_ids:basis},
 ]};
};

test('uses the actual source-owned replay at exact cut with two rival readings',()=>{
 const args=scenario();
 const before=canonicalStringify(args.events);
 const native=replayStoryship({constitution:args.constitution,events:args.events,cut:args.cut});
 const nav=projectNavigationTurn(args);
 assert.equal(nav.replay_id,native.replay_id);
 assert.equal(nav.reality_projection_id,native.projections.reality.projection_id);
 assert.deepEqual(nav.chartroom.branch_heads,native.projections.branch_heads.value);
 assert.deepEqual(nav.chartroom.dormant_branches,native.projections.dormant_branches.value);
 assert.equal(nav.narrative_deck.length,2);
 assert.equal(nav.helm.decision,'NOT_RECORDED');
 assert.equal(nav.historical_events_added,0);
 assert.equal(nav.publication,'NONE');
 assert.equal(canonicalStringify(args.events),before);
});
test('cold deterministic read-only projection',()=>{
 const a=scenario();
 const first=projectNavigationTurn(a);
 const copy=structuredClone(a);
 const second=projectNavigationTurn(copy);
 assert.equal(canonicalStringify(first),canonicalStringify(second));
 assert.equal(first.navigation_id,second.navigation_id);
});
test('a later append cannot rewrite earlier-cut navigation',()=>{
 const a=scenario(), old=projectNavigationTurn(a);
 const longer = structuredClone(a);
 longer.events.push({...longer.events.at(-1),event_seq:longer.events.length+1});
 const same = projectNavigationTurn({...longer,cut:a.cut});
 assert.equal(same.navigation_id,old.navigation_id);
});
test('future and invented event references fail closed',()=>{
 const a=scenario();
 a.interpretations[0].basis_event_ids=['sha256:'+'1'.repeat(64)];
 assert.throws(()=>projectNavigationTurn(a),/unobserved or future/);
});
test('withheld question or protected silence never becomes OPEN BERTH',()=>{
 const a=scenario();a.navigator={disclosure:'WITHHELD',question:'PRIVATE_DO_NOT_ECHO_123'};
 const nav=projectNavigationTurn({...a,heldSilence:true});
 assert.equal(nav.compass.question,null);
 assert.equal(nav.compass.silence,'PROTECTED');
 assert.equal(nav.horizon.protected_silence_is_open_berth,false);
 assert.doesNotMatch(JSON.stringify(nav),/PRIVATE_DO_NOT_ECHO_123/);
 assert.equal(nav.publication,'NONE');
});
test('no auto-selection, publication or customs authority from competing readings',()=>{
 const a=scenario(),nav=projectNavigationTurn(a);
 assert.equal(nav.compass.selected_reading,null);
 assert.deepEqual(nav.helm.choices,['HOLD','EXPLORE_ANOTHER_READING','DECLINE','PROPOSE_FOR_HUMAN_REVIEW']);
 assert.equal(nav.harbor.destination_admission,'NOT_REQUESTED');
 assert.equal(nav.harbor.crossing,'NOT_ATTEMPTED');
});
test('reading requires attributable basis and distinct titles',()=>{
 const a=scenario();a.interpretations[0].basis_event_ids=[];
 assert.throws(()=>projectNavigationTurn(a),/cite evidence/);
 const b=scenario();b.interpretations[1].key=b.interpretations[0].key;
 assert.throws(()=>projectNavigationTurn(b),/independently identified/);
});
