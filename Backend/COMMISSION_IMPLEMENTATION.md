# Commission Implementation Plan (No Code Changes Applied)

This document analyzes the current project wiring and outlines exactly how to implement the new distance-based commission rules (fixed seller + percent per upline) without altering runtime code yet.

## Project Analysis (current behavior)
- Policy flow: customers create policies; payments are verified in [Backend/controllers/payment.controller.js](Backend/controllers/payment.controller.js) and set policy `paymentStatus=PAID`; admin approval in [Backend/controllers/admin.controller.js](Backend/controllers/admin.controller.js) sets status `APPROVED` and calls `calculateAndDistributeCommissions` from [Backend/utils/commission.util.js](Backend/utils/commission.util.js).
- Commission logic today: uses `CommissionSettings` levels; traverses parent chain while settings exist; writes `Commission` docs with fields `policyId`, `agentId`, `level`, `amount`, `percentage`, `status` (see [Backend/models/Commission.js](Backend/models/Commission.js) and [Backend/models/CommissionSettings.js](Backend/models/CommissionSettings.js)).
- Wallet credit: `approveCommission` in [Backend/utils/commission.util.js](Backend/utils/commission.util.js) moves status to `approved` and adds to agent wallet; currently invoked via admin commission approval endpoints.
- Agent hierarchy: `Agent` stores `parentAgentId` enabling upward traversal; agent code lookup is used during policy creation.

## Required Business Rules (target behavior)
- Fixed seller commission by term: 1y ₹300, 2y ₹450, 3y ₹750.
- Upline percentages by distance from seller: [5%, 3%, 2%, 2%, 1%] for distances 1–5; stop if no parent or after 5.
- Each commission row must store: `agentId`, `policyId`, `distanceFromSeller` (0–5), `commissionAmount`, `commissionType` ('fixed' or 'percentage'), `createdAt` (auto). Add `premiumAtSale` and `planTermYears` for audit.
- Agent levels are not stored; distance is computed at runtime from the seller up the chain.

## Implementation Plan (step-by-step)
1) Schema adjustments (backward-compatible):
  - Extend [Backend/models/Commission.js](Backend/models/Commission.js) with optional fields: `distanceFromSeller` (Number), `commissionType` (String enum), `premiumAtSale` (Decimal128), `planTermYears` (Number). Keep existing `level`/`percentage` for compatibility or mark deprecated in comments; set defaults so old code does not break.

2) New calculator service (replace `calculateAndDistributeCommissions` in [Backend/utils/commission.util.js](Backend/utils/commission.util.js)):
  - Remove reliance on `CommissionSettings`; hardcode fixed map `{1:300,2:450,3:750}` and `parentPercents=[5,3,2,2,1]`.
  - Derive term (1/2/3) from policy duration/plan (e.g., `policy.duration` or `policy.planId.duration`); default to 1 if unknown.
  - Steps inside a Mongo session:
    1) If no `policy.agentId`, return [] (direct sale).
    2) Add seller record (distance 0, fixed amount, type `fixed`).
    3) Traverse parents up to 5: for each parent, compute `premium * pct/100`, store distance N, type `percentage`.
    4) Insert many with the provided session; return inserted docs.
  - Idempotency: before insert, check `Commission.exists({ policyId: policy._id })`; skip if found.

3) Controller integration:
  - In `approvePolicy` in [Backend/controllers/admin.controller.js](Backend/controllers/admin.controller.js), after status moves to `APPROVED`, call the updated calculator (within the same session) and attach the count/ids to the response. Keep try/catch so failure does not break approval.
  - In [Backend/controllers/payment.controller.js](Backend/controllers/payment.controller.js), remove or keep the calculator call depending on when commissions should appear. Preferred: only on approval to avoid double calculation; if kept on payment, guard with the idempotency check above.

4) Wallet payout flow (unchanged):
  - Keep `approveCommission` to credit wallets; it can remain level-agnostic because it uses stored `amount`. No change required beyond accepting new fields in the model.

5) Edge cases and rules enforcement:
  - Short chains end naturally when `parentAgentId` is null.
  - If term not in {1,2,3}, default to 1 or throw; document chosen behavior.
  - Use Decimal128 for stored amounts; convert numbers with existing `decimal128ToNumber` helpers when needed.
  - Guard against double approval: if policy already `APPROVED`, skip recalculation.

6) Testing checklist:
  - Chains of length 0..6 to verify stop-at-5 logic and distance labels.
  - Terms 1/2/3 for fixed amounts; mismatched term fallback.
  - Re-approval or double-calc attempt does not duplicate commissions.
  - Direct sale (no agent) produces zero commissions.

## Integration Snippet (pseudocode only)
```
// inside calculateAndDistributeCommissions(policy, session)
if (!policy.agentId) return [];
const term = getTerm(policy); // 1/2/3
const premium = Number(policy.premium);
const records = [];
records.push({ agentId: policy.agentId, distanceFromSeller: 0, commissionType: 'fixed', commissionAmount: fixedMap[term] || 0, premiumAtSale: premium, planTermYears: term, policyId: policy._id });
let current = await Agent.findById(policy.agentId).select('parentAgentId').session(session);
let d = 1;
while (current?.parentAgentId && d <= 5) {
  const pct = parentPercents[d-1];
  records.push({ agentId: current.parentAgentId, distanceFromSeller: d, commissionType: 'percentage', commissionAmount: premium * (pct/100), premiumAtSale: premium, planTermYears: term, policyId: policy._id });
  current = await Agent.findById(current.parentAgentId).select('parentAgentId').session(session);
  d++;
}
return Commission.insertMany(records, { session });
```

## Rollout Order (recommended)
1) Extend `Commission` schema with new fields (non-breaking defaults).
2) Replace calculator in `commission.util.js` with the new distance-based logic + idempotency.
3) Ensure `approvePolicy` uses the new calculator inside its transaction; optionally remove payment-time calculation.
4) Add tests for chain length, term, idempotency.
5) Migrate old Commission rows (optional): backfill `distanceFromSeller` and `commissionType` where possible; leave legacy fields for historical data.

No runtime code has been modified by this document; it is an actionable implementation guide following the requested rules.

## Rules Recap
- Seller fixed commission by term:
  - 1 Year: ₹300
  - 2 Year: ₹450
  - 3 Year: ₹750
- Parent chain: traverse up to 5 parents from the seller.
- Percent by distance (from seller): [5%, 3%, 2%, 2%, 1%].
- Each commission record stores: agentId, policyId, distanceFromSeller (0-5), commissionAmount, commissionType (fixed|percentage), createdAt.

## Data Model (Commission)
Suggested fields if not present:
- agentId: ObjectId (Agent)
- policyId: ObjectId (Policy)
- distanceFromSeller: Number (0 for seller)
- commissionAmount: Decimal128/Number
- commissionType: String ('fixed' | 'percentage')
- premiumAtSale: Decimal128/Number (audit)
- planTermYears: Number (1/2/3)
- status: String ('pending'|'approved'|'paid') if payout lifecycle is needed
- createdAt / updatedAt
Indexes: { policyId: 1 }, { agentId: 1 }

## Service Outline (commission.util.js or service file)
- `const fixedMap = { 1: 300, 2: 450, 3: 750 };`
- `const parentPercents = [5, 3, 2, 2, 1];`
- Helper `getTerm(policy)` → derive term (1/2/3) from duration/plan.
- Helper `buildCommissionRecords(policy, sellerAgentId)` → returns array of records (without DB writes).
- Helper `traverseParents(sellerAgentId, session)` → yield parent ids up the chain up to 5 levels.

## Algorithm (pseudocode)
```
async function distributeCommissions({ policy, sellerAgentId, session }) {
  if (!sellerAgentId) return []; // no agent sale

  const term = getTerm(policy); // 1/2/3
  const premium = Number(policy.premium);
  const records = [];

  // seller fixed
  records.push({
    agentId: sellerAgentId,
    policyId: policy._id,
    distanceFromSeller: 0,
    commissionAmount: fixedMap[term] || 0,
    commissionType: 'fixed',
    premiumAtSale: premium,
    planTermYears: term
  });

  // parents
  let currentId = (await Agent.findById(sellerAgentId).select('parentAgentId').session(session))?.parentAgentId;
  let distance = 1;
  while (currentId && distance <= 5) {
    const pct = parentPercents[distance - 1];
    records.push({
      agentId: currentId,
      policyId: policy._id,
      distanceFromSeller: distance,
      commissionAmount: premium * (pct / 100),
      commissionType: 'percentage',
      premiumAtSale: premium,
      planTermYears: term
    });
    currentId = (await Agent.findById(currentId).select('parentAgentId').session(session))?.parentAgentId;
    distance++;
  }

  return Commission.insertMany(records, { session });
}
```

## Where to Call It
- During policy approval (preferred): inside `/api/admin/policies/:id/approve` transaction after status set to APPROVED.
- Alternative: at payment verification if commissions must be visible earlier; still guard against duplicates.

## Idempotency / Guards
- Before inserting, check `Commission.exists({ policyId })`; skip if already created.
- Ensure policy status isn’t already APPROVED to avoid double payouts.

## Edge Cases
- Shorter parent chain: loop stops when `parentAgentId` is null.
- No sellerAgentId (direct sale): skip seller + parents.
- Unknown term: default to 1-year fixed map or reject.
- Precision: use Decimal128 in schema or round to 2 decimals before write.

## Testing Matrix
- Policy with no parent chain (only seller).
- Chain length 1..5 parents; verify amounts and distance labels.
- Chain longer than 5; ensure traversal stops at 5.
- Re-approval attempt: no duplicate commissions.
- Different terms (1/2/3) verifying fixed amounts.

## API Touchpoints (no code changes yet)
- POST /api/policies        → create policy with seller agent reference.
- POST /api/payments/verify → marks paid; optional early commission calc.
- PATCH /api/admin/policies/:id/approve → trigger commission distribution (recommended point).

## Rollout Steps (actionable)
1) Implement `distributeCommissions` service per pseudocode (keep DB writes in a session).
2) In admin policy approval handler, after setting APPROVED, call service and handle idempotency.
3) Add unit/integration tests for chain lengths and terms.
4) Optional: add payout lifecycle fields (pending/approved/paid) and wallet crediting if required.

_No code changes have been applied by this document; it is a plan only._
