import { deepFreezeJson, hashCanonical } from './canonical.mjs';
import { validateConstitutionReceipt } from './contract.mjs';
import { validateStoryshipEvent } from './ledger.mjs';

const PROJECTION_SCHEMA = 'storyship/projection/v0';
function fail(code, message) { const error = new TypeError(message); error.code = code; throw error; }
function projection(voyage_id, event_cut, projector, value) {
  const body = { schema: PROJECTION_SCHEMA, voyage_id, event_cut, projector, projector_version:'v0', value };
  return deepFreezeJson({...body, projection_id:hashCanonical(body)});
}
function makeState({voyage_id, branch_id, event_seq, parent_state_ids, status, source_event_id}) {
  const basis = {voyage_id, branch_id, event_seq, parent_state_ids, status, source_event_id};
  return deepFreezeJson({...basis, state_id:hashCanonical(basis)});
}

export function replayStoryship({constitution, events, cut}) {
  validateConstitutionReceipt(constitution);
  if (!Array.isArray(events) || !Number.isInteger(cut) || cut < 1 || cut > events.length) fail('INVALID_STORYSHIP_REPLAY','invalid cut');
  const used = events.filter(e => e.event_seq <= cut);
  const stateById = new Map();
  const latestByBranch = new Map();
  const states = [];
  const reality = []; const narrative = []; const manifest = []; const openBerth = []; const relationships = new Set();
  const sourceCutIds = new Set();
  let voyageId = null;

  const addState = ({branch_id,event_seq,parent_state_ids,status,source_event_id}) => {
    for (const parent of parent_state_ids) if (!stateById.has(parent)) fail('INVALID_STORYSHIP_BRANCH_DAG','parent state must already exist');
    const state = makeState({voyage_id:voyageId,branch_id,event_seq,parent_state_ids,status,source_event_id});
    if (parent_state_ids.includes(state.state_id)) fail('INVALID_STORYSHIP_BRANCH_DAG','state cannot parent itself');
    stateById.set(state.state_id,state); latestByBranch.set(branch_id,state); states.push(state); return state;
  };

  for (const event of used) {
    validateStoryshipEvent(event);
    voyageId ??= event.voyage_id;
    if (event.voyage_id !== voyageId || event.constitution_id !== constitution.constitution_id) fail('INVALID_STORYSHIP_REPLAY','mixed voyage or constitution');
    for (const cutRef of event.source_cut) sourceCutIds.add(cutRef.source_cut_id);
    reality.push(...event.reality_effects);
    narrative.push(...event.narrative_interpretations);
    manifest.push(...event.manifest_effects);
    for (const effect of event.manifest_effects) {
      if (effect?.kind === 'open-berth' && effect.status === 'open') openBerth.push(effect);
      if (effect?.relationship_thread_id) relationships.add(effect.relationship_thread_id);
    }

    if (event.parent_state_ids?.length) for (const parent of event.parent_state_ids) if (!stateById.has(parent)) fail('INVALID_STORYSHIP_BRANCH_DAG','event references future or unknown parent state');

    if (event.event_type === 'voyage-created' && !latestByBranch.has(event.branch_id)) {
      addState({branch_id:event.branch_id,event_seq:event.event_seq,parent_state_ids:[],status:'live',source_event_id:event.event_id});
    }
    const branchEffects = event.payload?.branch_effects;
    if (Array.isArray(branchEffects)) {
      for (const effect of branchEffects) {
        const parentIds = [];
        for (const parentBranch of effect.parent_branch_ids ?? []) {
          const parent = latestByBranch.get(parentBranch);
          if (!parent) fail('INVALID_STORYSHIP_BRANCH_DAG',`unknown parent branch ${parentBranch}`);
          parentIds.push(parent.state_id);
        }
        addState({branch_id:effect.branch_id,event_seq:event.event_seq,parent_state_ids:parentIds,status:effect.status,source_event_id:event.event_id});
      }
    }
    if (event.event_type === 'selection-recorded') {
      for (const branchId of event.payload?.selected_branch_ids ?? []) {
        const parent=latestByBranch.get(branchId); if (!parent) fail('INVALID_STORYSHIP_BRANCH_DAG','selected branch missing');
        addState({branch_id:branchId,event_seq:event.event_seq,parent_state_ids:[parent.state_id],status:'live',source_event_id:event.event_id});
      }
      for (const branchId of event.payload?.unselected_branch_ids ?? []) {
        const parent=latestByBranch.get(branchId); if (!parent) fail('INVALID_STORYSHIP_BRANCH_DAG','unselected branch missing');
        addState({branch_id:branchId,event_seq:event.event_seq,parent_state_ids:[parent.state_id],status:'dormant',source_event_id:event.event_id});
      }
    }
  }

  const headStates = [...latestByBranch.values()].filter(s => s.branch_id !== 'branch-root').sort((a,b)=>a.branch_id.localeCompare(b.branch_id));
  const liveCount = headStates.filter(s=>s.status==='live').length;
  const projections = {
    reality: projection(voyageId,cut,'reality',reality),
    narrative: projection(voyageId,cut,'narrative',narrative),
    manifest: projection(voyageId,cut,'manifest',manifest),
    open_berth: projection(voyageId,cut,'open_berth',openBerth),
    branch_heads: projection(voyageId,cut,'branch_heads',headStates.map(s=>({branch_id:s.branch_id,state_id:s.state_id,status:s.status}))),
    dormant_branches: projection(voyageId,cut,'dormant_branches',headStates.filter(s=>s.status==='dormant').map(s=>s.branch_id)),
    relationship_threads: projection(voyageId,cut,'relationship_threads',[...relationships].sort()),
  };
  const replayBasis={schema:'storyship/replay/v0',voyage_id:voyageId,event_cut:cut,constitution_id:constitution.constitution_id,tip_event_id:used.at(-1).event_id,projection_ids:Object.fromEntries(Object.entries(projections).map(([k,v])=>[k,v.projection_id]))};
  return deepFreezeJson({...replayBasis,replay_id:hashCanonical(replayBasis),currentness:liveCount===1?'resolved':'unresolved',branch_states:states,projections,source_cut_ids:[...sourceCutIds].sort()});
}
