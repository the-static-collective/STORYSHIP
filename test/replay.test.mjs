import test from 'node:test';
import assert from 'node:assert/strict';
import { replayStoryship } from '../src/replay.mjs';
import { createStoryshipEvent } from '../src/ledger.mjs';
import { makeTwinVoyageFixture, makeSameBytesTwinFixture, makeUnselectedTwinFixture } from './helpers/fixture.mjs';
const expectCode = code => error => error?.code === code;

test('native twins remain distinct when one becomes dormant', () => {
  const {constitution, events} = makeTwinVoyageFixture();
  const replay = replayStoryship({constitution, events, cut: events.length});
  assert.deepEqual(replay.projections.branch_heads.value.map(x => [x.branch_id, x.status]), [['branch-a','live'],['branch-b','dormant']]);
});

test('same rendering does not collapse worldlines', () => {
  const {constitution, events} = makeSameBytesTwinFixture();
  const replay = replayStoryship({constitution, events, cut: events.length});
  assert.equal(replay.branch_states.filter(x => x.status === 'live' && x.branch_id !== 'branch-root').length, 2);
});

test('multiple live heads remain unresolved', () => {
  const {constitution, events} = makeUnselectedTwinFixture();
  const replay = replayStoryship({constitution, events, cut: events.length});
  assert.equal(replay.currentness, 'unresolved');
});

test('future parent state fails closed', () => {
  const {constitution, events} = makeUnselectedTwinFixture();
  const tampered = [...events];
  const {event_id, ...body} = tampered[1];
  tampered[1] = createStoryshipEvent({...body, parent_state_ids:['sha256:' + 'f'.repeat(64)]});
  assert.throws(() => replayStoryship({constitution,events:tampered,cut:tampered.length}), expectCode('INVALID_STORYSHIP_BRANCH_DAG'));
});
