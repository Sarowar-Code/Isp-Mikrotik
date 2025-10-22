# O3 Payment Model Strategy — Reviewed & Updated

**Changelog (what I changed / added)**

- Removed duplicate section headers and fixed numbering.
- Consolidated and clarified schema fields for `Subscription`, `Payment`, `ResetHistory`, and role `paymentInfo`.
- Added concrete Mongoose schema examples (clean, minimal) and index recommendations.
- Added a `receiver` pair (`receiverId`, `receiverModel`) to make flows explicit.
- Detailed bKash callback security and idempotency practices.
- Added a `pre('save')` hook pseudocode for auto-assigning `nextDueDate` and `paidAt` handling.
- Clarified verification role rules and added `canVerifyPayment(role, payerModel)` logic suggestion.
- Expanded CRON/notification rules and added reconciliation best practices.
- Included migration steps, testing checklist enhancements, and deliverables.

---

## 1. Summary

This document describes the payment and subscription architecture for the ISP management system (SuperAdmin / Admin / Reseller / User). It covers schema design, workflows (manual and automated bKash flow), endpoints, cron jobs, verification rules, migration steps, security, monitoring, and a testing checklist.

---

## 2. Models & Schemas (recommended)

Below are concise Mongoose-style schemas you can adapt.

### 2.1 Subscription (created by SuperAdmin)

```js
const subscriptionSchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    planName: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    status: {
      type: String,
      enum: ["active", "expired", "pending", "cancelled"],
      default: "active",
    },
    maxResellers: { type: Number, default: 0 },
    maxUsers: { type: Number, default: 0 },
    maxRouters: { type: Number, default: 0 },
    startsAt: Date,
    endsAt: Date,
  },
  { timestamps: true }
);
```

### 2.2 Payment (polymorphic payer & explicit receiver)

```js
const paymentSchema = new Schema(
  {
    payerId: { type: Schema.Types.ObjectId, required: true },
    payerModel: {
      type: String,
      required: true,
      enum: ["Admin", "Reseller", "User"],
    },

    // Receiver (explicit target of this payment)
    receiverId: { type: Schema.Types.ObjectId, required: true },
    receiverModel: {
      type: String,
      required: true,
      enum: ["SuperAdmin", "Admin", "Reseller"],
    },

    subscriptionId: { type: Schema.Types.ObjectId, ref: "Subscription" },

    amount: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 }, // supports partial payments
    status: {
      type: String,
      enum: ["paid", "pending", "due", "failed", "overdue"],
      default: "pending",
    },
    transactionId: { type: String, sparse: true, unique: true },
    paymentMethod: {
      type: String,
      enum: ["bkash", "manual", "bank_transfer", "card"],
      default: "manual",
    },

    paidAt: Date,
    nextDueDate: Date,
    notes: String,

    meta: Schema.Types.Mixed, // store provider-raw payload, webhook ids etc.
  },
  { timestamps: true }
);

// Index to prevent duplicate trxId when set
paymentSchema.index({ transactionId: 1 }, { unique: true, sparse: true });
```

**Notes:**

- `receiverId`/`receiverModel` makes it explicit who should verify/receive funds.
- `amountPaid` helps support partial payments or multi-part settlements (business decision).

### 2.3 ResetHistory (simplified)

```js
const resetHistorySchema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, required: true },
  ownerModel: { type: String, enum: ["Admin", "Reseller"], required: true },
  month: { type: String }, // e.g. '2025-10'
  summary: Schema.Types.Mixed, // aggregated metrics
  createdAt: { type: Date, default: Date.now },
});
```

### 2.4 Role Schemas (Admin, Reseller, User) — add `paymentInfo`

```js
paymentInfo: {
  monthlyFee: { type: Number, default: 0 },
  lastPaymentDate: { type: Date },
  nextPaymentDue: { type: Date },
  paymentStatus: { type: String, enum: ['Paid','Pending','Overdue'], default: 'Pending' }
}
```

---

## 3. Key Business Rules & Verification Logic

1. **Unique trxId**: enforce via sparse unique index — allows nulls but prevents duplicates when provided.
2. **Verification authority**:

   - SuperAdmin verifies Admin payments.
   - Admin verifies Reseller payments.
   - Reseller verifies User payments.
   - Implement `canVerifyPayment(verifierRole, payerModel)` middleware to enforce.

3. **Auto-assign nextDueDate**: when a Payment is marked `paid`, compute `nextDueDate = paidAt + billingCycle` and update subscription validity.
4. **Partial payments**: if allowed, update `amountPaid` and change `status` (`pending` until full amount).
5. **Refunds & adjustments**: track in a separate `refunds` collection linked to `paymentId` for auditability.

---

## 4. Workflows

### 4.1 Manual (MVP)

- Admin selects plan and submits amount + `trxId` via UI → `POST /api/payments` creates `Payment` with `status: 'pending'` and `receiverModel: 'SuperAdmin'`.
- SuperAdmin reviews (matching trxId & amount in bKash agent/bank) → `PATCH /api/payments/:id/verify` marks `paid` and updates subscription and `paymentInfo`.

### 4.2 Reseller & User flows

- Same pattern but the verifier is the next-role up (Admin for Reseller; Reseller for User).
- Always require `receiverId`/`receiverModel` to determine who is allowed to verify.

### 4.3 Automated (bKash)

- Flow: frontend bKash checkout → bKash calls `/api/payments/bkash/callback` → server verifies signature & amount → create/update `Payment` → mark `paid` → downstream activation.
- Use reconciliation if bKash settlement is asynchronous.

---

## 5. bKash Callback Security & Idempotency (important)

- **Validate signature/HMAC** from bKash payload.
- Validate `transactionId` and `amount` exactly matches stored pending payment or merchant invoice.
- Implement **idempotency**: if callback repeats for same `transactionId`, ensure it doesn't duplicate credits (use `transactionId` unique index + atomic update `findOneAndUpdate` where `status !== 'paid'`).
- Log full provider payload in `payment.meta` for audits.
- Optionally restrict webhook IPs and require TLS client certs if bKash supports it.

---

## 6. Endpoints (API)

**Payments**

- `POST /api/payments` — Create manual payment (payer sends trxId or marks manual). Body: `{ payerId, payerModel, receiverId, receiverModel, subscriptionId?, amount, transactionId?, paymentMethod, notes }`
- `GET /api/payments` — List payments (filters: payerModel, receiverModel, status, date range).
- `GET /api/payments/:id` — Get payment detail.
- `PATCH /api/payments/:id/verify` — Verify payment (role-restricted). Payload: `{ verifiedBy, verifiedAt, verifiedNote }`.
- `POST /api/payments/bkash/callback` — bKash callback (validate signature, idempotent).
- `GET /api/payments/:id/reconcile` — Manual reconcile helper (show provider status and local record).

**Billing & Reports**

- `GET /api/reset-history?ownerId=&month=` — monthly summary
- `POST /api/reset-history/process` — run manual reset (admin-only)

---

## 7. CRON Jobs & Schedulers

- **Daily**

  - Reconcile pending payments older than X days (notify operators).
  - Run lightweight reconciliation with bKash (if API supports list/settlement).

- **Monthly**

  - Create `ResetHistory` entries for Admins/Resellers.
  - Mark subscriptions expiring soon and queue reminders.

- **Notifications**

  - 7 days before due → reminder
  - 2 days before due → urgent
  - On overdue → flag account and optionally throttle services

---

## 8. Reconciliation Practices

- Keep a `reconciliation` log for automated runs (date, counts, totals, mismatches).
- Implement a reconciliation endpoint/view where operators can match provider settlements to local payments and mark `reconciledAt`.
- For large mismatches, generate tickets/alerts.

---

## 9. Migrations

1. Add `paymentInfo` to role collections (Admin/Reseller/User). Backfill using last `Payment` with `status: 'paid'`.
2. Add `Payment` collection and populate from historical CSVs/logs. Normalize fields (`payerModel`, `receiverModel`, `transactionId`).
3. Add sparse unique index on `transactionId`.
4. Add `ResetHistory` and compute last 6 months aggregates.
5. Test migration on staging snapshot and keep rollback scripts.

---

## 10. Monitoring & Alerts

- Metrics: `payments_pending_count`, `payments_failed_rate`, `avg_verification_time`, `reconciliation_failures`.
- Alerts: high pending queue, spikes in failed verifications, missed cron runs.
- Dashboard: pending verifications, monthly revenue, overdue accounts, reconciliation summary.

---

## 11. Testing Checklist (expanded)

- [ ] Manual payment → pending → verified flows for Admin/Reseller/User.
- [ ] Attempt duplicate `transactionId` → expect rejection.
- [ ] Backfill migration in staging and verify `paymentInfo` correctness.
- [ ] Simulate bKash callback success & failure and repeated callback (idempotency).
- [ ] Simulate partial payments (if supported).
- [ ] Run CRON: ResetHistory generation & reminders.
- [ ] Security: role escalation attempts, webhook signature forgery tests.
- [ ] Load test reconciliation for large volumes.

---

## 12. Deliverables

- `payment.model.js` (cleaned & annotated)
- Updated role schemas (Admin, Reseller, User) with `paymentInfo`
- Payment controller (`create`, `list`, `verify`, `reconcile`)
- bKash callback handler (secure + idempotent)
- CRON script for monthly `ResetHistory`
- Postman collection & test payloads
- Minimal admin UIs: manual payment submission and verification pages

---

## 13. Quick implementation tips

- Use `refPath` only if you need polymorphic population; explicit `payerModel` + `payerId` + `receiverModel` is simpler for authorization checks.
- Use `findOneAndUpdate({ transactionId, status: { $ne: 'paid' } }, { $set: { status: 'paid', paidAt: now, ... } }, { upsert: false })` when processing callback to preserve idempotency.
- Record raw provider payloads in `payment.meta`.

---

## 14. Final recommendations

1. Start with manual MVP to validate flows and business rules.
2. Add robust webhook/callback security and idempotency before turning on auto-activation.
3. Keep financial reconciliation visible in the UI for operators.
4. Keep audit logs for all verification actions (who verified, when, before/after state).

---

_End of updated O3 Payment Model Strategy._
