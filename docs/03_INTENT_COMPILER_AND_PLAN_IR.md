# Intent Compiler, GoalSpec, Plan IR, and Provenance

## 1. Problem statement

Natural language is not an exact execution contract. “Move my appointment,” “send it to Adam,” or “buy the usual” can be ambiguous even when spoken by an authenticated user. Operator Kit must preserve the user's instruction while preventing a model from inventing the target, account, amount, audience, purpose, or consequence.

## 2. GoalSpec compiler stages

```text
1. Authenticate source and bind source message/transcript.
2. Classify desired outcome and candidate action families.
3. Extract protected and non-protected slots with provenance.
4. Resolve protected slots only through high-integrity sources.
5. Retrieve exact mandate defaults and provider identities.
6. Detect ambiguity, conflicts, changed intent, and forbidden effects.
7. Define terminal goal predicates and maturity horizons.
8. Canonicalize, hash, version, persist, and freeze GoalSpec.
```

### High-integrity slot sources

A protected slot can be bound by:

- exact authenticated user content;
- one unique provider-system-of-record object satisfying a deterministic query;
- an exact current mandate default;
- an exact recorded approval;
- an administrator policy where organization authority applies.

Model inference, external email/web content, summaries, nearest-neighbor memory, popularity, frequency, or “usual behavior” cannot independently bind a protected slot.

## 3. Protected fields

At minimum:

```text
action family
provider and account
recipient/target/merchant/object
audience and notification mode
amount/currency/price band
shipping or destination address
purpose consent
mandate/capability cell
budget and cap
consequence band
point of no return
authorization source
```

External or low-integrity content may fill registry-approved bounded content slots such as a message body, search query, extracted candidate fact, or a form value whose destination and semantic field are already fixed.

## 4. Ambiguity policy

| Condition | Behavior |
|---|---|
| One exact provider object and matching mandate | bind and continue |
| Several plausible protected targets | ask one precise question |
| Missing non-protected content with safe default | use disclosed deterministic default |
| Missing protected target/account/amount/audience | do not guess |
| User revision conflicts with unstarted plan node | increment intent epoch and invalidate node |
| User revision conflicts with completed reversible node | plan compensation or ask only if new authority needed |
| User revision after point of no return | disclose effect, mitigate where possible, replan remaining work |

## 5. Intent epochs

A material user change increments `intent_epoch`:

- cancellation;
- replacement goal;
- changed target, amount, audience, time, account, or consequence;
- scope narrowing or expansion;
- changed success criterion;
- instruction that completed work should be reversed or corrected.

Before each provider attempt:

```text
capability.intent_epoch == current_goal.intent_epoch
```

Otherwise the node must be semantically re-certified or superseded. An in-flight call cannot be magically cancelled; it must resolve to a known/unknown effect and be handled honestly.

## 6. Plan IR

The planner produces a finite typed DAG. Each node contains:

- canonical action and protected bindings;
- causal provenance root;
- preconditions and expected postconditions;
- provider/account/target policy;
- consequence vector;
- budget reservation requirement;
- idempotency class;
- verification strategy and grade;
- reconciliation strategy;
- recovery semantics;
- point of no return;
- uncertainty policy;
- maximum attempts;
- terminal mission predicates influenced by the node.

After authorization the Plan IR is immutable. Replanning creates a new version. Unchanged nodes may be retained only after deterministic semantic-diff certification.

## 7. Causal provenance graph

Node types:

```text
source observation
user attestation
provider object
memory item
model output
policy decision
denial
plan field
action field
provider acknowledgement
verification observation
mission outcome
```

Edges describe transformations or influence. The reference monitor computes the backward slice of every protected field and action. A summary does not erase the authority/integrity ceiling of its origins.

### Authority monotonicity

```text
authority(transform(x)) <= authority(origin(x))
```

Elevation requires a separate authenticated user confirmation or independently approved provider corroboration and a durable elevation receipt.

## 8. Denial channels

The planner receives a low-information machine code sufficient for safe continuation. The authenticated user can receive a richer explanation. Internal policy traces remain server-only.

Example:

```json
{
  "plannerCode": "missing_high_integrity_target",
  "plannerSafeDetail": "A unique target is required.",
  "authenticatedUserExplanation": "I found two calendar events named Dental appointment. Which one should I move?",
  "internalPolicyTraceRef": "ptr_..."
}
```

This prevents denied-policy details from becoming untrusted data that later influences another action.

## 9. Canonicalization

Canonical action hashing must:

- use a versioned deterministic JSON canonicalizer;
- reject `undefined`, non-finite numbers, functions, symbols, and unsupported binary values;
- normalize provider identifiers, times, currencies, email addresses, Unicode, and sorted sets according to each action contract;
- include semantically material defaults;
- exclude non-authoritative presentation metadata;
- include action contract version and policy hash.

Do not treat a generic JSON stringify order as a permanent cross-language signing contract without a documented canonicalization standard and test vectors.

## 10. Test requirements

- altered source message or transcript hash;
- two plausible recipients/objects;
- low-integrity target laundering through summary;
- changed amount after approval;
- denial feedback used by later model output;
- intent cancellation during executing state;
- semantic replan retaining an unaffected node;
- stale Plan IR capability;
- Unicode/currency/time normalization;
- canonicalization parity across Worker, server, and mobile test vectors.
