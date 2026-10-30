# NARRATIVE-JUSTICE-008 — Storyship navigator / storyteller rights

**Review-only executable study · 2026-10-30.** A proposal stacked on STORYSHIP LIFE SHIP #7. Does not alter the Storyship constitution, event log, provider preflight, historical selector, transfer packet, customs authority, or a human's choices.

## The relevant discovery

Voqal Partners' public [grantmaking page](https://voqalpartners.org/grantmaking/) names **Narrative Justice**: communities should control what is said about their people and use that power to challenge misleading or harmful accounts. This is an organizational *grantmaking* emphasis; it is **not** a claim about how a particular 2027 fellowship reviewer evaluates applications.

Storyship's pre-existing LIFE SHIP #7 describes a compatible technical grammar: the **self is the navigator**, **relationship is passenger**, **ship is instrument**, **artifact is carrier**, **narrative is revisable interpretation**. Its eight instruments are LOOKOUT, LOGBOOK, CHARTROOM, NARRATIVE DECK, COMPASS, HORIZON, HELM, and HARBOR.

Narrative justice is not merely correct attribution. It concerns power **over selection, portrayal, refusal, correction, access, and participation**. The project can support that inquiry without pretending to have resolved real legal rights, collective governance, consent or documentary ethics.

## First bounded working implementation — NAVIGATION-TURN-001

The additive native module \`src/navigation-turn.mjs\` calls **original Storyship \`replayStoryship\`** over an exact event cut. It constructs an immutable, hash-addressed, **read-only** projection:

- LOOKOUT/LOGBOOK: native replay IDs, source-cut IDs and tip event, not new facts.
- CHARTROOM: true native branch heads and dormant alternatives, without erasure.
- NARRATIVE DECK: 2–8 distinct attributed **interpretations**; each references already-seen exact source event IDs. No reading is canonical or automatically selected.
- COMPASS: a human-declared local question or deliberately **WITHHELD/protected** question. A withheld question is not reflected in output.
- HORIZON: only the *already constituted* OPEN BERTH from Storyship; protected silence never becomes permission or possible opportunity.
- HELM: HOLD / explore another reading / DECLINE / propose for human review; no decision is recorded by this projector.
- HARBOR: no crossing, no arrival and no destination admission.
- **Zero appended events, zero permission, zero publication.**

The module has no storage, no provider calls, no network, no identity lookup, no generative model and no ability to publish. **The implementation is a navigation prototype, not a real participant's story-rights enforcement system.**

Verify with: \`node --test test/navigation-turn.test.mjs\` (also included in \`npm test\`). Tests use the existing source-owned *synthetic* twin-voyage fixture. They check exact-cut native replay binding, rival interpretations, read-only behavior, deterministic re-entry, stale-cut immutability, invented-source refusal, protected-silence nonleakage, and absence of auto-choice/admission.

## Project-owned neighbors — distinct owners

| Project | Role | Caution |
| --- | --- | --- |
| **Storyship** | Human navigates from attributed passage; relationship remains passenger; narrative views are projections | Ship does not own self, consent or publishing |
| **Black Star** (private) | Source/evidence lineage and non-retroactive corrections | Raw evidence belongs in private vault, never public adapter |
| **MEMENTO** (private) | Multiple world interpretations; source != story canon | Readable context not new authority |
| **3rdi** | Observer-specific cuts; who could actually perceive what, when | A projection is not permission |
| **story-dna** | Fictional relationship echoes/forks; explicit encounter gate | Private real lives are not auto-remixable characters |
| **SIA / Haunted Phonography** | Song observations, proposed transformations, rights provenance | Metadata or music generation does not confer image/story rights |
| **lemonPRESS** | Separate editorial HOLD/admission and edition changes | No automatic publication or rights transfer |
| **reLATTE** | Signed/attributed crossings and receiver-local decision boundaries | Signed != true; receipt != consent |
| **WebZ** | Public-safe, four-door narrative entrance at #213 | Doorway is a reading interface, not intake, enrollment or community proof |
| **National Treasure** | Question Box, rival theories and falsifier rather than forced answer | A question receipt is not a verdict |

No project is absorbed by this branch and no private source bodies are imported.

## The first real-world test question

> Can someone who encounters a community story change how their own contribution is represented, refuse public use, preserve a different account, and still participate in practical community work without surrendering authorship?

For the proposed Voqal fellowship this may be combined with *Still Here: The Second Table*: practical food/care invitations first; voluntary co-design of shared stories and gatherings next; independent successor governance only with actual willing people. A successful software fixture is not a participant, agreed documentary subject, meal, partnership, second table, or Voqal approval.

### Future human protection requirements (not implemented)

Real projects must address image/voice consent, third-party information, child privacy, editorial conflict, participant access and correction processes, governance power, publication scope, withdrawal of **future use** and post-publication limits (append-only records cannot guarantee forgetting of already-shared copies), translated and offline participation, and accessible no-recording alternatives. **No implied consent from silence, signatures alone, invitation clicks, or pre-existing relationships.**

For Paula's documentary or another actual film, art direction, producing, editorial control, documentary subject status and release permissions require separate agreements; narrative choice should not be inferred from enthusiasm for the film.

## Application-safe short paragraph (proposed, not submitted)

> My work grew from documenting my life into music, filmmaking, books, and experimental tools. Those forms help people imagine possible futures. But narrative justice asks a harder question: who gets to shape the story when other people enter it? In a six-month community experiment, I want to test whether invitations built around practical needs and creative expression can lead to genuinely shared authorship—where people can correct, decline, and create their own next gathering. The software can preserve a path through competing stories; it cannot manufacture consent or community.

## Nonclaims

No social outcome, human verification, consent grant, official grant decision, live internet deployment, film production agreement, or review-panel endorsement is established by this proposal. PR remains draft.
