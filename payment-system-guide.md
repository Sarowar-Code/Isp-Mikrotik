# O3 Payment Model Strategy

**For:** ISP Management System (SuperAdmin / Admin / Reseller / User)
**Date:** October 22, 2025
**Author:** (Generated plan)

---

## 1. Objective

Design a robust, auditable payment strategy for the **O3 model** where SuperAdmin sells subscription plans to Admins, Admins sell packages to Resellers, and Resellers bill end Users. Start with a manual bKash flow (MVP) and evolve to automated bKash integration, reporting, and reconciliation.

---

## 2. Goals & Requirements

- **Reliable record-keeping** for all payments (pending/verified/failed).
- **Role-based verification**: appropriate actor verifies incoming payments.
- **Retryable uploads & transaction persistence** for reliability.
- **Monthly resets & reporting** for Admins/Resellers (`ResetHistory`).
- **Scalable automation**: integrate bKash callbacks later; CRON
  for expiry & reminders.
- **Security & auditing**: unique trxId, role checks, logs.

---

## 2.1 Key Models (summary)

### 2.1 Subscription plan model (SuperAdmin-created)

### 2.2 Payment model

### 2.3 ResetHistory model

### 3.4 Role Schemas (Admin, Reseller, SuperAdmin, User)

Add `paymentInfo` to each relevant role:

```js
paymentInfo: {
  monthlyFee: { type: Number, default: 0 },
  lastPaymentDate: { type: Date },
  nextPaymentDue: { type: Date },
  paymentStatus: { type: String, enum: ["Paid","Pending","Overdue"], default: "Pending" }
}
```

---

## 4. Workflow (MVP — Manual and bKash)

### 4.1 Admin → SuperAdmin (Subscription plans)

1. Admin selects plan and submits amount + `trxId` via admin UI.

2. Backend creates `Payment` record:

   - `payerModel: "Admin"`, `subscriptionId` set, `status: "pending"`.etc etc

3. Notification sent to SuperAdmin dashboard (or email). or no need to do this, cause database will say that , payment is done or not,

4. SuperAdmin verifies by checking bKash or bank record: ?? or somthing else

   - On success: set `status: "paid"`, store `paidAt`, `verifiedAt`, update Admin `paymentInfo` (lastPaymentDate, nextPaymentDue), extend subscription validity.
   - On failure: mark `status: "overdue"` or `failed` (business decision).

### 4.2 Reseller → Admin (Package / B2B)

- Same as above but verification performed by Admin.

### 4.3 User → Reseller (B2C)

- Reseller records the payment manually (or use bKash integration later).
- Create `Payment` with `payerModel: "User"`, `receiverRole: "reseller"`. Reseller verifies and updates user account (activate/extend service) and reseller `ResetHistory`.

---

## 5. Workflow (Automated — bKash integration)

- Replace manual trx entry with bKash checkout.
- bKash sends callback to `/api/payments/bkash/callback` containing `trxId`, `amount`, `payerInfo`.
- Server validates callback signature and amount; then:

  - Create or update `Payment` record and set `status: "paid"`, `paidAt`.
  - Trigger downstream actions (activate subscription, update `paymentInfo`, send receipts).

- Use polling or reconciliation webhook if bKash supports asynchronous settlement.

---

## 6. Endpoints (API)

**Payment management**

- `POST /api/payments` — Create manual payment (payer supplies trxId or marked manual).
- `GET /api/payments` — List payments (filters: payerModel, status, date range).
- `GET /api/payments/:id` — Get payment detail.
- `PATCH /api/payments/:id/verify` — Verify payment (role-restricted).
- `POST /api/payments/bkash/callback` — bKash callback endpoint (secure).
- `GET /api/payments/:id/reconcile` — Manual reconcile helper.

**Billing & Reports**

- `GET /api/reset-history?ownerId=&month=` — monthly summary
- `POST /api/reset-history/process` — run manual reset (admin-only)

---

## 7. CRON Jobs & Schedulers

- **Daily**

  - Reconcile pending payments older than X days (send alerts).
  - Reconcile bKash pending transactions (if having polling integration).

- **Weekly**

  - Generate summary of pending/verifying transactions for SuperAdmin/Admin.

- **Monthly**

  - Create `ResetHistory` entries for each Admin and Reseller.
  - Deduct auto-renewals (if integrated) or mark for manual renewal reminders.

- **Notification schedule**

  - 7 days before `nextPaymentDue` → reminder email/SMS
  - 2 days before due → urgent reminder
  - On overdue → account flagging (throttle services if required)

---

## 8. Verification Rules & Business Logic

- **Unique trxId**: enforce uniqueness at DB level with index `{ transactionId: 1 }` unique when present.
- **Role verification**

  - SuperAdmin can verify Admin payments.
  - Admin can verify Reseller payments.
  - Reseller can verify User payments.

- **Auto-assign nextDueDate**: use `paymentSchema.pre("save")` as provided; if `paidAt` present and subscription exists, compute `nextDueDate`.
- **Partial/fractional payments**: Decide policy — allow partial (update `amountPaid` & `status: pending`) or require full payment.
- **Refunds & corrections**: Add `refunds` or `adjustments` collection later.

---

## 9. DB Migration Steps (to update existing data)

1. Add `paymentInfo` field to each role collection. Backfill:

   - `monthlyFee` from current plan or 0.
   - `lastPaymentDate` from last `Payment` with `status: paid`.
   - `nextPaymentDue` calculate using lastPaymentDate + billing cycle.

2. Add `Payment` collection and backfill from historical CSVs/existing logs if present.
3. Add unique index on `transactionId` (sparse unique index to allow null).
4. Add `ResetHistory` collection and compute last 6 months aggregates.
5. Test migration in staging with a snapshot backup.

---

## 10. Security & Auditing

- **Auth**: JWT or session cookies with role middleware on verification endpoints.
- **Input validation**: amount, trxId format, payerId ownership.
- **Audit logs**: store `action`, `actorId`, `actorRole`, `timestamp`, `before`, `after`.
- **Rate limit** verification endpoints to prevent abuse.
- **Webhook security**: validate bKash signatures; restrict by IP if possible.
- **DB constraints**: unique trxId index, required fields.

---

## 11. Monitoring & Alerts

- Track metrics: `payments_pending_count`, `payments_failed_rate`, `avg_verification_time`.
- Alerts:

  - High pending queue (> threshold)
  - Spike in failed verifications
  - Missing daily CRON job runs

- Add dashboard tiles for SuperAdmin: pending verifications, monthly revenue, overdue accounts.

---

## 12. Testing Checklist

- [ ] Create manual payment → pending → verified flows for Admin, Reseller, User.
- [ ] Attempt duplicate trxId → expect rejection.
- [ ] Backfill migration in staging and verify `paymentInfo` correctness.
- [ ] Simulate bKash callback (successful & failed).
- [ ] CRON job runs: ResetHistory generation & reminders.
- [ ] Security tests: role escalation, webhook signature bypass.

---

## 13. Implementation Roadmap (minimal phased plan)

### Phase 0 — Design & Migrations (1 sprint)

- Finalize schema, add `paymentInfo` to role models
- Add unique indexes & audit log model
- Backfill historical data

### Phase 1 — MVP (Manual bKash) (1–2 sprints)

- Implement Payment endpoints: create, list, verify
- Manual verification UI for SuperAdmin/Admin/Reseller
- Notifications for pending verifications
- Monthly reset job & `ResetHistory` generation

### Phase 2 — bKash Integration (1–2 sprints)

- Integrate bKash checkout & callback handling
- Automatic verification on callback
- Reconciliation endpoint to handle inconsistencies

### Phase 3 — Automation & Analytics (2 sprints+)

- Auto-renewal (opt-in)
- Commission engine (split payments)
- Dashboard analytics & exportable invoices
- Auto invoice generation & emailing

---

## 14. Sample Payment Payloads (examples)

**Create manual payment (Admin → SuperAdmin)**

```json
POST /api/payments
{
  "payerId": "64f1a2b4c9b9f7a1d0e5b4a0",
  "payerModel": "Admin",
  "subscriptionId": "6502ccf0a7b3d2d22f123456",
  "amount": 5000,
  "transactionId": "BKASH-20251004-0001",
  "paymentMethod": "manual",
  "status": "pending",
  "notes": "Paid to CodersKite via agent"
}
```

**bKash callback payload (server receives)**

```json
POST /api/payments/bkash/callback
{
  "transactionId": "BKASH-20251004-0001",
  "amount": 5000,
  "payerPhone": "017XXXXXXXX",
  "merchantInvoice": "ADM20251004-1",
  "signature": "..."
}
```

---

## 15. Quick Implementation Tips

- Use `refPath` (as in your schema) to support polymorphic `payerModel`.
- Keep `receiver` fields explicit (e.g., `receiverId`, `receiverModel`) for clarity.
- Use sparse unique index for `transactionId`:

  ```js
  paymentSchema.index({ transactionId: 1 }, { unique: true, sparse: true });
  ```

- Use role-based middleware `canVerifyPayment(role)` to force allowed verifier roles.

---

## 16. Deliverables (what to produce next)

- `payment.model.js` (as provided, cleaned)
- Role schema updates (Admin, Reseller, User)
- Payment controller (`create`, `list`, `verify`, `reconcile`)
- bKash callback handler (secure)
- CRON script for monthly `ResetHistory`
- Postman collection for manual testing
- Small UI pages for manual payment submission & verification

---

## 17. Final notes

Start with the **MVP manual flow** — it minimizes early complexity and allows you to validate flows with real users. Then add **automated bKash integration** and analytics once the core flows and reporting are stable.

---

**End of O3 Payment Model Strategy**
