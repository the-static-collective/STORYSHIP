# STORYSHIP Launch v0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dependency-free Node.js STORYSHIP v0 that can deterministically receipt and replay one complete no-spend voyage, preserve branch/authority boundaries, seal Transfer Packet 000, and prove launch preflight without making a live provider call.

**Architecture:** STORYSHIP is a file-backed, append-only voyage runtime. Canonical events are the keel; replayed projections, MEMORY, OPEN BERTH, packets, and receipts are deterministic descendants of exact event cuts. The repository owns voyage state only: Vault owns raw historical evidence, the provider owns provider-side facts, the human owns attributable steering, and Haunted Phonography owns customs.

**Tech Stack:** Node.js >=22, ECMAScript modules, `node:test`, `node:assert/strict`, Node built-ins only (`node:crypto`, `node:fs`, `node:path`, `node:child_process`).

**Spec:** `docs/superpowers/specs/2026-08-31-storyship-launch-keel-design.md`

## Global Constraints

- `the-static-collective/STORYSHIP` owns the voyage going forward; origin remains attributable to the Haunted Phonography formation road.
- `STORYSHIP owns voyage`; `Haunted Phonography owns customs`; `Vault owns raw historical evidence`; the human owns attributable steering; the provider owns provider-side generation facts.
- `interpretation != observation`; `recognition != evidence of hidden identity`; `resemblance != ancestry`; `selection != deletion`; `arrival != admission`.
- Canonical history is an append-only event sequence; later interpretation may reference earlier history but never mutate it.
- Event order is `event_seq`, never timestamp recency.
- Native sibling generation creates distinct branches; identical renderings do not collapse worldlines.
- `MEMORY` is packet-facing derived state, not a mutable store.
- OPEN BERTH may not contain missing raw evidence, inaccessible source, protected silence, explicit refusal, known prohibition, forgotten metadata, or unresolved branch ownership.
- Newly constituted native records use `storyship/*/v0` schema identifiers and `storyship-canonical-json-v1`.
- HP prototype fixtures keep their original `haunted-phonograph/storyship-*` and `hp-canonical-json-v1` identities.
- Node version floor is `>=22`.
- No runtime dependencies are added for v0.
- No database, network service, hidden provider API, credential, reusable token, automatic ranking, `decide`, or `admit` capability is introduced.
- Runtime third-arm machine verdicts remain unavailable until `STORYSHIP-TRIVARIANT-001` is independently implemented and passed.
- Live spend remains forbidden until a real Vault cut, historical selector receipt, Transfer Packet 000, protected reserve, and exact-head + exact-packet human GO are all bound.
- Every behavioral slice follows RED → GREEN and ends in a commit.

---

## File Map

### Repository / operator surface

- `README.md` — operator-facing purpose, authority map, setup, no-spend launch workflow.
- `package.json` — Node >=22, ESM, test/verify/crucible/preflight scripts; no dependencies.
- `cli/storyship.mjs` — argument parsing and explicit constitutional commands only.

### Constitution / ancestry

- `constitution/ancestry.json` — immutable external formation receipts: HP PRs #15–#20 and PR #19 prototype head/blobs.
- `constitution/constitution.json` — native founding constitution receipt bound to STORYSHIP founding spec commit `6a941263363c43b47c7e1803cb8d825bd59efcb1`.

### Runtime

- `src/canonical.mjs` — JSON-safe normalization, deterministic canonical serialization, SHA-256 identities.
- `src/contract.mjs` — schemas, bounded vocabularies, constitution/source/result/selector/reserve/GO validation.
- `src/ledger.mjs` — event validation, immutable append, ledger verification.
- `src/replay.mjs` — deterministic cut replay, branch DAG, projections, branch heads and relationship threads.
- `src/packet.mjs` — MEMORY + OPEN BERTH + REALITY transfer packet sealing.
- `src/receipt.mjs` — crossing/checkpoint receipts; no authority promotion.
- `src/verify.mjs` — bundle verification, tamper checks, fresh-process identity summary.
- `src/preflight.mjs` — launch gates only; no provider/network action.

### Fixtures

- `fixtures/compat/hp-canonical-v1.json` — frozen input/canonical/hash compatibility witness from HP ancestry.
- `fixtures/crucible/*.json` — hostile fixture inputs where a static file improves auditability.
- `fixtures/voyage-000/constitution.json`
- `fixtures/voyage-000/events.json`
- `fixtures/voyage-000/packet-000.json`
- `fixtures/voyage-000/checkpoint.json`
- `fixtures/voyage-000/expected-summary.json` — complete no-spend reference voyage.
- `voyages/.gitkeep` — runtime voyage destination without inventing live history.

### Tests / helpers

- `test/helpers/fixture.mjs` — constructors for valid native records.
- `test/canonical.test.mjs`
- `test/contract.test.mjs`
- `test/ledger.test.mjs`
- `test/replay.test.mjs`
- `test/packet.test.mjs`
- `test/receipt.test.mjs`
- `test/crucible.test.mjs`
- `test/reentry.test.mjs`
- `test/preflight.test.mjs`
- `test/helpers/reentry-child.mjs` — fresh-process verifier target.

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
  - `STORYSHIP_CANONICALIZATION_POLICY: "storyship-canonical-json-v1"`
  - `canonicalStringify(value): string`
  - `hashCanonical(value): string` formatted `sha256:<64 lowercase hex>`
  - `deepFreezeJson(value): frozen JSON-safe clone`

- [ ] **Step 1: Write the package boundary and failing canonicalization tests**

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
  "engines": {
    "node": ">=22"
  }
}
```

Create `fixtures/compat/hp-canonical-v1.json` with a frozen compatibility specimen whose input includes key-order variance, `-0`, nested arrays, and objects:

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

test('native policy is STORYSHIP-owned while bytes remain deterministic', () => {
  assert.equal(STORYSHIP_CANONICALIZATION_POLICY, 'storyship-canonical-json-v1');
  assert.equal(canonicalStringify(fixture.input), fixture.canonical);
  assert.equal(hashCanonical(fixture.input), fixture.hash);
});

test('key insertion order does not change identity', () => {
  assert.equal(
    hashCanonical({ b: 2, a: 1 }),
    hashCanonical({ a: 1, b: 2 }),
  );
});

test('invalid JSON shapes fail closed', () => {
  assert.throws(() => canonicalStringify({ value: Number.NaN }), /finite numbers/);
  assert.throws(() => canonicalStringify({ value: undefined }), /JSON-safe/);
  const cyclic = {};
  cyclic.self = cyclic;
  assert.throws(() => canonicalStringify(cyclic), /cycles/);
});
```

- [ ] **Step 2: Run the canonicalization test and confirm RED**

Run:

```bash
node --test test/canonical.test.mjs
```

Expected: FAIL because `src/canonical.mjs` does not exist.

- [ ] **Step 3: Implement the minimal native canonicalization module**

Create `src/canonical.mjs` using the same deterministic algorithmic behavior as HP `src/provenance.mjs` at head `a3d699753c280cc62722a69e651df7e23051dabf`, but without importing HP provenance claim semantics:

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

- [ ] **Step 4: Confirm the compatibility hash and run GREEN**

Run:

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

### Task 2: Founding ancestry, constitution, source cuts, typed results, selector and launch-control contracts

**Files:**
- Create: `constitution/ancestry.json`
- Create: `constitution/constitution.json`
- Create: `src/contract.mjs`
- Create: `test/helpers/fixture.mjs`
- Create: `test/contract.test.mjs`

**Interfaces:**
- Consumes: `canonicalStringify`, `hashCanonical`, `deepFreezeJson`.
- Produces:
  - constants: `STORYSHIP_EVENT_TYPES`, `STORYSHIP_RESULT_VALUES`, `STORYSHIP_RESULT_TARGETS`, `STORYSHIP_FORBIDDEN_BERTH_CLASSES`
  - `createConstitutionReceipt(input)`, `validateConstitutionReceipt(receipt)`
  - `admitSourceCut(input)`, `validateSourceCut(cut)`
  - `createStoryshipResult(input)`, `validateStoryshipResult(result)`
  - `createSelectorReceipt(input)`, `validateSelectorReceipt(receipt)`
  - `createReserveReceipt(input)`, `validateReserveReceipt(receipt)`
  - `createLaunchGoReceipt(input)`, `validateLaunchGoReceipt(receipt)`

- [ ] **Step 1: Write the founding ancestry files and failing contract tests**

`constitution/ancestry.json` must contain exact external receipts already adopted by the founding spec:

```json
{
  "schema": "storyship/ancestry/v0",
  "formation_sources": [
    {
      "repository": "the-static-collective/the-haunted-phonography",
      "pr": 15,
      "merge_commit": "59ea2db01efb6a8738e97dde4c68b4d3fde8b0cf",
      "path": "docs/superpowers/specs/2026-08-24-storyship-001-the-door-design.md",
      "blob": "fcbf525ec7ffa4e11a880797bb4717a7aa9978cf"
    },
    {
      "repository": "the-static-collective/the-haunted-phonography",
      "pr": 16,
      "merge_commit": "26c9ddc881e1334ed1c0e0a4792eb48d5848b503",
      "path": "docs/superpowers/specs/2026-08-24-storyship-attributable-becoming-amendment.md",
      "blob": "a1baa1ea1e61cb6ddc552708f7e5f54deb7127c5"
    },
    {
      "repository": "the-static-collective/the-haunted-phonography",
      "pr": 17,
      "merge_commit": "cc62b17c7fad9e899e042e629fe15ba3d363ca10",
      "path": "docs/superpowers/specs/2026-08-24-storyship-relationship-passenger-law.md",
      "blob": "3c1fb229ae8e5f6dcf941b4ad1235533e5718fae"
    },
    {
      "repository": "the-static-collective/the-haunted-phonography",
      "pr": 20,
      "merge_commit": "c90ad4faa2b3b4307417be6d355128e88c178e3c",
      "path": "docs/superpowers/specs/2026-08-28-storyship-third-arm-variant-law.md",
      "blob": "3b52aa81f2aee37215b9be671904acafb8467907"
    }
  ],
  "prototype": {
    "repository": "the-static-collective/the-haunted-phonography",
    "pr": 19,
    "head": "a3d699753c280cc62722a69e651df7e23051dabf",
    "state_at_lift": "open-draft-unmerged",
    "contract_blob": "1607e4b40a1d1b57003da996a18f070f8499c42a",
    "ledger_blob": "3ba0e20cf3fac38b4076a54ed9da974a3ad9b0d0"
  }
}
```

`constitution/constitution.json` binds the first STORYSHIP-native constitutional cut:

```json
{
  "owner_repository": "the-static-collective/STORYSHIP",
  "owner_head_sha": "6a941263363c43b47c7e1803cb8d825bd59efcb1",
  "ordered_constitutive_paths": [
    "docs/superpowers/specs/2026-08-31-storyship-launch-keel-design.md"
  ],
  "blob_sha_for_each_path": {
    "docs/superpowers/specs/2026-08-31-storyship-launch-keel-design.md": "c52c3dd93b537cc0798cae4b8be42c01f3d5d5dd"
  }
}
```

The implementation step will transform this input into a sealed receipt or rewrite the file to the sealed receipt once the contract exists.

Write `test/contract.test.mjs` to assert the native namespace and bounded authority:

```js
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  STORYSHIP_EVENT_TYPES,
  STORYSHIP_FORBIDDEN_BERTH_CLASSES,
  createConstitutionReceipt,
  admitSourceCut,
  createStoryshipResult,
  createSelectorReceipt,
  createReserveReceipt,
  createLaunchGoReceipt,
} from '../src/contract.mjs';
import { FOUNDING_CONSTITUTION_INPUT, SHA } from './helpers/fixture.mjs';

test('native constitution identity depends on ordered path/blob pairs, not later repo head', () => {
  const first = createConstitutionReceipt(FOUNDING_CONSTITUTION_INPUT);
  const later = createConstitutionReceipt({...FOUNDING_CONSTITUTION_INPUT, owner_head_sha: 'f'.repeat(40)});
  assert.equal(first.schema, 'storyship/constitution-receipt/v0');
  assert.equal(first.canonicalization_policy, 'storyship-canonical-json-v1');
  assert.equal(first.constitution_id, later.constitution_id);
});

test('source cuts keep owner evidence typed', () => {
  const cut = admitSourceCut({
    owning_world: 'autodiscography-vault',
    stable_locator: 'fixture://vault/raw-000',
    revision_or_provider_identity: 'vault-rev-000',
    content_digest_when_available: SHA('a'),
    acquisition_time: '2026-08-31T00:00:00.000Z',
    availability_status: 'available',
    evidence_class: 'raw-owner-evidence',
  });
  assert.equal(cut.schema, 'storyship/source-cut/v0');
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

test('historical selector gate distinguishes recovered from partial and unresolved', () => {
  for (const recovery_status of ['recovered', 'partial', 'unresolved']) {
    const receipt = createSelectorReceipt({
      mechanism_id: `selector-${recovery_status}`,
      recovery_status,
      evidence_refs: recovery_status === 'unresolved' ? [] : ['source:fixture'],
      operator_inputs_visible: ['sibling audio', 'prompt', 'lyrics'],
      allowed_outcomes: ['continue-a', 'continue-b', 'hold-both', 'stop'],
      non_selected_treatment: 'dormant',
      unresolved_notes: recovery_status === 'recovered' ? [] : ['exact historical cadence not established'],
    });
    assert.equal(receipt.recovery_status, recovery_status);
  }
});

test('reserve and GO receipts bind actual numbers and exact packet/head', () => {
  const reserve = createReserveReceipt({
    observed_available_credits: 1000,
    protected_reserve_credits: 150,
    observed_at: '2026-08-31T00:00:00.000Z',
    basis_ref: 'human-observation:credits',
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
  assert.equal(go.launch_candidate_head_sha, 'a'.repeat(40));
});

test('forbidden berth classes remain exact', () => {
  assert.deepEqual([...STORYSHIP_FORBIDDEN_BERTH_CLASSES], [
    'missing raw evidence',
    'inaccessible source',
    'protected silence',
    'explicit refusal',
    'known prohibition',
    'forgotten metadata',
    'unresolved branch ownership',
  ]);
  assert(STORYSHIP_EVENT_TYPES.includes('generation-observed'));
});
```

- [ ] **Step 2: Run and confirm RED**

```bash
node --test test/contract.test.mjs
```

Expected: FAIL because `src/contract.mjs` and helper exports do not exist.

- [ ] **Step 3: Implement strict native contracts**

Port the proven HP validation posture, changing native schemas/policy and adding selector/reserve/GO records. The public constants begin:

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
  'voyage-created',
  'constitution-bound',
  'source-bound',
  'packet-sealed',
  'generation-requested',
  'generation-observed',
  'encounter-recorded',
  'selection-recorded',
  'continuation-recorded',
  'branch-composed',
  'interpretation-recorded',
  'residue-recorded',
  'correction-recorded',
  'customs-result-linked',
  'checkpoint-sealed',
  'voyage-stopped',
]);

export const STORYSHIP_RESULT_VALUES = Object.freeze(['supports', 'refuses', 'unresolved']);
export const STORYSHIP_RESULT_TARGETS = Object.freeze([
  'passenger_claim',
  'lineage_claim',
  'source_binding',
  'packet_mapping',
  'observation_method',
  'selection_abstraction',
  'continuity_law',
  'destination_admission',
]);
```

Implement exact-key validation and deterministic identities. Reserve math must reject negative/non-integer credit values and compute:

```js
spendable_credits = observed_available_credits - protected_reserve_credits
```

with `protected_reserve_credits <= observed_available_credits`.

Selector receipts must require:
- `recovery_status` exactly `recovered|partial|unresolved`;
- `evidence_refs` may be empty only for `unresolved`;
- explicit visible inputs, allowed outcomes, non-selected treatment, unresolved notes.

GO receipts must bind exact 40-hex `launch_candidate_head_sha` and exact SHA-256 packet/reserve/selector identities.

- [ ] **Step 4: Seal the founding constitution and run GREEN**

Use `createConstitutionReceipt()` on the JSON input, rewrite `constitution/constitution.json` to the complete sealed receipt, and run:

```bash
node --test test/contract.test.mjs
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
- Consumes: contract validators and canonical hashing.
- Produces:
  - `createStoryshipEvent(input): StoryshipEvent`
  - `validateStoryshipEvent(event): true`
  - `appendStoryshipEvent(events, input): readonly StoryshipEvent[]`
  - `verifyStoryshipLedger({constitution, events}): {voyage_id, constitution_id, event_count, tip_event_id}`

- [ ] **Step 1: Write failing ledger tests**

Use the HP Tasks 1–2 behavior as ancestry but assert native schemas. Critical tests:

```js
test('append is immutable and event_seq is the only ledger order', () => {
  const { constitution, sourceCut } = fixture();
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
    payload: { text: 'late-discovered earlier occurrence' },
  }));

  assert.equal(JSON.stringify(one), snapshot);
  assert.equal(two[1].event_seq, 2);
  assert.equal(two[1].occurred_at_source_raw, '1999-ish/provider-local');
});
```

```js
test('narrative cannot carry a replaces_reality_record_id escape hatch', () => {
  const attack = {
    interpretation_id: 'cleanup',
    text: 'cleaner story',
    basis_event_ids: [SHA('1')],
    authority_scope: 'human-interpretation',
    replaces_reality_record_id: 'raw-1',
  };
  assert.throws(
    () => createStoryshipEvent(makeEventInput({ narrativeInterpretations: [attack] })),
    expectCode('INVALID_STORYSHIP_EVENT'),
  );
});
```

```js
test('generation artifact identity binds provider identity and content digest', () => {
  const provider_identity = 'provider-artifact-a';
  const content_digest = SHA('c');
  const artifact_id = hashCanonical({provider_identity, content_digest});
  const event = createStoryshipEvent(makeEventInput({
    eventType: 'generation-observed',
    payload: {
      request_event_id: SHA('d'),
      artifact: {artifact_id, provider_identity, content_digest},
      branch_effects: [{branch_id: 'branch-a', parent_branch_ids: ['branch-root'], status: 'live'}],
    },
  }));
  assert.equal(event.payload.artifact.artifact_id, artifact_id);
});
```

- [ ] **Step 2: Run and confirm RED**

```bash
node --test test/ledger.test.mjs
```

Expected: FAIL because `src/ledger.mjs` does not exist.

- [ ] **Step 3: Implement event admission and append**

Port the HP ledger invariants into `src/ledger.mjs`, changing only native namespace/policy where identity-bearing schemas are created. Event input keys remain:

```js
const EVENT_INPUT_KEYS = new Set([
  'schema',
  'voyage_id',
  'event_seq',
  'event_type',
  'branch_id',
  'parent_state_ids',
  'constitution_id',
  'source_cut',
  'actor',
  'occurred_at_source_raw',
  'observed_at',
  'recorded_at',
  'payload',
  'reality_effects',
  'narrative_interpretations',
  'manifest_effects',
  'uncertainty',
  'authority',
  'previous_receipt_ids',
]);
```

Native event schema:

```js
const EVENT_SCHEMA = 'storyship/event/v0';
```

Preserve strict nested contracts for:
- reality records;
- narrative interpretations;
- carrier effects, with exact keys `kind`, `effect_id`, `action`, `carrier_ref`, `relationship_thread_id`, `narrative_relation_ids`, `basis_event_ids`, `target_effect_id`;
- open-berth effects;
- uncertainty;
- branch effects;
- provider artifacts.

Normalize `source_cut` by `source_cut_id` before hashing so input order does not change identity.

`appendStoryshipEvent()` must require:
- first sequence exactly `1`;
- each next sequence exactly previous + 1;
- no mutation of previous array/events;
- event voyage and constitution consistency checked by `verifyStoryshipLedger()`.

- [ ] **Step 4: Run Task 3 tests and full suite**

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

### Task 4: Deterministic replay, branch DAG, projections, and relationship threads

**Files:**
- Create: `src/replay.mjs`
- Create: `test/replay.test.mjs`

**Interfaces:**
- Consumes: verified constitution + ledger events.
- Produces:
  - `replayStoryship({constitution, events, cut = events.length}): ReplayState`
  - `projectStoryship(replay): {reality, narrative, manifest, open_berth, branch_heads, dormant_branches, relationship_threads}`
  - each projection: `{schema, voyage_id, event_cut, projector, value, projection_id}`
  - replay: `{schema, voyage_id, constitution_id, event_cut, event_ids, branch_states, projections, replay_id}`

- [ ] **Step 1: Write failing replay tests for the graph laws**

Build a five-event fixture:
1. root voyage;
2. request;
3. sibling A observed → `branch-a`;
4. sibling B observed → `branch-b`;
5. human selection chooses A and marks B non-selected.

Assert:

```js
test('native twins remain two worldlines after one is selected', () => {
  const replay = replayStoryship({constitution, events, cut: 5});
  assert.deepEqual(
    replay.projections.branch_heads.value.map(head => [head.branch_id, head.status]),
    [['branch-a', 'live'], ['branch-b', 'dormant']],
  );
});
```

```js
test('later return from dormant history appends ancestry rather than rewriting selection', () => {
  const before = replayStoryship({constitution, events, cut: 5});
  const after = replayStoryship({constitution, events: [...events, dormantReturn], cut: 6});
  assert.deepEqual(before.projections.branch_heads.value, [
    {branch_id: 'branch-a', status: 'live', state_id: before.projections.branch_heads.value[0].state_id},
    {branch_id: 'branch-b', status: 'dormant', state_id: before.projections.branch_heads.value[1].state_id},
  ]);
  assert(after.branch_states.some(state =>
    state.branch_id === 'branch-b-return'
    && state.parent_branch_ids.includes('branch-b')));
});
```

```js
test('multiple unresolved live heads are not sorted into a winner by time', () => {
  const replay = replayStoryship({constitution, events: twinEventsWithoutSelection});
  assert.equal(replay.currentness, 'unresolved');
});
```

```js
test('same rendering does not collapse branch identities', () => {
  assert.equal(artifactA.content_digest, artifactB.content_digest);
  const replay = replayStoryship({constitution, events: sameBytesTwinEvents});
  assert.equal(replay.branch_states.filter(x => x.status === 'live').length, 2);
});
```

```js
test('branch ancestry is acyclic and parent states must already exist', () => {
  assert.throws(
    () => replayStoryship({constitution, events: eventsWithFutureParentState}),
    expectCode('INVALID_STORYSHIP_BRANCH_DAG'),
  );
  assert.throws(
    () => replayStoryship({constitution, events: eventsWithCycleAttempt}),
    expectCode('INVALID_STORYSHIP_BRANCH_DAG'),
  );
});
```

- [ ] **Step 2: Run and confirm RED**

```bash
node --test test/replay.test.mjs
```

Expected: FAIL because `src/replay.mjs` does not exist.

- [ ] **Step 3: Implement deterministic cut replay**

Use only events `event_seq <= cut`; never inspect filesystem modification times or wall-clock time.

Branch rules:
- `generation-observed.payload.branch_effects` creates/updates named branch state from declared parents;
- `selection-recorded.payload.selected_branch_ids` leaves selected branches `live`;
- `selection-recorded.payload.unselected_branch_ids` derives `dormant` status without deleting ancestry;
- `continuation-recorded.payload.branch_effects` may create a new live descendant from dormant or live parents;
- `branch-composed.payload.branch_effects` must name 2+ parents and retains all parent worldlines;
- `voyage-stopped` may mark declared branch effects `stopped`;
- no branch is chosen merely because its event is latest;
- every `parent_state_id` must resolve to a state produced at an earlier event sequence;
- a state may never become its own ancestor; forward/future parent references fail with `INVALID_STORYSHIP_BRANCH_DAG`.

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

Relationship threads are deterministic event-road groupings keyed only by explicit `relationship_thread_id` on carrier manifest effects. The native carrier-effect contract therefore includes `relationship_thread_id` as a required non-empty string; absence is invalid for a carrier effect and is never inferred from similarity.

- [ ] **Step 4: Run replay and regression suites**

```bash
node --test test/replay.test.mjs
npm test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/replay.mjs test/replay.test.mjs
git commit -m "feat: replay Storyship branch history"
```

---

### Task 5: MEMORY, OPEN BERTH, and Transfer Packet sealing

**Files:**
- Create: `src/packet.mjs`
- Create: `test/packet.test.mjs`

**Interfaces:**
- Consumes: `ReplayState`.
- Produces:
  - `sealTransferPacket({replay, packet_label}): TransferPacket`
  - schema `storyship/packet/v0`
  - fields: `voyage_id`, `event_cut`, `constitution_id`, `replay_id`, `reality_projection_id`, `memory`, `open_berth`, `branch_heads`, `source_cut_ids`, `packet_label`, `packet_id`
  - `validateTransferPacket(packet, replay): true`

- [ ] **Step 1: Write failing packet tests**

```js
test('packet is REALITY + MEMORY + OPEN BERTH at an exact cut', () => {
  const replay = replayStoryship({constitution, events, cut: 5});
  const packet = sealTransferPacket({replay, packet_label: '000'});
  assert.equal(packet.schema, 'storyship/packet/v0');
  assert.equal(packet.event_cut, 5);
  assert.equal(packet.reality_projection_id, replay.projections.reality.projection_id);
  assert.deepEqual(packet.memory, {
    manifest_projection_id: replay.projections.manifest.projection_id,
    narrative_relation_ids: replay.projections.manifest.value
      .flatMap(effect => effect.narrative_relation_ids ?? [])
      .sort(),
  });
});
```

```js
test('later append cannot mutate Packet 000 sealed at an older cut', () => {
  const oldReplay = replayStoryship({constitution, events, cut: 5});
  const first = sealTransferPacket({replay: oldReplay, packet_label: '000'});
  const afterAppend = replayStoryship({constitution, events: [...events, laterEvent], cut: 5});
  const second = sealTransferPacket({replay: afterAppend, packet_label: '000'});
  assert.equal(canonicalStringify(first), canonicalStringify(second));
});
```

```js
test('protected silence cannot become OPEN BERTH', () => {
  assert.throws(
    () => sealTransferPacket({replay: replayWithProtectedSilenceMappedToOpenBerth, packet_label: '000'}),
    expectCode('FORBIDDEN_OPEN_BERTH_IMPORT'),
  );
});
```

- [ ] **Step 2: Run and confirm RED**

```bash
node --test test/packet.test.mjs
```

Expected: FAIL because `src/packet.mjs` does not exist.

- [ ] **Step 3: Implement packet sealing**

Packet construction must use projection IDs from the supplied replay and reject projection/event-cut mismatches.

MEMORY is exactly:

```js
{
  manifest_projection_id,
  narrative_relation_ids
}
```

where narrative relation IDs come only from explicit manifest references.

OPEN BERTH comes only from `open-berth` manifest effects whose status at the cut is `open`; reject any effect whose `explicit_non_imports` or linked evidence indicates a forbidden class was converted into possibility.

`packet_id` is the hash of the packet without its `packet_id` field.

- [ ] **Step 4: Run packet and full suites**

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

### Task 6: Crossing receipts and customs-link boundary

**Files:**
- Create: `src/receipt.mjs`
- Create: `test/receipt.test.mjs`

**Interfaces:**
- Consumes: replay, packet, admitted source cuts, event IDs, selector/reserve references.
- Produces:
  - `createCheckpointReceipt(input): CheckpointReceipt`
  - `createCrossingReceipt(input): CrossingReceipt`
  - `validateCheckpointReceipt(receipt): true`
  - `validateCrossingReceipt(receipt): true`
  - native schemas `storyship/checkpoint-receipt/v0`, `storyship/crossing-receipt/v0`

- [ ] **Step 1: Write failing receipt/customs tests**

A crossing receipt must bind the spec-required fields:

```js
const input = {
  constitution_id: constitution.constitution_id,
  voyage_id: 'storyship-voyage-000',
  branch_id: 'branch-a',
  parent_state_ids: [SHA('1')],
  input_packet_id: packet.packet_id,
  event_cut: 8,
  source_cut_ids: [vaultCut.source_cut_id],
  request_identity: 'human-mediated-request-000',
  provider_visible_fields: {prompt: 'fixture only'},
  observed_sibling_artifact_ids: [artifactA.artifact_id, artifactB.artifact_id],
  actual_credit_debit: 0,
  encounter_id: 'encounter-000',
  selection_mechanism_id: selector.selector_receipt_id,
  selection_outcome: 'continue-a',
  appended_event_ids: eventIds,
  resulting_branch_heads: ['branch-a', 'branch-b'],
  projection_ids: Object.values(replay.projections).map(x => x.projection_id),
  projector_versions: {'storyship/replay': 'v0'},
  canonicalization_policy: 'storyship-canonical-json-v1',
  execution_environment: {node: process.version, platform: process.platform},
  unresolved_residue: [],
  refused_residue: [],
  dormant_residue: ['branch-b'],
  previous_receipt_ids: [],
  customs_receipt_ref: null,
};
```

Tests:

```js
test('arrival without HP receipt remains unadmitted', () => {
  const receipt = createCrossingReceipt(input);
  assert.equal(receipt.customs_receipt_ref, null);
  assert.equal(receipt.destination_status, 'unadmitted');
});

test('customs link is only a reference to an HP-owned destination receipt', () => {
  const receipt = createCrossingReceipt({
    ...input,
    customs_receipt_ref: {
      owning_world: 'the-static-collective/the-haunted-phonography',
      source_cut_id: hpCustomsCut.source_cut_id,
    },
  });
  assert.equal(receipt.destination_status, 'customs-receipt-linked');
  assert.notEqual(receipt.destination_status, 'admitted');
});
```

- [ ] **Step 2: Run and confirm RED**

```bash
node --test test/receipt.test.mjs
```

Expected: FAIL because `src/receipt.mjs` does not exist.

- [ ] **Step 3: Implement exact receipt validation and identities**

Reject:
- negative or non-integer credit debit;
- duplicate sibling artifact IDs;
- non-SHA event/projection/receipt identities;
- a `customs_receipt_ref` whose owning world is not Haunted Phonography;
- arbitrary `destination_status` input.

Derive status internally:

```js
const destination_status =
  input.customs_receipt_ref === null
    ? 'unadmitted'
    : 'customs-receipt-linked';
```

Never derive `admitted` inside STORYSHIP.

- [ ] **Step 4: Run receipt and regression suites**

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
- Modify: fixture helpers as required

**Interfaces:**
- Consumes: Tasks 1–6 public interfaces.
- Produces: eleven named fixture-only tests corresponding one-to-one with the founding spec; no live provider call.

- [ ] **Step 1: Write all eleven tests before changing runtime behavior**

`test/crucible.test.mjs` must contain these exact top-level test names:

```js
test('01 replay and re-entry', ...);
test('02 stale cut', ...);
test('03 twin branch preservation', ...);
test('04 ambiguous heads', ...);
test('05 history reinterpretation', ...);
test('06 protected-silence attack', ...);
test('07 narrative overwrite attack', ...);
test('08 relationship-carrier confusion', ...);
test('09 abstraction counterexample', ...);
test('10 customs boundary', ...);
test('11 tamper evidence', ...);
```

Minimum assertions:

```js
test('08 relationship-carrier confusion', () => {
  const lookalike = {...artifactA, artifact_id: hashCanonical({
    provider_identity: 'different-provider-id',
    content_digest: artifactA.content_digest,
  })};
  const result = createStoryshipResult({
    result: 'unresolved',
    target: 'lineage_claim',
    basis_event_ids: [],
    reason_codes: ['same-bytes-without-attributable-road'],
  });
  assert.notEqual(lookalike.artifact_id, artifactA.artifact_id);
  assert.equal(result.result, 'unresolved');
});
```

```js
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
```

```js
test('11 tamper evidence', () => {
  const tampered = structuredClone(packet);
  tampered.event_cut += 1;
  assert.throws(
    () => validateTransferPacket(tampered, replay),
    expectCode('INVALID_STORYSHIP_PACKET'),
  );
});
```

- [ ] **Step 2: Run crucible and observe genuine failures**

```bash
npm run crucible
```

Expected: at least one RED if any prior task missed a required hostile invariant. If all eleven pass immediately because prior tasks already enforce them, record that fact in the Task 7 commit message body; do not weaken tests to manufacture RED.

- [ ] **Step 3: Make only the minimal runtime fixes exposed by the crucible**

For each failing case:
1. identify the narrow violated invariant;
2. add/adjust the validator or replay rule that owns it;
3. rerun that single named test with `--test-name-pattern`;
4. keep changes inside Tasks 1–6 modules rather than introducing a second policy layer.

Example command:

```bash
node --test --test-name-pattern="06 protected-silence attack" test/crucible.test.mjs
```

- [ ] **Step 4: Run full crucible and full suite**

```bash
npm run crucible
npm test
```

Expected: 11/11 crucible tests PASS; full suite PASS.

- [ ] **Step 5: Commit**

```bash
git add fixtures/crucible test/crucible.test.mjs src
git commit -m "test: prove Storyship continuity crucible"
```

---

### Task 8: Frozen Voyage 000 and fresh-process re-entry verification

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
- Consumes: all prior runtime contracts.
- Produces:
  - `verifyVoyageBundle({constitution, events, packet, checkpoint}): VerificationSummary`
  - summary fields: `voyage_id`, `constitution_id`, `event_count`, `tip_event_id`, `event_cut`, `packet_id`, `replay_id`, `projection_ids`, `branch_heads`, `destination_status`, `verification_id`

- [ ] **Step 1: Write the re-entry test first**

```js
import { spawnSync } from 'node:child_process';

test('fresh Node processes reproduce byte-identical verification summary', () => {
  const run = () => spawnSync(
    process.execPath,
    ['test/helpers/reentry-child.mjs', 'fixtures/voyage-000'],
    {cwd: new URL('..', import.meta.url), encoding: 'utf8'},
  );

  const first = run();
  const second = run();

  assert.equal(first.status, 0, first.stderr);
  assert.equal(second.status, 0, second.stderr);
  assert.equal(first.stdout, second.stdout);
  assert.equal(first.stdout.trim(), expectedCanonicalSummary);
});
```

Add a tamper case that copies the fixture in memory, changes one parent/source/receipt identity, and expects fail-closed verification.

- [ ] **Step 2: Run and confirm RED**

```bash
node --test test/reentry.test.mjs
```

Expected: FAIL because verifier and frozen voyage do not exist.

- [ ] **Step 3: Implement verifier and generate the no-spend reference voyage**

`fixtures/voyage-000/events.json` must represent, in order:

1. `voyage-created`;
2. `constitution-bound`;
3. `source-bound` to fixture raw evidence;
4. `generation-requested` with `mode: "fixture-only"` and `credit_debit: 0`;
5. sibling A `generation-observed`;
6. sibling B `generation-observed`;
7. `encounter-recorded`;
8. `selection-recorded` selecting A, leaving B dormant;
9. `continuation-recorded` for A;
10. `residue-recorded` preserving B;
11. `continuation-recorded` carrying the selected descendant to the declared HP-customs boundary via a carrier manifest effect with `carrier_ref: "hp-customs:candidate-000"` and no customs receipt;
12. `checkpoint-sealed`.

Seal Packet 000 at the declared pre-crossing cut and checkpoint the resulting no-spend voyage.

`verifyVoyageBundle()` must independently validate every identity and regenerate replay/packet outputs; it must not trust the frozen expected-summary file as input.

`test/helpers/reentry-child.mjs` prints only:

```js
process.stdout.write(`${canonicalStringify(summary)}\n`);
```

- [ ] **Step 4: Run fresh-process proof and regression suite**

```bash
node --test test/reentry.test.mjs
npm test
```

Expected: PASS with byte-identical fresh-process summary.

- [ ] **Step 5: Commit**

```bash
git add src/verify.mjs fixtures/voyage-000 test/helpers/reentry-child.mjs test/reentry.test.mjs
git commit -m "feat: freeze Storyship no-spend voyage"
```

---

### Task 9: Preflight gates for selector, Vault binding, reserve, Packet 000, and exact human GO

**Files:**
- Create: `src/preflight.mjs`
- Create: `test/preflight.test.mjs`
- Create: `voyages/.gitkeep`

**Interfaces:**
- Consumes: verifier, selector/reserve/GO/source-cut contracts.
- Produces:
  - `evaluatePreflight(input): {ready, gates, preflight_id}`
  - gate states: `pass|fail|unresolved`
  - exact gate names:
    - `constitution`
    - `continuity_crucible`
    - `fresh_process_reentry`
    - `historical_selector`
    - `real_vault_source`
    - `packet_000`
    - `protected_reserve`
    - `human_go`
    - `third_arm_nonclaim`

- [ ] **Step 1: Write failing preflight tests**

```js
test('fixture-only Voyage 000 cannot accidentally authorize live spend', () => {
  const result = evaluatePreflight({
    verification_summary: fixtureSummary,
    crucible_passed: true,
    reentry_passed: true,
    selector_receipt: recoveredSelector,
    vault_source_cut: fixtureVaultCut,
    packet: packet000,
    reserve_receipt: reserve,
    launch_go_receipt: go,
    current_head_sha: go.launch_candidate_head_sha,
    third_arm_machine_verdict_enabled: false,
  });
  assert.equal(result.ready, false);
  assert.equal(result.gates.real_vault_source.state, 'fail');
  assert.equal(result.gates.real_vault_source.reason, 'fixture-source-is-not-live-evidence');
});
```

```js
test('partial selector remains unresolved rather than silently promoted', () => {
  const result = evaluatePreflight({...validInput, selector_receipt: partialSelector});
  assert.equal(result.ready, false);
  assert.equal(result.gates.historical_selector.state, 'unresolved');
});
```

```js
test('GO must match exact current head, packet, reserve, and selector identities', () => {
  const result = evaluatePreflight({
    ...validInput,
    current_head_sha: 'f'.repeat(40),
  });
  assert.equal(result.ready, false);
  assert.equal(result.gates.human_go.state, 'fail');
});
```

```js
test('third-arm runtime verdict capability fails launch preflight', () => {
  const result = evaluatePreflight({...validInput, third_arm_machine_verdict_enabled: true});
  assert.equal(result.ready, false);
  assert.equal(result.gates.third_arm_nonclaim.state, 'fail');
});
```

- [ ] **Step 2: Run and confirm RED**

```bash
node --test test/preflight.test.mjs
```

Expected: FAIL because `src/preflight.mjs` does not exist.

- [ ] **Step 3: Implement fail-closed gate evaluation**

A live Vault source cut passes only when all are true:
- `owning_world === "autodiscography-vault"`;
- `availability_status === "available"`;
- `evidence_class === "raw-owner-evidence"`;
- `stable_locator` does not begin `fixture://`;
- `content_digest_when_available` is non-null.

Historical selector:
- `recovered` → pass;
- `partial` or `unresolved` → unresolved, `ready=false`.

Protected reserve passes only when `protected_reserve_credits > 0` and `spendable_credits >= 0`.

GO passes only when exact:
- `launch_candidate_head_sha === current_head_sha`;
- `packet_id === packet.packet_id`;
- `reserve_receipt_id === reserve.reserve_receipt_id`;
- `selector_receipt_id === selector.selector_receipt_id`.

`ready` is true only if every gate state is `pass`.

- [ ] **Step 4: Run preflight and full suite**

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

### Task 10: Operator CLI and legible launch workflow

**Files:**
- Create: `cli/storyship.mjs`
- Modify: `README.md`
- Create: `test/cli.test.mjs`

**Interfaces:**
- Consumes: runtime modules.
- Produces these commands only:
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
- No `decide`, `rank`, or `admit`.

- [ ] **Step 1: Write failing CLI tests around operator legibility**

Use `spawnSync(process.execPath, ['cli/storyship.mjs', ...])`.

Assertions:

```js
test('verify prints the seven operator questions as structured sections', () => {
  const result = run(['verify', 'fixtures/voyage-000']);
  assert.equal(result.status, 0, result.stderr);
  for (const heading of [
    'WHERE AM I?',
    'WHAT IS TRUE?',
    'WHAT ARE WE CARRYING?',
    'WHAT IS OPEN?',
    'WHAT HAPPENED?',
    'WHAT CAN I DO NEXT?',
    'WHAT IS NOT MINE TO DECIDE?',
  ]) assert.match(result.stdout, new RegExp(heading.replace('?', '\\?')));
});
```

```js
test('forbidden authority commands do not exist', () => {
  for (const command of ['decide', 'rank', 'admit']) {
    const result = run([command]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /unknown command/);
  }
});
```

```js
test('preflight is provider-free and reports blocked live gates without side effects', () => {
  const before = snapshotDirectory('fixtures/voyage-000');
  const result = run(['preflight', 'fixtures/voyage-000']);
  const after = snapshotDirectory('fixtures/voyage-000');
  assert.equal(before, after);
  assert.match(result.stdout, /LIVE DEPARTURE: BLOCKED/);
});
```

- [ ] **Step 2: Run and confirm RED**

```bash
node --test test/cli.test.mjs
```

Expected: FAIL because CLI does not exist.

- [ ] **Step 3: Implement explicit command routing**

Use a small explicit parser; do not add a command framework dependency.

Top-level dispatch shape:

```js
const [command, subcommand, ...args] = process.argv.slice(2);

if (command === 'constitution' && subcommand === 'verify') { /* verify exact receipt */ }
else if (command === 'voyage' && subcommand === 'create') { /* create file-backed voyage */ }
else if (command === 'source' && subcommand === 'bind') { /* append source-bound */ }
else if (command === 'replay') { /* print deterministic replay */ }
else if (command === 'packet' && subcommand === 'seal') { /* seal exact cut */ }
else if (command === 'observe' && subcommand === 'generation') { /* append observed provider facts */ }
else if (command === 'encounter' && subcommand === 'record') { /* append human encounter */ }
else if (command === 'selection' && subcommand === 'record') { /* append historical-selector result */ }
else if (command === 'continuation' && subcommand === 'record') { /* append continuation */ }
else if (command === 'checkpoint' && subcommand === 'seal') { /* seal checkpoint */ }
else if (command === 'verify') { /* verify bundle */ }
else if (command === 'crucible') { /* run fixture crucible */ }
else if (command === 'preflight') { /* evaluate gates only */ }
else {
  process.stderr.write(`unknown command: ${[command, subcommand].filter(Boolean).join(' ')}\n`);
  process.exitCode = 2;
}
```

Each comment above names the already-defined runtime function that the command calls; the CLI must not duplicate validation logic.

CLI writes must:
- read existing ledger;
- validate before append;
- write canonical JSON plus newline;
- never edit an existing accepted event;
- refuse to overwrite an existing packet/receipt identity with different bytes.

README must document the human-mediated crossing:

```text
seal packet -> human carries declared input to provider
-> provider exposes observable sibling pair
-> human records observation
-> Storyship appends observation
-> human encounter + historical selector
-> candidate reaches HP customs
```

and state explicitly that the CLI has no provider credential handling.

- [ ] **Step 4: Run CLI, no-spend preflight, and full suite**

```bash
node --test test/cli.test.mjs
npm test
npm run verify
npm run crucible
npm run preflight
```

Expected:
- tests PASS;
- verify PASS;
- crucible 11/11 PASS;
- preflight exits non-zero or reports `ready:false` because fixture Voyage 000 is not live evidence and has no exact live GO.

- [ ] **Step 5: Commit**

```bash
git add cli/storyship.mjs README.md test/cli.test.mjs package.json
git commit -m "feat: add Storyship operator CLI"
```

---

### Task 11: Recover the historical selector and bind one real Vault source cut without fabricating readiness

**Files:**
- Create only when supported by evidence:
  - `docs/receipts/historical-selector-001.md`
  - `voyages/storyship-001/selector.json`
  - `voyages/storyship-001/source-cuts/vault-000.json`
- Otherwise create:
  - `docs/receipts/historical-selector-001.md` documenting the unresolved/partial recovery
  - `voyages/storyship-001/selector.json` with `recovery_status: "partial"` or `"unresolved"`
- Test: `test/live-materials.test.mjs`

**Interfaces:**
- Consumes: project-owned evidence from GitHub/Vault/history plus Task 2 receipt constructors.
- Produces: attributable selector and source-cut records only; never invents missing provider metadata.

- [ ] **Step 1: Search project-owned sources before writing a selector receipt**

Inspect, in authority order:
1. Autodiscography Vault source material and issue/history around historical selection;
2. STORYSHIP / HP founding design references;
3. GitHub issue/PR discussions that explicitly describe pre-Bandcamp self-selection;
4. current human testimony if supplied during execution.

Record each usable source as an exact repository/path/commit/blob or provider-stable locator.

Do not infer the selector from later ranking behavior.

- [ ] **Step 2: Write the analytical receipt before the machine receipt**

`docs/receipts/historical-selector-001.md` must separate:

```text
DOCUMENTED:
- exact sourced claims

INFERENCE:
- narrow interpretation supported by those sources

UNRESOLVED:
- missing cadence, visible fields, treatment, or edge cases

REJECTED SUBSTITUTES:
- pick better song
- highest score
- latest
- most similar
- model ranking
```

No claim moves from `UNRESOLVED` to `DOCUMENTED` without a source.

- [ ] **Step 3: Create selector receipt at the earned recovery level**

If all required selector fields are supported, create `recovery_status: "recovered"`.

If some are supported but any required historical behavior remains uncertain, create `recovery_status: "partial"`.

If the mechanism cannot be identified beyond rejected substitutes, create `recovery_status: "unresolved"`.

Construct the selector input directly from the evidence table written in Step 2, then run that object through `createSelectorReceipt()` and store the sealed output. For a partial recovery, the machine receipt must copy only the evidence references that Step 2 classified as DOCUMENTED, set `recovery_status: "partial"`, and carry each remaining uncertainty verbatim in `unresolved_notes`.

- [ ] **Step 4: Bind one real Vault cut only if the raw owner evidence is actually accessible**

Build one source-cut input object directly from the accessible Vault record. It must contain `owning_world: "autodiscography-vault"`, the exact stable locator returned by the source owner, the exact revision/provider identity returned by that owner, the SHA-256 digest computed from the acquired raw bytes, the actual acquisition timestamp recorded during the read, `availability_status: "available"`, and `evidence_class: "raw-owner-evidence"`. Pass that object to `admitSourceCut()` and write only the sealed output.

If any required value is unavailable, do not create a fake live cut. Record the missing field in the analytical receipt and leave `real_vault_source` preflight blocked.

- [ ] **Step 5: Test the earned state and commit**

`test/live-materials.test.mjs` must validate any created selector/source receipts and assert:

```js
const preflight = evaluatePreflight(materials);
assert.equal(
  preflight.gates.historical_selector.state,
  selector.recovery_status === 'recovered' ? 'pass' : 'unresolved',
);
```

If no real Vault cut exists, assert `real_vault_source` is not `pass`.

Run:

```bash
node --test test/live-materials.test.mjs
npm test
git add docs/receipts voyages/storyship-001 test/live-materials.test.mjs
git commit -m "docs: bind Storyship launch evidence"
```

---

### Task 12: Seal actual reserve, Packet 000 candidate, and stop at the exact human-GO boundary

**Files:**
- Create when actual observations exist:
  - `voyages/storyship-001/reserve.json`
  - `voyages/storyship-001/events.json`
  - `voyages/storyship-001/packet-000.json`
- Do **not** create `launch-go.json` until the human approves the exact candidate head + exact packet identity.

**Interfaces:**
- Consumes: recovered selector, real Vault cut, verified runtime, actual observed credit balance.
- Produces: final committed no-spend launch candidate whose exact Git head and exact Packet 000 identity can be presented for human GO.

- [ ] **Step 1: Observe and receipt the actual credit balance without spending**

Use a human-visible provider balance observation. Record that observation as JSON with the exact integer balance, observation timestamp, and evidence reference; choose a positive protected reserve explicitly before calling the constructor. Load the observation file and create the receipt from its values:

```js
const observation = JSON.parse(await readFile(creditObservationPath, 'utf8'));
const reserve = createReserveReceipt({
  observed_available_credits: observation.observed_available_credits,
  protected_reserve_credits: observation.protected_reserve_credits,
  observed_at: observation.observed_at,
  basis_ref: observation.basis_ref,
});
```

The observation file must contain values actually observed during this step. If no trustworthy balance is observable, do not write `reserve.json`; preflight remains blocked.

- [ ] **Step 2: Create the live voyage genesis/source events and seal Packet 000 without provider spend**

Using the real Vault cut and recovered selector receipt, create the minimum pre-provider event road:
- `voyage-created`;
- `constitution-bound`;
- `source-bound`;
- `packet-sealed`.

Seal `voyages/storyship-001/packet-000.json`.

No `generation-requested` event with positive credit debit is appended in this task.

- [ ] **Step 3: Run all verification and preflight gates except human GO**

```bash
npm test
npm run crucible
node cli/storyship.mjs verify voyages/storyship-001
node cli/storyship.mjs preflight voyages/storyship-001
```

Expected if all evidence is available:
- constitution PASS;
- crucible PASS;
- re-entry PASS;
- selector PASS;
- real Vault source PASS;
- Packet 000 PASS;
- protected reserve PASS;
- third-arm nonclaim PASS;
- human GO FAIL/UNRESOLVED;
- `ready:false`.

- [ ] **Step 4: Commit the no-spend launch candidate**

```bash
git add voyages/storyship-001
git commit -m "chore: seal Storyship launch candidate"
```

If Task 12 cannot earn selector, Vault, balance, or reserve evidence, commit only the truthful receipts that exist and leave preflight blocked; do not create substitutes.

- [ ] **Step 5: Freeze and present the exact launch candidate identity**

Run:

```bash
git status --short
git rev-parse HEAD
node --input-type=module -e "import p from './voyages/storyship-001/packet-000.json' with {type:'json'}; console.log(p.packet_id)"
node cli/storyship.mjs preflight voyages/storyship-001
```

Require a clean working tree before presenting the pair.

Present exactly:
- launch candidate head SHA;
- Packet 000 ID;
- actual available credits;
- protected reserve;
- all preflight gate states;
- explicit statement that no live generation spend has occurred.

Do not perform a provider generation in this task.

The next human approval must name or unambiguously approve that exact head + packet pair. Only then may a later execution step create `storyship/launch-go/v0` and proceed to DEPARTURE.

---

## Final Verification Before Live GO

Run all of the following from a clean checkout / fresh process:

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

Required state before requesting exact human GO:

```text
Node >=22
full test suite PASS
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

The implementation is complete at that boundary. DEPARTURE is a separately receipted human-authorized event against the exact launch candidate head and exact Packet 000 identity.
