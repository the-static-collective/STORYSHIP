# STORYSHIP — LIFE SHIP / Narrative Navigation 001

**Status:** Proposed extension. Not adopted founding law, not an executable proof.  
**Date:** 2026-10-06  
**Owner:** `the-static-collective/STORYSHIP`  
**Proposed seam:** a navigator-facing *projection* over the existing append-only voyage, not a replacement for the voyage runtime.

> We are building a life ship for self to navigate the unknown through narrative.

## 1. The distinction that makes this a ship

The **self is the navigator**, not a state object the software owns. The **ship is an instrumented environment** for carrying orientation through change; it is not a commander, oracle, identity registry, or substitute life. **Narrative is the navigational medium**: a revisable account relating where we were, what happened, what choices we made, what remains unknown, and which openings we can now explore.

This sits **beside**, not over, STORYSHIP's founding Relationship Passenger Law:

- **Person / self:** holds first-person agency, including the freedom not to disclose.
- **Relationship passenger:** the particular continuity the voyage must not silently destroy or falsely invent.
- **Artifact:** the carrier of attributable traces.
- **Ship:** the bounded apparatus that preserves a voyage and offers navigation tools.
- **Narrative:** a situated *interpretation* of evidence and experience, never the evidence itself.

The self may travel with relationships. The ship preserves their attributable traces without declaring that it *possesses* either the person or the relationship.

## 2. Why this is an extension, not a new founding

The repository's 2026-08-31 Launch Keel already defines a Reality/Narrative braid, exact-cut replay, relationship threads, branch heads and dormant branches, OPEN BERTH, human steering, and a customs boundary. It also records its own ancestry in Haunted Phonography.

This proposal adds a **human-facing navigational grammar**: a way to ask what is known, what is being interpreted, what might happen, and which choices remain the traveler's own.

It **does not** alter `constitution/constitution.json`, migrate founding sources, rewrite historical steering, unlock Suno spend, grant destination admission, or change existing event/packet schemas.

Existing repository contract outranks this proposal. New artifacts remain proposals until explicitly admitted by the owner.

## 3. The instruments on the life ship

The instruments are views, not new authorities:

| Instrument | Navigator question | Existing basis / boundary |
| --- | --- | --- |
| **LOOKOUT** | What can actually be observed now? | REALITY and attributable source cuts. Unknown is marked unknown. |
| **LOGBOOK** | What happened, and where did the account come from? | Ordered voyage events and immutable earlier cuts. |
| **CHARTROOM** | What relationships and branches connect this to where I was? | Branch DAG, dormant alternatives, relationship threads. A map is a projection. |
| **NARRATIVE DECK** | Which accounts could make sense of this passage? | Interpretations cite `basis_event_ids`; multiple incompatible readings may coexist. |
| **COMPASS** | What matters to *me* at this point? | Human-declared values, questions and intentions. No algorithmic mandate or score of personhood. |
| **HORIZON** | What is genuinely possible, and what is still unresolved? | Properly scoped OPEN BERTH, distinguished from missing evidence, refusal and protected silence. |
| **HELM** | What am *I* choosing next, if anything? | Explicit navigator action. Suggestion ≠ selection ≠ execution ≠ admission. |
| **HARBOR** | Where did a proposed crossing actually arrive? | Source-local receipts; destination-local HOLD / REFUSE / ADMIT stay under the destination's law. |

The vessel can display *parallel* charts. A powerful or frequently repeated narrative does not gain authority merely by becoming familiar.

## 4. The navigational turn

A minimal turn is:

```text
human-declared question / intent
        |
attributable evidence at exact voyage cut
        |
LOOKOUT — observations / unknowns / silences
        |
NARRATIVE DECK — one or more competing interpretations with bases
        |
CHARTROOM + HORIZON — branches, continuities, open possibilities
        |
COMPASS — traveler-declared meaning or priorities (optional)
        |
HELM — HOLD / explore / choose / do nothing / leave
        |
optional bounded crossing to another instrument
        |
arrival witness; destination decides locally
        |
new event only on explicitly recorded consequence
```

**Interpretation ≠ observation. Navigation proposal ≠ human selection. Selection ≠ permission to act. Arrival ≠ admission.**

A traveler may do nothing. A decision to remain unresolved is a valid outcome. Re-entry to an earlier cut must not mutate that cut.

## 5. Relationship to LIFE-CONVERGENCE-001

**Recent operator report (2026-10-06; pending independent repository verification):** commit `4da36b0` on `feat/adapter-harvest` reportedly demonstrated five sibling returns from an explicitly admitted synthetic page, independent HOLD/REFUSE/ADMIT dispositions, admitted PRESENT → Blender → a second generation with ancestry, and cold reconstruction of an identical manifest. The report includes 19 passing session tests and browser checks.

That would make LIFE an excellent **neighboring evidence producer**, *not* STORYSHIP's navigation authority. Before integration:

1. Resolve the exact owning repository, commit and proof paths.
2. Bind observable source cuts and operation receipts; distinguish tests from human choice.
3. Ingest a bounded declared crossing as a **proposal / witness**, never as STORYSHIP-native historical fact by resemblance.
4. Keep sibling refusals and holds attributable without treating them as selectable suggestions.
5. Keep destination-local decisions local; STORYSHIP links receipts rather than fabricating custody or admissions.

A LIFE descendant can become an ancestor without compelling the human navigator to follow it. **Generational reproduction of artifacts is not reproduction or scoring of persons.**

## 6. Failure conditions and non-imports

The proposed navigation surface fails if it:

- rewrites an earlier event or hides a refused/dormant branch;
- treats a narrative summary as ground truth;
- silently infers a person's identity, mental state, private memories, values, consent, or direction;
- converts missing evidence or protected silence into OPEN BERTH;
- auto-selects a branch, auto-executes a crossing, or decides destination customs;
- equates two branch lineages because their present renderings match;
- implies that navigational clarity requires exhaustive logging or surveillance;
- forces the historical Suno selector gate open through a new UI vocabulary;
- makes the OS boot or any existing STORYSHIP replay depend on optional navigation instruments.

The voyager has the right to opacity, absence, contradiction, departure, and return.

## 7. First executable challenge: NAVIGATION-TURN-001

Build a **no-provider, no-spend, deterministic read-only projection** from an existing frozen Storyship fixture at an exact event cut.

The specimen must demonstrate:

1. One attributable evidence cut yields at least two non-identical **interpretations** citing that same cut; neither overwrites events.
2. One traveler-declared question can remain unanswered; ambiguity is not silently repaired.
3. One dormant and one active branch remain distinguishable, including when renderings match.
4. One apparent navigational suggestion cannot generate a voyage event without a separate explicit human steering receipt.
5. One protected-silence or missing-evidence case is **not** treated as OPEN BERTH.
6. Cold replay produces byte-identical navigational projections from the same cut and declared interpretations.
7. Neither launch preflight, packet identity, historical-selector gate, nor Haunted Phonography customs changes.
8. Existing `npm test`, `npm run verify` and `npm run preflight` semantics remain intact.

First implementation should be additive: data projector + fixture + tests + minimal human-readable view. It must not require a new service, database, user account, hidden provider API, or an actual person's sensitive autobiographical data.

## 8. Neighboring projects / ownership

- **STATIC OS / Static Workbench:** optional inhabitable cockpit; owns OS/UI experience, not STORYSHIP event truth.
- **TranchNode:** possible reference / particular / memory infrastructure; no invisible memory import.
- **TranchNOSE:** optional causal inquiry about relationships; a hypothesis cannot become observation by display.
- **GHoT:** available instruments, not permission to exercise them.
- **JUBILEE / LIFE:** bounded transformations and generational receipts; not personhood or narrative authority.
- **reLATTE / SupaBardo:** passage, transport and unresolved arrival when the owner's exact contracts warrant use; no protocol presumption.
- **Haunted Phonography:** retains customs for its own destination.
- **Traveler:** chooses if and when to take the helm.

No neighboring project is required for STORYSHIP v0 boot or replay.

## 9. The shortest law

> **The ship preserves the passage. The story renders the passage navigable. The traveler chooses the bearing. The unknown remains real.**

This is a **candidate interpretive and interface design**, not a promotion to constitutional authority.
