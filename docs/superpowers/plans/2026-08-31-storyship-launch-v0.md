# STORYSHIP Launch v0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dependency-free Node.js STORYSHIP v0 that deterministically receipts and replays one complete no-spend voyage, preserves branch and authority boundaries, seals Transfer Packet 000, and reaches an exact human-GO launch boundary without making a live provider call.

**Architecture:** STORYSHIP is a file-backed append-only voyage runtime. Canonical events are the keel; replayed projections, MEMORY, OPEN BERTH, packets, and receipts are deterministic descendants of exact event cuts. The repository owns voyage state only: Vault owns raw historical evidence, the provider owns provider-side facts, the human owns attributable steering, and Haunted Phonography owns customs.

**Tech Stack:** Node.js >=22, ECMAScript modules, `node:test`, `node:assert/strict`, and Node built-ins only (`node:crypto`, `node:fs`, `node:path`, `node:child_process`).

**Spec:** `docs/superpowers/specs/2026-08-31-storyship-launch-keel-design.md`

## Global Constraints

- `the-static-collective/STORYSHIP` owns the voyage going forward; origin remains attributable to the Haunted Phonography formation road.
- `STORYSHIP owns voyage`; `Haunted Phonography owns customs`; `Vault owns raw historical evidence`; the human owns attributable steering; the provider owns provider-side generation facts.
- `interpretation != observation`; `recognition != evidence of hidden identity`; `resemblance != ancestry`; `selection != deletion`; `arrival != admission`.
- Canonical history is an append-only event sequence. Later interpretation may reference earlier history but never mutate it.
- Event order is `event_seq`, never timestamp recency.
- Native sibling generation creates distinct branches. Identical renderings do not collapse worldlines.
- Authority-bearing branch ancestry is acyclic. Parent states must already exist at an earlier event sequence.
- `MEMORY` is packet-facing derived state, not a mutable store.
- OPEN BERTH may not contain missing raw evidence, inaccessible source, protected silence, explicit refusal, known prohibition, forgotten metadata, or unresolved branch ownership.
- Newly constituted native records use `storyship/*/v0` schemas and `storyship-canonical-json-v1`.
- HP prototype fixtures keep their original `haunted-phonograph/storyship-*` and `hp-canonical-json-v1` identities.
- Node version floor is `>=22`.
- No runtime dependencies are added for v0.
- No database, network service, hidden provider API, credential, reusable token, automatic ranking, `decide`, or `admit` capability is introduced.
- Runtime third-arm machine verdicts remain unavailable until `STORYSHIP-TRIVARIANT-001` is independently implemented and passed.
- Live spend remains forbidden until a real Vault cut, historical selector receipt, Transfer Packet 000, protected reserve, and exact-head + exact-packet human GO are all bound.
- Every behavioral slice follows RED -> GREEN and ends in a commit.

---

## File Map

- `README.md` — operator purpose, authority map, setup, no-spend workflow.
- `package.json` — Node >=22, ESM, test/verify/crucible/preflight scripts; no dependencies.
- `constitution/ancestry.json` — exact HP formation receipts.
- `constitution/constitution.json` — native founding constitution receipt.
- `src/canonical.mjs` — canonical JSON and SHA-256 identities.
- `src/contract.mjs` — bounded schemas and launch-control receipts.
- `src/ledger.mjs` — event admission, immutable append, ledger verification.
- `src/replay.mjs` — exact-cut replay, branch DAG, projections, relationship threads.
- `src/packet.mjs` — REALITY + MEMORY + OPEN BERTH packet sealing.
- `src/receipt.mjs` — checkpoint/crossing receipts and customs-link boundary.
- `src/verify.mjs` — bundle verification and fresh-process identity summary.
- `src/preflight.mjs` — no-spend launch gate evaluation.
- `cli/storyship.mjs` — explicit operator commands only.
- `fixtures/compat/hp-canonical-v1.json` — HP compatibility witness.
- `fixtures/crucible/` — hostile fixture evidence.
- `fixtures/voyage-000/` — complete frozen no-spend reference voyage.
- `voyages/` — live-voyage material only when evidence is earned.
- `test/helpers/fixture.mjs` — native valid-record constructors.
- `test/canonical.test.mjs`
- `test/contract.test.mjs`
- `test/ledger.test.mjs`
- `test/replay.test.mjs`
- `test/packet.test.mjs`
- `test/receipt.test.mjs`
- `test/crucible.test.mjs`
- `test/reentry.test.mjs`
- `test/preflight.test.mjs`
- `test/cli.test.mjs`
- `test/live-materials.test.mjs`

---

### Task 1: Bootstrap and canonicalization compatibility witness

**Files:**
- Create: `package.json`
- Create: `README.md`
- Create: `src/canonical.mjs`
- Create: `fixtures/compat/hp-canonical-v1.json`
- Create: `test/canonical.test.mjs`

**Interfaces:**
- Consumes: Node >=22 only.
- Produces:
  - `STORYSHIP_CANONICALIZATION_POLICY`
  - `canonicalStringify(value)`
  - `hashCanonical(value)`
  - `deepFreezeJson(value)`

- [ ] **Step 1: Write the package boundary and failing tests**

Create `package.json`:

```json
{
  "name": "@the-static-collective/storyship",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test",
    "verify": "node cli/storyship.mjs verify fixtures/voyage-000",
    "crucible": "node --test test/crucible.test.mjs",
    "preflight": "node cli/storyship.mjs preflight fixtures/voyage-000"
  },
  "engines": { "node": ">=22" }
}
```

Create `fixtures/compat/hp-canonical-v1.json`:

```json
{
  "source": {
    "repository": "the-static-collective/the-haunted-phonography",
    "head": "a3d699753c280cc62722a69e651df7e23051dabf",
    "path": "src/provenance.mjs",
    "policy": "hp-canonical-json-v1"
  },
  "input": {
    "z": -0.0,
    "a": {"b": 2, "a": 1},
    "list": [3, {"y": true, "x": null}]
  },
  "canonical": "{\"a\":{\"a\":1,\"b\":2},\"list\":[3,{\"x\":null,\"y\":true}],\"z\":0}",
  "hash": "sha256:f26ee47c7dd5802c30ec7b7cd5412c01f4e141ee8bf28d804a20a7c4e924f7d8"
}
```

Write `test/canonical.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  STORYSHIP_CANONICALIZATION_POLICY,
  canonicalStringify,
  hashCanonical,
} from '../src/canonical.mjs';

const fixture = JSON.parse(
  await readFile(new URL('../fixtures/compat/hp-canonical-v1.json', import.meta.url), 'utf8'),
);

test('native policy owns new identities while preserving canonical bytes', () => {
  assert.equal(STORYSHIP_CANONICALIZATION_POLICY, 'storyship-canonical-json-v1');
  assert.equal(canonicalStringify(fixture.input), fixture.canonical);
  assert.equal(hashCanonical(fixture.input), fixture.hash);
});

test('key insertion order does not change identity', () => {
  assert.equal(hashCanonical({b: 2, a: 1}), hashCanonical({a: 1, b: 2}));
});

test('invalid JSON shapes fail closed', () => {
  assert.throws(() => canonicalStringify({value: Number.NaN}), /finite numbers/);
  assert.throws(() => canonicalStringify({value: undefined}), /JSON-safe/);
  const cyclic = {};
  cyclic.self = cyclic;
  assert.throws(() => canonicalStringify(cyclic), /cycles/);
});
```

- [ ] **Step 2: Run RED**

```bash
node --test test/canonical.test.mjs
```

Expected: FAIL because `src/canonical.mjs` does not exist.

- [ ] **Step 3: Implement minimal canonicalization**

Create `src/canonical.mjs` with the HP algorithmic behavior but no HP provenance-claim semantics:

```js
import { createHash } from 'node:crypto';

export const STORYSHIP_CANONICALIZATION_POLICY = 'storyship-canonical-json-v1';

function fail(message) {
  const error = new TypeError(message);
  error.code = 'INVALID_JSON_VALUE';
  throw error;
}

function isPlainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function normalizeJson(value, path = '$', ancestors = new WeakSet()) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) fail(`${path} must contain only finite numbers`);
    return Object.is(value, -0) ? 0 : value;
  }
  if (Array.isArray(value)) {
    if (ancestors.has(value)) fail(`${path} must not contain cycles`);
    ancestors.add(value);
    try {
      return value.map((item, index) => {
        if (!(index in value)) fail(`${path} must not contain sparse arrays`);
        return normalizeJson(item, `${path}[${index}]`, ancestors);
      });
    } finally {
      ancestors.delete(value);
    }
  }
  if (!isPlainObject(value) || Object.getOwnPropertySymbols(value).length > 0) {
    fail(`${path} must contain only JSON-safe plain objects`);
  }
  if (ancestors.has(value)) fail(`${path} must not contain cycles`);
  ancestors.add(value);
  try {
    return Object.fromEntries(
      Object.keys(value).map(key => [key, normalizeJson(value[key], `${path}.${key}`, ancestors)]),
    );
  } finally {
    ancestors.delete(value);
  }
}

function serialize(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(serialize).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map(key => `${JSON.stringify(key)}:${serialize(value[key])}`).join(',')}}`;
}

export function canonicalStringify(value) {
  return serialize(normalizeJson(value));
}

export function hashCanonical(value) {
  return `sha256:${createHash('sha256').update(canonicalStringify(value), 'utf8').digest('hex')}`;
}

export function deepFreezeJson(value) {
  const clone = JSON.parse(canonicalStringify(value));
  const freeze = node => {
    if (node && typeof node === 'object' && !Object.isFrozen(node)) {
      for (const child of Object.values(node)) freeze(child);
      Object.freeze(node);
    }
    return node;
  };
  return freeze(clone);
}
```

- [ ] **Step 4: Run GREEN and verify the frozen HP hash**

```bash
node --input-type=module -e "import f from './fixtures/compat/hp-canonical-v1.json' with {type:'json'}; import {hashCanonical} from './src/canonical.mjs'; console.log(hashCanonical(f.input))"
node --test test/canonical.test.mjs
```

Expected hash: `sha256:f26ee47c7dd5802c30ec7b7cd5412c01f4e141ee8bf28d804a20a7c4e924f7d8`.
Expected tests: PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json README.md src/canonical.mjs fixtures/compat/hp-canonical-v1.json test/canonical.test.mjs
git commit -m "feat: bootstrap Storyship canonical runtime"
```

---

### Task 2: Founding ancestry and native contracts

**Files:**
- Create: `constitution/ancestry.json`
- Create: `constitution/constitution.json`
- Create: `src/contract.mjs`
- Create: `test/helpers/fixture.mjs`
- Create: `test/contract.test.mjs`

**Interfaces:**
- Consumes: canonicalization functions.
- Produces:
  - `STORYSHIP_EVENT_TYPES`
  - `STORYSHIP_RESULT_VALUES`
  - `STORYSHIP_RESULT_TARGETS`
  - `STORYSHIP_FORBIDDEN_BERTH_CLASSES`
  - `createConstitutionReceipt()` / `validateConstitutionReceipt()`
  - `admitSourceCut()` / `validateSourceCut()`
  - `createStoryshipResult()` / `validateStoryshipResult()`
  - `createSelectorReceipt()` / `validateSelectorReceipt()`
  - `createReserveReceipt()` / `validateReserveReceipt()`
  - `createLaunchGoReceipt()` / `validateLaunchGoReceipt()`

- [ ] **Step 1: Write ancestry files and failing contract tests**

`constitution/ancestry.json` records these exact sources:

```json
{
  "schema": "storyship/ancestry/v0",
  "formation_sources": [
    {"repository":"the-static-collective/the-haunted-phonography","pr":15,"merge_commit":"59ea2db01efb6a8738e97dde4c68b4d3fde8b0cf","path":"docs/superpowers/specs/2026-08-24-storyship-001-the-door-design.md","blob":"fcbf525ec7ffa4e11a880797bb4717a7aa9978cf"},
    {"repository":"the-static-collective/the-haunted-phonography","pr":16,"merge_commit":"26c9ddc881e1334ed1c0e0a4792eb48d5848b503","path":"docs/superpowers/specs/2026-08-24-storyship-attributable-becoming-amendment.md","blob":"a1baa1ea1e61cb6ddc552708f7e5f54deb7127c5"},
    {"repository":"the-static-collective/the-haunted-phonography","pr":17,"merge_commit":"cc62b17c7fad9e899e042e629fe15ba3d363ca10","path":"docs/superpowers/specs/2026-08-24-storyship-relationship-passenger-law.md","blob":"3c1fb229ae8e5f6dcf941b4ad1235533e5718fae"},
    {"repository":"the-static-collective/the-haunted-phonography","pr":20,"merge_commit":"c90ad4faa2b3b4307417be6d355128e88c178e3c","path":"docs/superpowers/specs/2026-08-28-storyship-third-arm-variant-law.md","blob":"3b52aa81f2aee37215b9be671904acafb8467907"}
  ],
  "prototype": {
    "repository":"the-static-collective/the-haunted-phonography",
    "pr":19,
    "head":"a3d699753c280cc62722a69e651df7e23051dabf",
    "state_at_lift":"open-draft-unmerged",
    "contract_blob":"1607e4b40a1d1b57003da996a18f070f8499c42a",
    "ledger_blob":"3ba0e20cf3fac38b4076a54ed9da974a3ad9b0d0"
  }
}
```

Native founding constitution input:

```json
{
  "owner_repository": "the-static-collective/STORYSHIP",
  "owner_head_sha": "6a941263363c43b47c7e1803cb8d825bd59efcb1",
  "ordered_constitutive_paths": ["docs/superpowers/specs/2026-08-31-storyship-launch-keel-design.md"],
  "blob_sha_for_each_path": {
    "docs/superpowers/specs/2026-08-31-storyship-launch-keel-design.md": "c52c3dd93b537cc0798cae4b8be42c01f3d5d5dd"
  }
}
```

Contract tests must assert:

```js
test('native constitution identity depends on ordered path/blob pairs, not later head', () => {
  const first = createConstitutionReceipt(FOUNDING_CONSTITUTION_INPUT);
  const later = createConstitutionReceipt({...FOUNDING_CONSTITUTION_INPUT, owner_head_sha: 'f'.repeat(40)});
  assert.equal(first.schema, 'storyship/constitution-receipt/v0');
  assert.equal(first.canonicalization_policy, 'storyship-canonical-json-v1');
  assert.equal(first.constitution_id, later.constitution_id);
});

test('machine result cannot constitute destination admission', () => {
  const result = createStoryshipResult({
    result: 'supports',
    target: 'destination_admission',
    basis_event_ids: [],
    reason_codes: ['fixture'],
  });
  assert.equal(result.authority, 'machine-test-only');
  assert.equal(result.owner_gate_status, 'not-constituted');
});

test('selector recovery remains typed', () => {
  for (const recovery_status of ['recovered', 'partial', 'unresolved']) {
    const receipt = createSelectorReceipt({
      mechanism_id: `selector-${recovery_status}`,
      recovery_status,
      evidence_refs: recovery_status === 'unresolved' ? [] : ['source:fixture'],
      operator_inputs_visible: ['sibling audio', 'prompt', 'lyrics'],
      allowed_outcomes: ['continue-a', 'continue-b', 'hold-both', 'stop'],
      non_selected_treatment: 'dormant',
      unresolved_notes: recovery_status === 'recovered' ? [] : ['historical cadence unresolved'],
    });
    assert.equal(receipt.recovery_status, recovery_status);
  }
});

test('reserve and GO bind actual accounting identities', () => {
  const reserve = createReserveReceipt({
    observed_available_credits: 1000,
    protected_reserve_credits: 150,
    observed_at: '2026-08-31T00:00:00.000Z',
    basis_ref: 'human-observation:fixture',
  });
  assert.equal(reserve.spendable_credits, 850);
  const go = createLaunchGoReceipt({
    launch_candidate_head_sha: 'a'.repeat(40),
    packet_id: SHA('b'),
    reserve_receipt_id: reserve.reserve_receipt_id,
    selector_receipt_id: SHA('c'),
    approved_by: 'human:operator-000',
    approved_at: '2026-08-31T00:01:00.000Z',
  });
  assert.equal(go.packet_id, SHA('b'));
});
```

- [ ] **Step 2: Run RED**

```bash
node --test test/contract.test.mjs
```

Expected: FAIL because `src/contract.mjs` does not exist.

- [ ] **Step 3: Implement exact native schemas**

Start `src/contract.mjs` with:

```js
import {
  STORYSHIP_CANONICALIZATION_POLICY,
  deepFreezeJson,
  hashCanonical,
} from './canonical.mjs';

const CONSTITUTION_SCHEMA = 'storyship/constitution-receipt/v0';
const SOURCE_CUT_SCHEMA = 'storyship/source-cut/v0';
const RESULT_SCHEMA = 'storyship/result/v0';
const SELECTOR_SCHEMA = 'storyship/selector-receipt/v0';
const RESERVE_SCHEMA = 'storyship/reserve-receipt/v0';
const GO_SCHEMA = 'storyship/launch-go/v0';

export const STORYSHIP_EVENT_TYPES = Object.freeze([
  'voyage-created', 'constitution-bound', 'source-bound', 'packet-sealed',
  'generation-requested', 'generation-observed', 'encounter-recorded',
  'selection-recorded', 'continuation-recorded', 'branch-composed',
  'interpretation-recorded', 'residue-recorded', 'correction-recorded',
  'customs-result-linked', 'checkpoint-sealed', 'voyage-stopped',
]);

export const STORYSHIP_RESULT_VALUES = Object.freeze(['supports', 'refuses', 'unresolved']);
export const STORYSHIP_RESULT_TARGETS = Object.freeze([
  'passenger_claim', 'lineage_claim', 'source_binding', 'packet_mapping',
  'observation_method', 'selection_abstraction', 'continuity_law',
  'destination_admission',
]);

export const STORYSHIP_FORBIDDEN_BERTH_CLASSES = Object.freeze([
  'missing raw evidence', 'inaccessible source', 'protected silence',
  'explicit refusal', 'known prohibition', 'forgotten metadata',
  'unresolved branch ownership',
]);
```

Use exact-key validation. Reserve inputs must be non-negative integers, with `protected_reserve_credits <= observed_available_credits`, and derive `spendable_credits`. Selector receipts require explicit visible inputs/outcomes and permit empty evidence only for `unresolved`. GO receipts bind exact 40-hex candidate head and SHA-256 packet/reserve/selector identities.

- [ ] **Step 4: Seal `constitution/constitution.json` and run GREEN**

Generate the complete sealed receipt using `createConstitutionReceipt()` from the founding input, write canonical JSON, then run:

```bash
node --test test/contract.test.mjs
npm test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add constitution src/contract.mjs test/helpers/fixture.mjs test/contract.test.mjs
git commit -m "feat: bind Storyship native constitution"
```

---

### Task 3: Native append-only event ledger

**Files:**
- Create: `src/ledger.mjs`
- Modify: `test/helpers/fixture.mjs`
- Create: `test/ledger.test.mjs`

**Interfaces:**
- Produces `createStoryshipEvent()`, `validateStoryshipEvent()`, `appendStoryshipEvent()`, `verifyStoryshipLedger()`.

- [ ] **Step 1: Write failing event/ledger tests**

```js
test('append is immutable and event_seq is the only ledger order', () => {
  const {constitution, sourceCut} = fixture();
  const one = appendStoryshipEvent([], makeEventInput({
    constitutionId: constitution.constitution_id,
    sourceCut: [sourceCut],
    eventSeq: 1,
    recordedAt: '2026-08-31T12:10:00.000Z',
  }));
  const snapshot = JSON.stringify(one);
  const two = appendStoryshipEvent(one, makeEventInput({
    constitutionId: constitution.constitution_id,
    sourceCut: [sourceCut],
    eventSeq: 2,
    eventType: 'interpretation-recorded',
    occurredAtSourceRaw: '1999-ish/provider-local',
    observedAt: '2026-08-31T11:00:00.000Z',
    recordedAt: '2026-08-31T11:00:01.000Z',
    payload: {text: 'late-discovered earlier occurrence'},
  }));
  assert.equal(JSON.stringify(one), snapshot);
  assert.equal(two[1].event_seq, 2);
});

test('narrative cannot overwrite reality', () => {
  const attack = {
    interpretation_id: 'cleanup',
    text: 'cleaner story',
    basis_event_ids: [SHA('1')],
    authority_scope: 'human-interpretation',
    replaces_reality_record_id: 'raw-1',
  };
  assert.throws(
    () => createStoryshipEvent(makeEventInput({narrativeInterpretations: [attack]})),
    expectCode('INVALID_STORYSHIP_EVENT'),
  );
});

test('provider artifact identity binds provider identity and bytes', () => {
  const provider_identity = 'provider-artifact-a';
  const content_digest = SHA('c');
  const artifact_id = hashCanonical({provider_identity, content_digest});
  const event = createStoryshipEvent(makeEventInput({
    eventType: 'generation-observed',
    payload: {
      request_event_id: SHA('d'),
      artifact: {artifact_id, provider_identity, content_digest},
      branch_effects: [{branch_id:'branch-a', parent_branch_ids:['branch-root'], status:'live'}],
    },
  }));
  assert.equal(event.payload.artifact.artifact_id, artifact_id);
});
```

- [ ] **Step 2: Run RED**

```bash
node --test test/ledger.test.mjs
```

Expected: FAIL because `src/ledger.mjs` does not exist.

- [ ] **Step 3: Implement strict event admission**

Native event schema is `storyship/event/v0`. Keep the HP v0 event envelope fields and strict nested objects. Carrier effects use exact keys:

```js
const CARRIER_KEYS = new Set([
  'kind', 'effect_id', 'action', 'carrier_ref', 'relationship_thread_id',
  'narrative_relation_ids', 'basis_event_ids', 'target_effect_id',
]);
```

Normalize `source_cut` by `source_cut_id` before hashing. `appendStoryshipEvent()` requires first sequence `1`, then exactly previous + 1; it returns a newly frozen array. `verifyStoryshipLedger()` rejects mixed voyages and mixed constitution identities.

- [ ] **Step 4: Run GREEN**

```bash
node --test test/ledger.test.mjs
npm test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ledger.mjs test/helpers/fixture.mjs test/ledger.test.mjs
git commit -m "feat: add append-only Storyship ledger"
```

---

### Task 4: Deterministic replay and branch DAG

**Files:**
- Create: `src/replay.mjs`
- Modify: `test/helpers/fixture.mjs`
- Create: `test/replay.test.mjs`

**Interfaces:**
- Produces `replayStoryship({constitution, events, cut})` and deterministic projections `reality`, `narrative`, `manifest`, `open_berth`, `branch_heads`, `dormant_branches`, `relationship_threads`.

- [ ] **Step 1: Write failing branch tests**

Use `makeTwinVoyageFixture()` from the helper to build root/request/sibling-A/sibling-B/selection events.

```js
test('native twins remain distinct when one becomes dormant', () => {
  const {constitution, events} = makeTwinVoyageFixture();
  const replay = replayStoryship({constitution, events, cut: events.length});
  assert.deepEqual(
    replay.projections.branch_heads.value.map(x => [x.branch_id, x.status]),
    [['branch-a', 'live'], ['branch-b', 'dormant']],
  );
});

test('same rendering does not collapse worldlines', () => {
  const {constitution, events} = makeSameBytesTwinFixture();
  const replay = replayStoryship({constitution, events, cut: events.length});
  assert.equal(replay.branch_states.filter(x => x.status === 'live').length, 2);
});

test('multiple live heads remain unresolved', () => {
  const {constitution, events} = makeUnselectedTwinFixture();
  const replay = replayStoryship({constitution, events, cut: events.length});
  assert.equal(replay.currentness, 'unresolved');
});

test('future or cyclic parent state fails closed', () => {
  const future = makeFutureParentFixture();
  assert.throws(
    () => replayStoryship(future),
    expectCode('INVALID_STORYSHIP_BRANCH_DAG'),
  );
  const cycle = makeCycleAttemptFixture();
  assert.throws(
    () => replayStoryship(cycle),
    expectCode('INVALID_STORYSHIP_BRANCH_DAG'),
  );
});
```

- [ ] **Step 2: Run RED**

```bash
node --test test/replay.test.mjs
```

Expected: FAIL because `src/replay.mjs` does not exist.

- [ ] **Step 3: Implement exact-cut replay**

Use only events with `event_seq <= cut`. Never use timestamps for currentness.

State identity:

```js
const state_id = hashCanonical({
  voyage_id,
  branch_id,
  event_seq,
  parent_state_ids,
  status,
  source_event_id,
});
```

Projection identity:

```js
const projection_id = hashCanonical({
  schema: 'storyship/projection/v0',
  voyage_id,
  event_cut,
  projector,
  projector_version: 'v0',
  value,
});
```

Rules:
- `generation-observed` creates branch states from declared branch effects.
- `selection-recorded.selected_branch_ids` remains live.
- `selection-recorded.unselected_branch_ids` becomes dormant, not deleted.
- `continuation-recorded` may create descendants from live or dormant parents.
- `branch-composed` names 2+ explicit parents; parents remain historical.
- every parent state must already exist before the child event.
- no state can be its own ancestor.
- relationship threads come only from explicit `relationship_thread_id`; similarity never synthesizes one.

- [ ] **Step 4: Run GREEN**

```bash
node --test test/replay.test.mjs
npm test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/replay.mjs test/helpers/fixture.mjs test/replay.test.mjs
git commit -m "feat: replay Storyship branch history"
```

---

### Task 5: MEMORY, OPEN BERTH, and Transfer Packet sealing

**Files:**
- Create: `src/packet.mjs`
- Create: `test/packet.test.mjs`

**Interfaces:**
- Produces `sealTransferPacket({replay, packet_label})` and `validateTransferPacket(packet, replay)` using schema `storyship/packet/v0`.

- [ ] **Step 1: Write failing packet tests**

```js
test('packet binds REALITY, MEMORY, and OPEN BERTH at one cut', () => {
  const replay = makePacketReplayFixture();
  const packet = sealTransferPacket({replay, packet_label: '000'});
  assert.equal(packet.schema, 'storyship/packet/v0');
  assert.equal(packet.event_cut, replay.event_cut);
  assert.equal(packet.reality_projection_id, replay.projections.reality.projection_id);
  assert.equal(packet.memory.manifest_projection_id, replay.projections.manifest.projection_id);
});

test('later append does not mutate an older sealed cut', () => {
  const {beforeReplay, sameCutAfterAppendReplay} = makeStaleCutFixture();
  const first = sealTransferPacket({replay: beforeReplay, packet_label: '000'});
  const second = sealTransferPacket({replay: sameCutAfterAppendReplay, packet_label: '000'});
  assert.equal(canonicalStringify(first), canonicalStringify(second));
});

test('protected silence cannot become OPEN BERTH', () => {
  const replay = makeProtectedSilenceAttackFixture();
  assert.throws(
    () => sealTransferPacket({replay, packet_label: '000'}),
    expectCode('FORBIDDEN_OPEN_BERTH_IMPORT'),
  );
});
```

- [ ] **Step 2: Run RED**

```bash
node --test test/packet.test.mjs
```

Expected: FAIL because `src/packet.mjs` does not exist.

- [ ] **Step 3: Implement packet construction**

Packet fields:

```js
{
  schema: 'storyship/packet/v0',
  voyage_id,
  event_cut,
  constitution_id,
  replay_id,
  reality_projection_id,
  memory: {manifest_projection_id, narrative_relation_ids},
  open_berth,
  branch_heads,
  source_cut_ids,
  packet_label,
  packet_id,
}
```

`MEMORY` references the manifest projection plus only explicitly referenced narrative relation IDs. OPEN BERTH includes only currently-open `open-berth` effects and rejects all forbidden classes. `packet_id` hashes the record without the identity field.

- [ ] **Step 4: Run GREEN**

```bash
node --test test/packet.test.mjs
npm test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/packet.mjs test/packet.test.mjs
git commit -m "feat: seal Storyship transfer packets"
```

---

### Task 6: Crossing receipts and customs boundary

**Files:**
- Create: `src/receipt.mjs`
- Create: `test/receipt.test.mjs`

**Interfaces:**
- Produces `createCheckpointReceipt()`, `validateCheckpointReceipt()`, `createCrossingReceipt()`, `validateCrossingReceipt()`.

- [ ] **Step 1: Write failing boundary tests**

```js
test('arrival without HP receipt remains unadmitted', () => {
  const receipt = createCrossingReceipt(makeCrossingInput({customs_receipt_ref: null}));
  assert.equal(receipt.destination_status, 'unadmitted');
});

test('HP customs reference does not become Storyship admission', () => {
  const receipt = createCrossingReceipt(makeCrossingInput({
    customs_receipt_ref: {
      owning_world: 'the-static-collective/the-haunted-phonography',
      source_cut_id: SHA('e'),
    },
  }));
  assert.equal(receipt.destination_status, 'customs-receipt-linked');
  assert.notEqual(receipt.destination_status, 'admitted');
});

test('credit debit must be observed non-negative integer accounting', () => {
  assert.throws(
    () => createCrossingReceipt(makeCrossingInput({actual_credit_debit: -1})),
    expectCode('INVALID_STORYSHIP_RECEIPT'),
  );
});
```

- [ ] **Step 2: Run RED**

```bash
node --test test/receipt.test.mjs
```

Expected: FAIL because `src/receipt.mjs` does not exist.

- [ ] **Step 3: Implement exact receipt schemas**

Crossing receipt must bind constitution, voyage/branch/parents, packet/cut, source cuts, request identity, provider-visible fields, observed sibling artifact IDs, actual credit debit, encounter, selector, appended events, resulting heads, projection IDs/versions, canonicalization policy, execution environment, unresolved/refused/dormant residue, prior receipts, and optional HP customs reference.

Derive status internally:

```js
const destination_status = input.customs_receipt_ref === null
  ? 'unadmitted'
  : 'customs-receipt-linked';
```

Never accept `destination_status` as caller input.

- [ ] **Step 4: Run GREEN**

```bash
node --test test/receipt.test.mjs
npm test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/receipt.mjs test/receipt.test.mjs
git commit -m "feat: receipt Storyship crossings"
```

---

### Task 7: Eleven-case no-spend continuity crucible

**Files:**
- Create: `fixtures/crucible/README.md`
- Create: `test/crucible.test.mjs`
- Modify runtime modules only when a hostile test exposes a real gap.

**Interfaces:**
- Produces exactly eleven named fixture-only hostile tests:
  1. `01 replay and re-entry`
  2. `02 stale cut`
  3. `03 twin branch preservation`
  4. `04 ambiguous heads`
  5. `05 history reinterpretation`
  6. `06 protected-silence attack`
  7. `07 narrative overwrite attack`
  8. `08 relationship-carrier confusion`
  9. `09 abstraction counterexample`
  10. `10 customs boundary`
  11. `11 tamper evidence`

- [ ] **Step 1: Write all eleven tests before runtime changes**

Required core assertions include:

```js
test('08 relationship-carrier confusion', () => {
  const original = makeArtifact('provider-a', SHA('c'));
  const lookalike = makeArtifact('provider-b', SHA('c'));
  assert.equal(original.content_digest, lookalike.content_digest);
  assert.notEqual(original.artifact_id, lookalike.artifact_id);
  const result = createStoryshipResult({
    result: 'unresolved',
    target: 'lineage_claim',
    basis_event_ids: [],
    reason_codes: ['same-bytes-without-attributable-road'],
  });
  assert.equal(result.result, 'unresolved');
});

test('09 abstraction counterexample', () => {
  const result = createStoryshipResult({
    result: 'refuses',
    target: 'observation_method',
    basis_event_ids: [],
    reason_codes: ['fixture-method-failed'],
  });
  assert.equal(result.target, 'observation_method');
  assert.notEqual(result.target, 'continuity_law');
});

test('11 tamper evidence', () => {
  const {packet, replay} = makePacketReplayPair();
  const tampered = structuredClone(packet);
  tampered.event_cut += 1;
  assert.throws(
    () => validateTransferPacket(tampered, replay),
    expectCode('INVALID_STORYSHIP_PACKET'),
  );
});
```

- [ ] **Step 2: Run the crucible**

```bash
npm run crucible
```

Expected: any missing invariant fails explicitly. If earlier tasks already satisfy a case, retain the passing hostile test; do not weaken it to force an artificial failure.

- [ ] **Step 3: Fix only exposed owning invariants**

For each failing case, modify only the module that owns the violated invariant, then rerun that exact test:

```bash
node --test --test-name-pattern="06 protected-silence attack" test/crucible.test.mjs
```

- [ ] **Step 4: Prove all eleven and full regression**

```bash
npm run crucible
npm test
```

Expected: 11/11 crucible PASS; full suite PASS.

- [ ] **Step 5: Commit**

```bash
git add fixtures/crucible test/crucible.test.mjs src
git commit -m "test: prove Storyship continuity crucible"
```

---

### Task 8: Frozen Voyage 000 and fresh-process re-entry

**Files:**
- Create: `src/verify.mjs`
- Create: `fixtures/voyage-000/constitution.json`
- Create: `fixtures/voyage-000/events.json`
- Create: `fixtures/voyage-000/packet-000.json`
- Create: `fixtures/voyage-000/checkpoint.json`
- Create: `fixtures/voyage-000/expected-summary.json`
- Create: `test/helpers/reentry-child.mjs`
- Create: `test/reentry.test.mjs`

**Interfaces:**
- Produces `verifyVoyageBundle()` and deterministic verification summary.

- [ ] **Step 1: Write fresh-process test first**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { canonicalStringify } from '../src/canonical.mjs';

const expected = JSON.parse(
  await readFile(new URL('../fixtures/voyage-000/expected-summary.json', import.meta.url), 'utf8'),
);
const expectedCanonicalSummary = canonicalStringify(expected);

function runFresh() {
  return spawnSync(process.execPath, ['test/helpers/reentry-child.mjs', 'fixtures/voyage-000'], {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf8',
  });
}

test('fresh processes reproduce byte-identical verification summary', () => {
  const first = runFresh();
  const second = runFresh();
  assert.equal(first.status, 0, first.stderr);
  assert.equal(second.status, 0, second.stderr);
  assert.equal(first.stdout, second.stdout);
  assert.equal(first.stdout.trim(), expectedCanonicalSummary);
});
```

- [ ] **Step 2: Run RED**

```bash
node --test test/reentry.test.mjs
```

Expected: FAIL because verifier and frozen voyage do not exist.

- [ ] **Step 3: Implement verifier and freeze Voyage 000**

The event road is exactly:

1. `voyage-created`
2. `constitution-bound`
3. `source-bound` to fixture raw evidence
4. `generation-requested` with `mode: "fixture-only"`, `credit_debit: 0`
5. sibling A `generation-observed`
6. sibling B `generation-observed`
7. `encounter-recorded`
8. `selection-recorded` selecting A and making B dormant
9. `continuation-recorded` for A
10. `residue-recorded` preserving B
11. `continuation-recorded` carrying A to `carrier_ref: "hp-customs:candidate-000"` with no customs receipt
12. `checkpoint-sealed`

Seal Packet 000 at the declared pre-crossing cut. `verifyVoyageBundle()` must independently validate identities and regenerate replay/packet values; it must never trust `expected-summary.json` as verification input.

`test/helpers/reentry-child.mjs` prints only canonical summary JSON plus newline.

- [ ] **Step 4: Run GREEN**

```bash
node --test test/reentry.test.mjs
npm test
```

Expected: PASS with byte-identical fresh-process output.

- [ ] **Step 5: Commit**

```bash
git add src/verify.mjs fixtures/voyage-000 test/helpers/reentry-child.mjs test/reentry.test.mjs
git commit -m "feat: freeze Storyship no-spend voyage"
```

---

### Task 9: Preflight gates

**Files:**
- Create: `src/preflight.mjs`
- Create: `test/preflight.test.mjs`
- Create: `voyages/.gitkeep`

**Interfaces:**
- Produces `evaluatePreflight(input)` with gate states `pass|fail|unresolved` for:
  - `constitution`
  - `continuity_crucible`
  - `fresh_process_reentry`
  - `historical_selector`
  - `real_vault_source`
  - `packet_000`
  - `protected_reserve`
  - `human_go`
  - `third_arm_nonclaim`

- [ ] **Step 1: Write failing gate tests**

```js
test('fixture source never authorizes live spend', () => {
  const result = evaluatePreflight(makePreflightInput({vault_source_cut: fixtureVaultCut}));
  assert.equal(result.ready, false);
  assert.equal(result.gates.real_vault_source.state, 'fail');
});

test('partial selector remains unresolved', () => {
  const result = evaluatePreflight(makePreflightInput({selector_receipt: partialSelector}));
  assert.equal(result.gates.historical_selector.state, 'unresolved');
  assert.equal(result.ready, false);
});

test('GO must match exact current head and packet identities', () => {
  const input = makeReadyPreflightInput();
  input.current_head_sha = 'f'.repeat(40);
  const result = evaluatePreflight(input);
  assert.equal(result.gates.human_go.state, 'fail');
  assert.equal(result.ready, false);
});

test('third-arm machine verdict capability blocks launch', () => {
  const result = evaluatePreflight(makePreflightInput({third_arm_machine_verdict_enabled: true}));
  assert.equal(result.gates.third_arm_nonclaim.state, 'fail');
});
```

- [ ] **Step 2: Run RED**

```bash
node --test test/preflight.test.mjs
```

Expected: FAIL because `src/preflight.mjs` does not exist.

- [ ] **Step 3: Implement fail-closed gate evaluation**

Live Vault passes only when:
- `owning_world === "autodiscography-vault"`
- `availability_status === "available"`
- `evidence_class === "raw-owner-evidence"`
- `stable_locator` does not start with `fixture://`
- `content_digest_when_available` is non-null.

Selector: `recovered` passes; `partial|unresolved` remain unresolved.

Reserve: protected reserve must be positive and cannot exceed observed available credits.

GO passes only when candidate head, packet ID, reserve receipt ID, and selector receipt ID all match exact current inputs.

`ready` is true only when every gate is `pass`.

- [ ] **Step 4: Run GREEN**

```bash
node --test test/preflight.test.mjs
npm test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/preflight.mjs test/preflight.test.mjs voyages/.gitkeep
git commit -m "feat: gate Storyship live departure"
```

---

### Task 10: Operator CLI and launch legibility

**Files:**
- Create: `cli/storyship.mjs`
- Modify: `README.md`
- Create: `test/cli.test.mjs`

**Interfaces:**
- Commands:
  - `constitution verify PATH`
  - `voyage create DIRECTORY --voyage-id ID`
  - `source bind VOYAGE_DIRECTORY --input SOURCE_CUT_JSON`
  - `replay VOYAGE_DIRECTORY --cut EVENT_SEQ`
  - `packet seal VOYAGE_DIRECTORY --cut EVENT_SEQ --label LABEL`
  - `observe generation VOYAGE_DIRECTORY --input OBSERVATION_JSON`
  - `encounter record VOYAGE_DIRECTORY --input ENCOUNTER_JSON`
  - `selection record VOYAGE_DIRECTORY --input SELECTION_JSON`
  - `continuation record VOYAGE_DIRECTORY --input CONTINUATION_JSON`
  - `checkpoint seal VOYAGE_DIRECTORY`
  - `verify VOYAGE_DIRECTORY`
  - `crucible`
  - `preflight VOYAGE_DIRECTORY [--go LAUNCH_GO_JSON]`
- Forbidden commands: `decide`, `rank`, `admit`.

- [ ] **Step 1: Write failing CLI tests**

```js
test('verify prints the seven operator questions', () => {
  const result = runCli(['verify', 'fixtures/voyage-000']);
  assert.equal(result.status, 0, result.stderr);
  for (const heading of [
    'WHERE AM I?', 'WHAT IS TRUE?', 'WHAT ARE WE CARRYING?', 'WHAT IS OPEN?',
    'WHAT HAPPENED?', 'WHAT CAN I DO NEXT?', 'WHAT IS NOT MINE TO DECIDE?',
  ]) assert.match(result.stdout, new RegExp(heading.replace('?', '\\?')));
});

test('forbidden authority commands do not exist', () => {
  for (const command of ['decide', 'rank', 'admit']) {
    const result = runCli([command]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /unknown command/);
  }
});

test('fixture preflight is provider-free and leaves files unchanged', () => {
  const before = snapshotDirectory('fixtures/voyage-000');
  const result = runCli(['preflight', 'fixtures/voyage-000']);
  const after = snapshotDirectory('fixtures/voyage-000');
  assert.equal(before, after);
  assert.match(result.stdout, /LIVE DEPARTURE: BLOCKED/);
});
```

- [ ] **Step 2: Run RED**

```bash
node --test test/cli.test.mjs
```

Expected: FAIL because CLI does not exist.

- [ ] **Step 3: Implement explicit routing and thin file adapters**

```js
const argv = process.argv.slice(2);
const [command, subcommand] = argv;
const twoWordKey = `${command ?? ''} ${subcommand ?? ''}`.trim();

const route = new Map([
  ['constitution verify', 'constitution-verify'],
  ['voyage create', 'voyage-create'],
  ['source bind', 'source-bind'],
  ['packet seal', 'packet-seal'],
  ['observe generation', 'observe-generation'],
  ['encounter record', 'encounter-record'],
  ['selection record', 'selection-record'],
  ['continuation record', 'continuation-record'],
  ['checkpoint seal', 'checkpoint-seal'],
]);

const action = route.get(twoWordKey) ?? (
  ['replay', 'verify', 'crucible', 'preflight'].includes(command) ? command : null
);

if (action === null) {
  process.stderr.write(`unknown command: ${twoWordKey}\n`);
  process.exitCode = 2;
} else {
  await runAction(action, argv.slice(action.includes('-') ? 2 : 1));
}
```

Define `runAction(action, args)` in the same file as an exhaustive switch. Each case parses only its documented arguments, loads/writes canonical JSON, and calls one already-defined runtime constructor/verifier. The default branch throws `UNKNOWN_ACTION`; there is no network/provider fallback.

File writes must validate before append, write canonical JSON plus newline, never edit an accepted event, and refuse to overwrite a packet/receipt identity with different bytes.

README documents the human-mediated path:

```text
seal packet -> human carries declared input to provider
-> provider exposes observable sibling pair
-> human records observation
-> Storyship appends observation
-> human encounter + historical selector
-> candidate reaches HP customs
```

- [ ] **Step 4: Run GREEN and operator checks**

```bash
node --test test/cli.test.mjs
npm test
npm run verify
npm run crucible
npm run preflight
```

Expected: tests/verify/crucible PASS; fixture preflight remains `ready:false`.

- [ ] **Step 5: Commit**

```bash
git add cli/storyship.mjs README.md test/cli.test.mjs package.json
git commit -m "feat: add Storyship operator CLI"
```

---

### Task 11: Recover historical selector and bind one real Vault cut

**Files:**
- Create: `docs/receipts/historical-selector-001.md`
- Create: `voyages/storyship-001/selector.json`
- Create `voyages/storyship-001/source-cuts/vault-000.json` only if real raw owner evidence is accessible.
- Create: `test/live-materials.test.mjs`

**Interfaces:**
- Consumes project-owned evidence and Task 2 receipt constructors.
- Produces only earned evidence. Missing evidence remains blocked state.

- [ ] **Step 1: Search project-owned evidence in authority order**

Inspect:
1. Autodiscography Vault raw/history sources;
2. STORYSHIP/HP founding design references;
3. GitHub issue/PR discussion explicitly describing pre-Bandcamp self-selection;
4. current human testimony if supplied during execution.

Record each usable source as exact repository/path/commit/blob or owner-stable locator. Do not infer the selector from later ranking behavior.

- [ ] **Step 2: Write analytical receipt before machine receipt**

`docs/receipts/historical-selector-001.md` has four sections:

```text
DOCUMENTED
INFERENCE
UNRESOLVED
REJECTED SUBSTITUTES
```

Rejected substitutes explicitly include: `pick better song`, `highest score`, `latest`, `most similar`, `model ranking`.

- [ ] **Step 3: Seal the selector at the earned recovery level**

Use `recovered` only when required historical inputs/outcomes/non-selected treatment are attributable. Use `partial` when some required behavior remains uncertain. Use `unresolved` when the mechanism cannot be identified beyond rejected substitutes. `unresolved_notes` copies the analytical receipt's unresolved claims verbatim.

- [ ] **Step 4: Bind one real Vault cut only when all required owner facts exist**

The input object must use:
- owning world `autodiscography-vault`;
- exact owner-stable locator;
- exact revision/provider identity;
- SHA-256 digest computed from acquired raw bytes;
- actual acquisition timestamp;
- availability `available`;
- evidence class `raw-owner-evidence`.

If any field is unavailable, do not create a live source cut. Record the missing field and leave preflight blocked.

- [ ] **Step 5: Test and commit truthful material**

```js
const preflight = evaluatePreflight(materials);
assert.equal(
  preflight.gates.historical_selector.state,
  selector.recovery_status === 'recovered' ? 'pass' : 'unresolved',
);
if (vaultCut === null) assert.notEqual(preflight.gates.real_vault_source.state, 'pass');
```

Run:

```bash
node --test test/live-materials.test.mjs
npm test
git add docs/receipts voyages/storyship-001 test/live-materials.test.mjs
git commit -m "docs: bind Storyship launch evidence"
```

---

### Task 12: Seal actual reserve and Packet 000 candidate; stop at exact human GO

**Files:**
- Create when actual observations exist:
  - `voyages/storyship-001/reserve.json`
  - `voyages/storyship-001/events.json`
  - `voyages/storyship-001/packet-000.json`
- Do not create `launch-go.json` before exact approval of the final candidate head + packet identity.

**Interfaces:**
- Produces the committed no-spend launch candidate only.

- [ ] **Step 1: Observe and receipt actual provider credit balance without spending**

Record a human-visible balance observation with exact integer balance, actual observation timestamp, evidence reference, and an explicitly chosen positive protected reserve. Load that observation and call:

```js
const observation = JSON.parse(await readFile(creditObservationPath, 'utf8'));
const reserve = createReserveReceipt({
  observed_available_credits: observation.observed_available_credits,
  protected_reserve_credits: observation.protected_reserve_credits,
  observed_at: observation.observed_at,
  basis_ref: observation.basis_ref,
});
```

If no trustworthy balance is observable, do not write `reserve.json`.

- [ ] **Step 2: Create only the pre-provider live road and seal Packet 000**

Append:
1. `voyage-created`
2. `constitution-bound`
3. `source-bound`
4. `packet-sealed`

Seal `voyages/storyship-001/packet-000.json`. Do not append a positive-debit generation request.

- [ ] **Step 3: Verify all non-GO gates**

```bash
npm test
npm run crucible
node cli/storyship.mjs verify voyages/storyship-001
node cli/storyship.mjs preflight voyages/storyship-001
```

Expected when all evidence is earned: every gate passes except `human_go`; `ready:false`.

- [ ] **Step 4: Commit candidate material**

```bash
git add voyages/storyship-001
git commit -m "chore: seal Storyship launch candidate"
```

If evidence remains blocked, commit only truthful records and keep the blocked gate visible.

- [ ] **Step 5: Freeze and present exact candidate identity**

```bash
git status --short
git rev-parse HEAD
node --input-type=module -e "import p from './voyages/storyship-001/packet-000.json' with {type:'json'}; console.log(p.packet_id)"
node cli/storyship.mjs preflight voyages/storyship-001
```

Require a clean working tree. Present exact head SHA, Packet 000 ID, observed available credits, protected reserve, all gate states, and explicit confirmation that no live generation spend occurred.

Stop. The next human approval must unambiguously approve that exact head + packet pair. Only then may a later step create `storyship/launch-go/v0` and proceed to DEPARTURE.

---

## Final Verification Before Live GO

Run from a clean checkout/fresh process:

```bash
node --version
npm test
npm run crucible
npm run verify
node cli/storyship.mjs preflight fixtures/voyage-000
node cli/storyship.mjs verify voyages/storyship-001
node cli/storyship.mjs preflight voyages/storyship-001
git status --short
```

Required state:

```text
Node >=22
full suite PASS
11/11 crucible PASS
fixture Voyage 000 deterministic re-entry PASS
fixture preflight BLOCKED from live spend
live voyage verification PASS
live preflight all gates PASS except human_go
working tree clean
no provider credential in repository
no machine third-arm verdict capability
no HP customs admission fabricated
no positive live credit debit recorded
```

The implementation is complete at this boundary. DEPARTURE is a separately receipted human-authorized event against the exact launch candidate head and exact Packet 000 identity.
