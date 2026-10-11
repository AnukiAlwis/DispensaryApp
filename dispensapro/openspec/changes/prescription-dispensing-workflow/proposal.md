## Why

The current dispensing workflow lacks structure and guidance, leading to potential medication errors and inefficient pharmacist operations. Pharmacists can work on multiple prescriptions simultaneously, increasing the risk of mistakes. There is no enforced single-patient workflow, no guided medicine preparation process, and no seamless transition to billing. This change introduces a structured, guided dispensing workflow that enforces one-patient-at-a-time processing, reduces errors through status tracking, and provides automatic queue progression.

## What Changes

- **New Prescription Dispensing Page**: A dedicated page with "Currently Serving" card and "Up Next" table
- **Medicine Preparation Modal**: Guided workflow with status cycling (NOT_STARTED → STARTED → READY_TO_DISPENSE)
- **Billing Modal**: Integrated payment processing with printable bill generation
- **Session-based Preparation State**: Frontend-only preparation progress stored in sessionStorage
- **Single Active Dispensing Enforcement**: Disables "Dispense Now" buttons when preparation is in progress
- **Automatic Queue Progression**: Auto-loads next waiting prescription after completion
- **Medicine Sorting**: Backend sorts medicines by frequency (highest to lowest) then quantity (highest to lowest)
- **Stock Validation**: Blocks dispensing if insufficient medicine quantity is available

## Capabilities

### New Capabilities
- `prescription-dispensing-workflow`: Complete guided dispensing workflow from preparation to billing
- `medicine-preparation-status`: Frontend-only status tracking for medicine preparation
- `dispensing-session-management`: Enforcement of single active dispensing session
- `billing-integration`: Payment processing and printable bill generation

### Modified Capabilities
- None (this is a new feature)

## Impact

- **Frontend**: New `features/dispensing` module (page, preparation modal, billing modal, sessionStorage utility); reuses existing `billingService`, `Bill`/`BillLineItem` types, and `apiClient`
- **Backend**: Three new endpoints (`GET /prescriptions/current-serving`, `GET /prescriptions/up-next`, `GET /prescriptions/{id}/medicines`) plus one new atomic endpoint (`POST /prescriptions/{id}/complete-dispense`). Reuses the **already-implemented** `Dispense`/`DispenseService` (per-medicine records with stock validation) and `Bill`/`BillService` (totals, discounts, status) — no new entities
- **Database**: Updates to `Medicine.quantity` and creation of `Dispense` rows via the existing entity/table; no schema migration required (Hibernate `ddl-auto`)
- **User Experience**: Structured pharmacist workflow with enforced single-patient processing
- **Dependencies**: React, sessionStorage for preparation-state persistence, existing `Prescription`/`PrescriptionItem`/`Medicine`/`Dispense`/`Bill` APIs

---

## Addendum: Backend-Driven Recovery for Dropped Tabs

### Why

Pharmacists may close the browser tab during the dispense + billing workflow. The page must allow them to see incomplete flows (for example, a prescription that has been dispensed but not yet paid) and continue the workflow to completion without relying on browser storage.

### What Changes

- **Remove localStorage/sessionStorage cross-tab recovery plan**: mid-preparation recovery is not implemented.
- **Backend recovery source**: add `GET /prescriptions/billing-pending` to return prescriptions whose `Prescription.status = DISPENSED` and whose associated `Bill.status = DUE`.
- **Frontend "Billing Pending" section**: on `PrescriptionDispensingPage`, display a list of billing-pending prescriptions with a "Complete Billing" action that opens `BillingModal` directly for the selected prescription.
- **Single-session enforcement remains frontend-only**: `sessionStorage` still disables "Dispense Now" buttons while an in-tab preparation is open, but it is **not** relied upon for cross-tab recovery.

### Impact

- **Backend**: one new repository query, one service method, and one controller endpoint. No new entities or schema changes.
- **Frontend**: add `getBillingPending()` to `dispensingService`, add `BillingPendingPrescription` type, add a new "Billing Pending" card/section to `PrescriptionDispensingPage`, and wire it to open `BillingModal` directly.
- **Database**: no changes; uses existing `prescription.status`, `bill.status`, and the existing `bill.prescription_id` relationship.

---

## Addendum: Dispense Stock Integrity Fix (Post-Implementation Gap)

### Why

Post-implementation review found that task 1.5 ("use existing `PUT /prescriptions/{id}/status` ... no new backend endpoint needed for complete-dispense") diverged from this document's own decision (see Decisions → API Design: "Looping the existing per-item `POST /dispense` endpoint from the frontend: Rejected"). The frontend's `MedicinePreparationModal.handleDispense` only calls `PUT /prescriptions/{id}/status` and **never** calls `POST /dispense` or any endpoint that creates `Dispense` rows. Consequences, confirmed against the current codebase:

1. **No stock deduction ever happens.** `Medicine.quantity` is never decremented — inventory becomes permanently inaccurate on every dispensing transaction (highest-impact gap, affects 100% of dispenses).
2. **No `Dispense` audit trail.** No record of who dispensed what, when, or how much. `BillServiceImpl.createOrRefreshLineItemsFromDispense` therefore always falls back to *prescribed* quantities (never *actually dispensed* quantities), so bill line items can silently diverge from what was really handed to the patient.
3. **No real stock validation blocking dispense.** The preparation table's red stock warning is cosmetic; the DISPENSE button is gated only by UI status-cycling (`allReady`), not by an actual backend stock check. A pharmacist can dispense a fully out-of-stock medicine.

### What Changes

- **Remove the existing single-item `/dispense` API entirely** — `DispenseController`, `DispenseService`/`DispenseServiceImpl`, and `DispenseRequestDto`/`DispenseResponseDto` are dead code from this workflow's perspective and will be deleted. The new batch endpoint replaces it completely.
- **New backend endpoint** `POST /prescriptions/{id}/complete-dispense`: single `@Transactional` operation that validates stock for **all** prescription items first (aggregating every shortfall, not just the first), then creates one `Dispense` row per item, decrements `Medicine.quantity` for each, and transitions `Prescription.status` to `DISPENSED` — all or nothing. Validation rules are copied from the removed `DispenseServiceImpl.recordDispense` (tenant checks, `ISSUED` status check, medicine active check, stock check).
- **Add the dead `note` field to `Dispense`**: the old `DispenseRequestDto.note` was accepted but never persisted (no column). Added as a nullable `String` column on `Dispense` to complete the audit trail.
- **Frontend integration**: `MedicinePreparationModal.handleDispense` calls the new endpoint instead of the bare `PUT /prescriptions/{id}/status` call. On `InsufficientStockException` (400), the modal surfaces the exact shortfall per medicine instead of silently succeeding.
- **Bill accuracy restored**: because real `Dispense` rows now exist before `billingService.calculate()` runs, `BillServiceImpl.createOrRefreshLineItemsFromDispense` uses actually-dispensed quantities, closing the prescribed-vs-dispensed discrepancy.

### Impact

- **Backend**: delete `DispenseController`, `DispenseService`/`DispenseServiceImpl`, `DispenseRequestDto`, `DispenseResponseDto`; add new DTOs (`CompleteDispenseRequestDto`, `CompleteDispenseItemDto`) with no redundant `medicineId` field (derived from `PrescriptionItem`); add `PrescriptionService.completeDispense` method; add `Dispense.note` column (nullable, Hibernate-managed).
- **Frontend**: `dispensingService` gains `completeDispense(prescriptionId, items)`; `MedicinePreparationModal` error handling updated to parse and display per-medicine shortfall messages.
- **Risk**: Low — the old `/dispense` endpoint has no callers in the current codebase (verified), so deletion is safe. The new endpoint is additive with respect to the rest of the system. The `PUT /prescriptions/{id}/status → DISPENSED` transition remains available but is no longer used by this workflow's dispense action (still valid for other callers/tests).
