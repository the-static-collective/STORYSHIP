import { deepFreezeJson } from './canonical.mjs';
import { validateConstitutionReceipt, validateSelectorReceipt, validateReserveReceipt, validateLaunchGoReceipt } from './contract.mjs';

function gate(state, reason){return {state,reason};}
function safe(fn){try{return fn();}catch{return false;}}
export function evaluatePreflight(input){
  const gates={};
  gates.constitution = safe(()=>validateConstitutionReceipt(input.constitution)) ? gate('pass','constitution valid') : gate('fail','constitution invalid');
  gates.continuity_crucible = input.continuity_crucible_passed===true ? gate('pass','11/11 hostile cases passed') : gate('fail','continuity crucible not proven');
  gates.fresh_process_reentry = input.fresh_process_reentry_passed===true ? gate('pass','fresh process replay proven') : gate('fail','fresh process replay not proven');

  if(!input.selector_receipt || !safe(()=>validateSelectorReceipt(input.selector_receipt))) gates.historical_selector=gate('fail','selector receipt missing or invalid');
  else if(input.selector_receipt.recovery_status==='recovered') gates.historical_selector=gate('pass','historical selector recovered');
  else gates.historical_selector=gate('unresolved',`selector recovery ${input.selector_receipt.recovery_status}`);

  const cut=input.vault_source_cut;
  const realVault=!!cut && cut.owning_world==='autodiscography-vault' && cut.availability_status==='available' && cut.evidence_class==='raw-owner-evidence' && typeof cut.stable_locator==='string' && !cut.stable_locator.startsWith('fixture://') && cut.content_digest_when_available!==null;
  gates.real_vault_source=realVault?gate('pass','real raw Vault cut bound'):gate('fail','real raw Vault cut not bound');

  gates.packet_000 = input.packet_000?.schema==='storyship/packet/v0' && input.packet_000?.packet_label==='000' ? gate('pass','Packet 000 sealed') : gate('fail','Packet 000 missing or invalid');

  const reserveValid=!!input.reserve_receipt && safe(()=>validateReserveReceipt(input.reserve_receipt)) && input.reserve_receipt.protected_reserve_credits>0 && input.reserve_receipt.protected_reserve_credits<=input.reserve_receipt.observed_available_credits;
  gates.protected_reserve=reserveValid?gate('pass','positive protected reserve sealed'):gate('fail','protected reserve missing or invalid');

  if(input.launch_go_receipt==null) gates.human_go=gate('unresolved','exact head + packet human GO not yet supplied');
  else if(!safe(()=>validateLaunchGoReceipt(input.launch_go_receipt))) gates.human_go=gate('fail','GO receipt invalid');
  else {
    const go=input.launch_go_receipt;
    const exact=go.launch_candidate_head_sha===input.current_head_sha && go.packet_id===input.packet_000?.packet_id && go.reserve_receipt_id===input.reserve_receipt?.reserve_receipt_id && go.selector_receipt_id===input.selector_receipt?.selector_receipt_id;
    gates.human_go=exact?gate('pass','GO matches exact candidate identities'):gate('fail','GO does not match exact candidate identities');
  }
  gates.third_arm_nonclaim=input.third_arm_machine_verdict_enabled===false?gate('pass','third-arm machine verdict remains unavailable'):gate('fail','third-arm machine verdict capability present');
  const ready=Object.values(gates).every(g=>g.state==='pass');
  return deepFreezeJson({schema:'storyship/preflight/v0',ready,gates});
}
