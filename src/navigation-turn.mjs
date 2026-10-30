// STORYSHIP NAVIGATION-TURN-001 — read-only narrative-justice projection.
// Historical event truth is still owned by replayStoryship. This is a local
// interpretation lens, never a writer, selector, permission engine or publisher.
import { deepFreezeJson, hashCanonical } from './canonical.mjs';
import { replayStoryship } from './replay.mjs';

const SCHEMA = 'storyship/navigation-turn/v0';
const CHOICES = Object.freeze(['HOLD', 'EXPLORE_ANOTHER_READING', 'DECLINE', 'PROPOSE_FOR_HUMAN_REVIEW']);
function fail(message) {
  const error = new TypeError(message);
  error.code = 'INVALID_STORYSHIP_NAVIGATION';
  throw error;
}
function bounded(value, label, limit = 500) {
  if (typeof value !== 'string' || !value.trim() || value.length > limit) fail(label + ' must be bounded nonempty text');
  return value.trim();
}
function plain(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}

/**
 * A navigation turn is only an observer-local proposal. It cannot authorize
 * a person, publish testimony, record an actual human decision, or create a
 * voyage event. The caller must separately obtain authority for those acts.
 */
export function projectNavigationTurn({ constitution, events, cut, navigator, interpretations, heldSilence = false }) {
  if (!plain(navigator)) fail('navigator declaration required');
  if (navigator.disclosure !== 'REVIEW_ONLY' && navigator.disclosure !== 'WITHHELD') fail('disclosure must be REVIEW_ONLY or WITHHELD');
  if (typeof heldSilence !== 'boolean') fail('heldSilence must be boolean');
  if (!Array.isArray(events)) fail('events must be the source-owned voyage events');
  if (!Array.isArray(interpretations) || interpretations.length < 2 || interpretations.length > 8) fail('need two to eight rival readings');
  // replayStoryship validates event identity and the exact historical cut.
  const replay = replayStoryship({ constitution, events, cut });
  const eligible = new Set(events.filter(event => event.event_seq <= cut).map(event => event.event_id));
  if (eligible.size !== cut) fail('duplicate or incomplete event cut');
  const keys = new Set();
  const rivalReadings = interpretations.map(reading => {
    if (!plain(reading)) fail('reading must be an object');
    const key = bounded(reading.key, 'reading key', 64);
    const text = bounded(reading.text, 'reading text', 800);
    if (keys.has(key)) fail('readings must remain independently identified');
    keys.add(key);
    if (!Array.isArray(reading.basis_event_ids) || !reading.basis_event_ids.length) fail('reading must cite evidence events');
    const basis = reading.basis_event_ids.map(id => {
      if (typeof id !== 'string' || !eligible.has(id)) fail('reading cites an unobserved or future event');
      return id;
    });
    if (new Set(basis).size !== basis.length) fail('duplicated basis event');
    return { key, text, basis_event_ids: basis, classification: 'INTERPRETATION_NOT_OBSERVATION' };
  });
  const question = navigator.disclosure === 'REVIEW_ONLY' && !heldSilence
    ? bounded(navigator.question, 'navigator question', 500)
    : null;
  // Protected silence is an instruction to omit, not an open invitation.
  // Every output is REVIEW_ONLY, regardless of how eloquent the reading is.
  const body = {
    schema: SCHEMA,
    voyage_id: replay.voyage_id,
    event_cut: replay.event_cut,
    replay_id: replay.replay_id,
    source_event_id: replay.tip_event_id,
    source_cut_ids: replay.source_cut_ids,
    reality_projection_id: replay.projections.reality.projection_id,
    narrative_projection_id: replay.projections.narrative.projection_id,
    lookout: { observation: 'SOURCE_OWNED_REPLAY_ONLY', source_cut_ids: replay.source_cut_ids },
    logbook: { event_cut: cut, tip_event_id: replay.tip_event_id, historical_rewrite: false },
    chartroom: { branch_heads: replay.projections.branch_heads.value, dormant_branches: replay.projections.dormant_branches.value },
    narrative_deck: rivalReadings,
    compass: { question, disclosure: navigator.disclosure, silence: heldSilence || navigator.disclosure === 'WITHHELD' ? 'PROTECTED' : 'NOT_DECLARED', selected_reading: null },
    horizon: { open_berth: replay.projections.open_berth.value, protected_silence_is_open_berth: false },
    helm: { choices: CHOICES, decision: 'NOT_RECORDED', actor_authority: 'HUMAN_ONLY' },
    harbor: { crossing: 'NOT_ATTEMPTED', arrival: 'NOT_OBSERVED', destination_admission: 'NOT_REQUESTED' },
    historical_events_added: 0,
    admission: 'NONE',
    publication: 'NONE',
    operator_claim: 'SYNTHETIC_OR_OPERATOR_DECLARED_NOT_INDEPENDENTLY_VERIFIED',
  };
  return deepFreezeJson({ ...body, navigation_id: hashCanonical(body) });
}
