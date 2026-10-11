## Context

The current dispensing workflow lacks structure, allowing pharmacists to work on multiple prescriptions simultaneously without guidance. This increases the risk of medication errors and creates inefficiencies in the pharmacy operations. The existing system has basic prescription management but no guided preparation process, no enforced single-patient workflow, and no seamless transition to billing.

The frontend is a React application (dispensapro) that communicates with a Java Spring Boot backend (dispensary). The system currently manages patients, doctors, consultations, prescriptions, and medicines, but lacks a structured dispensing workflow.

**Reference UX Design**: The UI implementation should closely match the reference images in `doc/stories/dispense&BillStory-images.png`. This includes exact colors, spacing, font sizes, and overall proportions for the Prescription Dispensing page, Medicine Preparation modal, and Billing modal.

## Goals / Non-Goals

**Goals:**
- Implement a guided, single-patient dispensing workflow that reduces medication errors
- Enforce one active dispensing session at a time per tenant
- Provide seamless transition from medicine preparation to billing
- Implement session-based preparation state using sessionStorage (no backend persistence)
- Enable automatic queue progression after workflow completion
- Create a printable bill layout for payment processing
- Sort medicines by frequency (highest to lowest) then quantity (highest to lowest)
- Validate stock availability before dispensing

**Non-Goals:**
- Backend persistence of preparation state (intentionally frontend-only)
- Multi-pharmacist concurrent dispensing (single session enforcement)
- Complex batch-level inventory tracking (simple quantity decrement)
- Real-time stock synchronization across multiple locations
- Advanced payment processing (cash-only with change calculation)

## Decisions

### Frontend State Management
**Decision**: Use sessionStorage for preparation state instead of backend persistence.

**Rationale**: 
- Preparation is a temporary, session-bound workflow that doesn't need permanent storage
- Avoids polluting the database with temporary records
- Allows pharmacists to navigate between pages and resume without losing progress
- Simpler implementation with no additional backend API calls

**Alternatives Considered**:
- Backend persistence: Rejected because it adds unnecessary complexity and database overhead for temporary state
- localStorage: Rejected because it persists across browser sessions, which is not desired behavior
- React Context only: Rejected because it doesn't survive page refreshes

### Single Active Session Enforcement
**Decision**: Enforce single active dispensing session at the frontend level by disabling "Dispense Now" buttons when preparation is in progress.

**Rationale**:
- Frontend enforcement is sufficient for the current use case (single-tenant, single-location pharmacy)
- Avoids complex backend locking mechanisms
- Provides immediate visual feedback to pharmacists
- Simpler to implement and test

**Alternatives Considered**:
- Backend distributed lock: Rejected due to complexity and overhead for single-tenant scenario
- Database row locking: Rejected because preparation state is not persisted in backend

### Medicine Sorting
**Decision**: Sort medicines in the backend by frequency (highest to lowest) then quantity (highest to lowest) before sending to frontend.

**Rationale**:
- Backend sorting ensures consistent ordering across all clients
- Reduces frontend processing logic
- Frequency-based ordering prioritizes high-frequency medicines for preparation efficiency
- Quantity-based secondary ordering helps with larger quantities first

**Alternatives Considered**:
- Frontend sorting: Rejected because sorting logic should be consistent and centralized
- Custom sorting configuration: Rejected because the business rule is fixed and doesn't need flexibility

### Stock Validation
**Decision**: Validate stock availability at dispensing time by checking Medicine.quantity and blocking if insufficient.

**Rationale**:
- Simple and effective validation approach
- Provides clear error messaging to pharmacists
- Prevents negative inventory scenarios
- No complex batch allocation needed

**Alternatives Considered**:
- Batch-level allocation: Rejected because the system uses simple quantity tracking, not batch management
- Soft validation with warnings: Rejected because dispensing with insufficient stock should be blocked

### UI Component Structure
**Decision**: Create three main components: PrescriptionDispensingPage (main page), MedicinePreparationModal (preparation workflow), and BillingModal (payment workflow).

**Rationale**:
- Clear separation of concerns
- Each component can be developed and tested independently
- Modal components can be reused in other contexts if needed
- Follows React best practices for component composition

**Alternatives Considered**:
- Single monolithic component: Rejected because it would be difficult to maintain and test
- Page-level modals only: Rejected because modals need to be reusable and independently testable

### API Design
**Decision**: Create new backend endpoints for dispensing-specific operations while reusing existing prescription/medicine endpoints where possible.

**Rationale**:
- Leverages existing data models and services
- Minimizes changes to existing backend code
- Clear separation between existing consultation workflow and new dispensing workflow

**New Endpoints** (no `/api` prefix, matching existing controller convention):
- GET /prescriptions/current-serving: Get current serving prescription
- GET /prescriptions/up-next: Get list of waiting prescriptions
- GET /prescriptions/{id}/medicines: Get medicines for a prescription (sorted by frequency then quantity)
- POST /prescriptions/{id}/complete-dispense: Atomically create Dispense rows for all items, decrement stock, transition Prescription to DISPENSED

**Reused Existing Endpoints** (no changes needed):
- GET /bills?prescriptionId={id}: Fetch the Bill already created during consultation
- POST /bills/{id}/calculate: Refresh Bill totals after dispensing
- PUT /bills/{id}/status: Mark Bill PAID after Confirm Payment
- GET /visits/{id}: Fetch doctor notes (`notes` field)

**Alternatives Considered**:
- Modify existing endpoints: Rejected to avoid breaking existing consultation workflow
- GraphQL: Rejected because the existing system uses REST and adding GraphQL adds complexity
- Looping the existing per-item `POST /dispense` endpoint from the frontend: Rejected due to partial-failure risk; a single atomic backend endpoint is safer

## Existing System Integration (Verified Against Codebase)

The following backend infrastructure **already exists** and MUST be reused, not recreated:

- **`Dispense` entity/repo/service/controller** (`dispensary/.../entities/Dispense.java`, `DispenseRepository`, `DispenseService`/`DispenseServiceImpl`, `DispenseController`) already records dispensing **per PrescriptionItem/medicine** (fields: `id`, `tenant`, `prescriptionItem`, `medicine`, `qtyDispensed`, `dispensedAt`, `dispensedBy`). It already validates tenant, prescription `ISSUED` status, medicine active flag, and **stock availability** (throws `InsufficientStockException`), and decrements `Medicine.quantity`. `POST /dispense` accepts one `{prescriptionItemId, medicineId, qtyDispensed, note}` per call. **Do not create a new Dispense entity or duplicate stock-validation logic.** No fields like `totalAmount`/`amountReceived`/`change` exist or are needed on `Dispense`.
- **`Bill` / `BillLineItem` entities and `BillService`/`BillController`** already implement doctor fee, medicine total (auto-rebuilt from `Dispense` rows via `createOrRefreshLineItemsFromDispense`), discount percentages, `grandTotal`, and status `DUE/PAID/VOID`. A `Bill` is already created per-prescription during the **existing consultation flow** (`ConsultsPage` → `billingService.create`) and can be fetched with `GET /bills?prescriptionId={id}`. **The Billing Modal must fetch/recalculate the existing Bill, not invent a new billing model.** After dispensing, call `POST /bills/{id}/calculate` to refresh totals from the newly created `Dispense` rows.
- **`Visit` notes**: `GET /visits/{id}` already returns `notes: VisitNoteResponseDto[]`. Reuse this for the "Doctor Notes" section of the Billing modal instead of adding a new endpoint.
- **No `/api` prefix**: all existing controllers are mapped at the root (`/prescriptions`, `/dispense`, `/bills`, `/visits`), not `/api/...`. Any new endpoints must follow this same convention (e.g. `/prescriptions/current-serving`, not `/api/prescriptions/current-serving`).
- **No DB migrations needed**: the project uses Hibernate `ddl-auto` schema generation (no Flyway/SQL migration files exist). The `dispense` and `bill` tables already exist in the schema.

### New Decisions Required (previously unresolved / missing)

**Decision: `Prescription` has no `issuedAt` field.** "Current Serving" / "Up Next" ordering and "belongs to today" filtering will use `Prescription.updatedAt` (the timestamp set by `@PreUpdate` when status transitions to `ISSUED`) as a proxy for "issued at" time, and the same value is displayed as "Issued Date & Time" on the UI. No schema change is needed. `PrescriptionRepository` needs two new query methods:
- `findFirstByTenantIdAndStatusAndUpdatedAtBetweenOrderByUpdatedAtAsc(...)` (current serving)
- `findByTenantIdAndStatusAndUpdatedAtBetweenOrderByUpdatedAtAsc(...)` (up next, excluding the current-serving id)

**Decision: Frequency-based sorting algorithm.** `PrescriptionItem.frequency` is a free-text `String` (doctor-entered, e.g. `"3x/day"`, `"Twice daily"`, `"1x/day"`). To sort deterministically:
1. Extract the leading integer via regex `^(\d+)` from the frequency string (e.g. `"3x/day"` → `3`).
2. If no leading digit is found, treat the frequency weight as `0` (sorts last).
3. Sort by `(frequencyWeight desc, qtyPrescribed desc)`.
This parsing rule MUST be implemented in the backend sorting logic for `GET /prescriptions/{id}/medicines` and documented in code comments, since it is not self-evident from free text.

**Decision: Amount Received / Change are frontend-only, never persisted.** Consistent with the sessionStorage-only preparation state, the Billing modal's "Amount Received" and "Change" fields are pure UI state (component state, not sessionStorage, since they don't need to survive navigation). "Confirm Payment" only needs to call `PUT /bills/{id}/status` with `{status: "PAID"}` to mark the bill paid — no new DTO fields are added to `Bill`/`BillResponseDto`.

**Decision: Dispensing is a single backend transaction across all medicines.** Calling the existing per-medicine `POST /dispense` endpoint once per `PrescriptionItem` in a frontend loop risks partial completion (e.g. medicine 2 of 3 fails on stock, leaving medicine 1 already dispensed and stock decremented). To guarantee atomicity, add **one new endpoint** `POST /prescriptions/{id}/complete-dispense` that, in a single `@Transactional` method, validates stock for **all** prescription items first, then creates all `Dispense` rows and decrements all `Medicine.quantity` values, then transitions `Prescription.status` to `DISPENSED` (reusing the existing status-transition validation in `PrescriptionServiceImpl.updatePrescriptionStatus`). This replaces per-item frontend-loop calls to `POST /dispense` for this workflow.

## Risks / Trade-offs

### Risk: SessionStorage Loss
**Risk**: If the pharmacist accidentally closes the browser tab, preparation progress is lost.

**Mitigation**: This is acceptable per business requirements. The workflow is designed to be completed in a single session. Pharmacists are trained to complete one patient at a time.

### Risk: Single Session Enforcement Bypass
**Risk**: Frontend-only enforcement could theoretically be bypassed by direct API calls.

**Mitigation**: Acceptable risk for single-tenant, single-location scenario. If multi-location support is needed in the future, backend locking can be added.

### Trade-off: Simple Stock Management
**Trade-off**: Simple quantity decrement doesn't provide batch-level tracking or FIFO inventory management.

**Rationale**: The current business requirements don't need complex inventory tracking. Simple quantity validation is sufficient for the pharmacy's needs.

## Migration Plan

### Deployment Steps

1. **Backend Changes**:
   - Add new API endpoints for dispensing workflow
   - Implement medicine sorting logic
   - Add stock validation
   - Update Medicine entity to handle quantity decrements
   - Create Dispense entity for record-keeping

2. **Frontend Changes**:
   - Create new dispensing page and components
   - Implement sessionStorage management
   - Add routing for dispensing page
   - Integrate with new backend endpoints

3. **Database Changes**:
   - Add Dispense table if not exists
   - Ensure Medicine.quantity field is properly indexed

4. **Testing**:
   - Unit tests for backend endpoints
   - Integration tests for dispensing workflow
   - Manual testing with reference UX images

### Rollback Strategy

- Backend: Revert to previous version of the Spring Boot application
- Frontend: Revert to previous React build
- Database: No destructive changes, so rollback is safe

## Open Questions

1. **Print Functionality**: Should the PRINT button use browser's native print dialog or a specific print library? (Decision: Use browser's native print with CSS print media queries for simplicity)

2. **Change Calculation Precision**: Should change be calculated to 2 decimal places for currency handling? (Decision: Yes, use standard currency formatting)

3. **Waiting Time Calculation**: How should waiting time be calculated and displayed? (Decision: Calculate from prescription issued time to current time, display in minutes/hours as appropriate)

4. **Doctor Notes Display**: Should doctor notes be truncated if they are very long? (Decision: Yes, truncate with "..." and show full text on hover or click)

5. **Error Handling**: What should happen if the backend is unavailable during preparation? (Decision: Show error message and allow pharmacist to retry or cancel)

---

## Addendum: Dispense Stock Integrity Fix

### Context

The original design (see "Decision: Dispensing is a single backend transaction across all medicines" above) already specified `POST /prescriptions/{id}/complete-dispense` as the correct approach and explicitly rejected looping `POST /dispense` from the frontend. However, task 1.5 in `tasks.md` was implemented as "reuse `PUT /prescriptions/{id}/status`" instead, and the endpoint was never built. Verified in the current codebase:

- `MedicinePreparationModal.handleDispense` (`dispensapro/src/features/dispensing/components/MedicinePreparationModal.tsx`) calls only `dispensingService.updatePrescriptionStatus(prescriptionId, "DISPENSED")`.
- No caller anywhere in `dispensapro/src` invokes `POST /dispense`.
- `DispenseController`/`DispenseServiceImpl`/`DispenseRequestDto` (backend) are fully implemented but orphaned — dead code from this workflow's perspective.
- `BillServiceImpl.createOrRefreshLineItemsFromDispense` always finds zero `Dispense` rows for the prescription and falls back to `PrescriptionItem.qtyPrescribed`.

This addendum closes that gap.

### Learnings From the Existing `POST /dispense` API (to be copied, then deleted)

`DispenseServiceImpl.recordDispense` already encodes the correct business rules for a single dispense line. These rules are **copied into the new batch endpoint** before the old endpoint is deleted. Specific insights to carry over:

1. **Validation order/rules to preserve**: prescription-item exists → its prescription belongs to tenant → prescription `status == ISSUED` → medicine exists & belongs to tenant → `medicine.isActive` → stock check (`medicine.quantity >= qtyDispensed`) → dispensing user exists.
2. **`medicineId` in the request is redundant and removable.** The existing `DispenseRequestDto` takes both `prescriptionItemId` and `medicineId` and then validates `pItem.getMedicine().getId().equals(medicine.getId())` purely to catch client-side mismatches. Since `PrescriptionItem.medicine` is already the source of truth, the new batch DTO **omits `medicineId` entirely** and derives `Medicine` via `prescriptionItem.getMedicine()` — this removes an entire class of validation (and possible client bugs) rather than inheriting it.
3. **Known pre-existing bug to fix**: `DispenseRequestDto.note` is accepted by the API but never persisted (no `note` column on `Dispense`). Added as a nullable `String` column on `Dispense` to complete the audit trail.
4. **Error shape to reuse**: `GlobalExceptionHandler.handleInsufficientStock` already returns `{"error": "..."}` with `400`. The batch endpoint reuses the same exception type and handler — only the *message* needs to aggregate multiple shortfalls instead of stopping at the first.

### API Design

**New endpoint**: `POST /prescriptions/{id}/complete-dispense`

Request body — one entry per prescription item being dispensed (no `medicineId` — derived from the `PrescriptionItem`; `qtyDispensed` defaults to `qtyPrescribed` on the frontend if the pharmacist didn't adjust it; `note` optional):

```json
{
  "items": [
    { "prescriptionItemId": "uuid", "qtyDispensed": 30, "note": null },
    { "prescriptionItemId": "uuid", "qtyDispensed": 10, "note": null }
  ]
}
```

Response: `PrescriptionResponseDto` (existing shape) reflecting the new `DISPENSED` status, so the frontend does not need a separate re-fetch.

New DTOs:
- `CompleteDispenseRequestDto { List<CompleteDispenseItemDto> items }`
- `CompleteDispenseItemDto { UUID prescriptionItemId; Integer qtyDispensed; String note }`

Error responses:
- `400` `InsufficientStockException` — message aggregates **all** shortfalls in one response (not just the first), e.g. `"Insufficient stock for: Paracetamol 500mg (required 30, available 21); Amoxicillin 250mg (required 20, available 0)"`, so the pharmacist sees every problem at once instead of one at a time.
- `400` `InvalidPrescriptionStateException` if prescription is not `ISSUED`.

**Permission**: `PRESCRIPTION_DISPENSE`, enforced via `@PreAuthorize` on `PrescriptionController`.

### Backend Implementation Plan

**Step 1 — add `Dispense.note` column**: Add nullable `String note` to `Dispense` entity (Hibernate `ddl-auto` will create it).

**Step 2 — delete the old endpoint** (verified to have no callers): delete `DispenseController`, `DispenseService`/`DispenseServiceImpl`, `DispenseRequestDto`, `DispenseResponseDto`.

**Step 3 — new method** `PrescriptionService.completeDispense(UUID tenantId, UUID currentUserId, UUID prescriptionId, CompleteDispenseRequestDto request)`, implemented in `PrescriptionServiceImpl`, `@Transactional`. Logic (copied from the deleted `recordDispense`, adapted for batch):

1. Load `Prescription`, verify tenant match and `status == ISSUED`.
2. Load all `PrescriptionItem`s for the prescription; validate every `prescriptionItemId` in the request belongs to this prescription.
3. **Validation pass (no writes yet)**: for each item:
   - Resolve its `Medicine` via `prescriptionItem.getMedicine()`.
   - Check `medicine.isActive`.
   - Check `medicine.quantity >= qtyDispensed`.
   - Check `medicine.tenant == tenant`.
   Collect all shortfalls into a list; if non-empty, throw one aggregated `InsufficientStockException` (e.g. semicolon-joined `"{medicineName} (required X, available Y)"` entries) — nothing is written.
4. **Write pass** (only if step 3 produced zero shortfalls): for each item:
   - Create a `Dispense` row (`tenant`, `prescriptionItem`, `medicine`, `qtyDispensed`, `note`, `dispensedAt=now`, `dispensedBy=currentUser`).
   - Decrement `medicine.quantity -= qtyDispensed`.
   - Save both.
5. Transition `prescription.status = DISPENSED` (reuse existing transition rule in `updatePrescriptionStatus`: `ISSUED → DISPENSED` allowed).
6. Return the updated `PrescriptionResponseDto`.

The **validation-then-write two-pass structure** is critical so a mid-loop failure never leaves partial `Dispense` rows or partial stock decrements — this is the property that calling `POST /dispense` N times from the frontend could never guarantee, and is the reason this needs to be one new endpoint.

### Frontend Implementation Plan

- `dispensingService.completeDispense(prescriptionId, items)`: `POST /prescriptions/{id}/complete-dispense` with `{ items: [{ prescriptionItemId, qtyDispensed }] }`, built from the current `DispensingMedicine[]` state (`id` → `prescriptionItemId`, `quantity` → `qtyDispensed`, since the preparation UI does not currently support editing quantity — the prescribed quantity is what's sent, preserving current behavior while establishing the audit trail).
- `MedicinePreparationModal.handleDispense` replaces the `updatePrescriptionStatus` call with `dispensingService.completeDispense(prescriptionId, medicines)`.
- Error handling: parse the `InsufficientStockException` message from the `400` response body (`error.error` per `GlobalExceptionHandler.handleInsufficientStock`) and render it in the existing `<Alert severity="error">` in the modal — this makes the currently-dead error branch in `handleDispense` (which already expects an `"Insufficient stock"` substring) actually reachable.
- No sessionStorage schema changes needed; `medicineStatuses` cycling logic is unchanged — only the final DISPENSE action's network call changes.

### Migration / Compatibility

- Additive at the API level: existing `PUT /prescriptions/{id}/status`, `POST /dispense`, and `GET /dispense/{id}` endpoint contracts are untouched (request/response shapes unchanged) and remain valid for other flows/tests.
- **One schema addition**: `Dispense.note` column (nullable `VARCHAR`) — auto-created by Hibernate `ddl-auto`, no manual migration needed, and backward-compatible (existing rows get `NULL`).
- The `DispenseServiceImpl` refactor (Step 1 above) changes internal method structure only — `recordDispense`'s external behavior/contract for `POST /dispense` is unchanged, verified by existing tests continuing to pass.
- Once deployed, any prescriptions already marked `DISPENSED` under the old (buggy) code path have no retroactive `Dispense` rows or stock corrections — this is a data-quality gap accepted as out of scope for this fix (historical inventory reconciliation, if needed, is a separate manual/ops task).

---

## Addendum: Backend-Driven Recovery for Dropped Tabs

### Context

Pharmacists may close the browser tab during the dispense + billing workflow. The system must let them reopen the page, see incomplete flows (specifically prescriptions that have been dispensed but not yet paid), and continue to completion.

### Decision: Recover from backend state, not browser storage

**Decision**: Use existing `Prescription.status` and `Bill.status` as the recovery source. Do **not** extend `sessionStorage`/`localStorage` for cross-tab recovery.

**Rationale**:
- `Prescription.status = DISPENSED` plus `Bill.status = DUE` already captures a dispensed-but-not-paid prescription
- Works across tabs, browsers, and devices for the same tenant/user
- No new entities or schema changes
- Mid-preparation drops are not recovered: the prescription remains `ISSUED` and reappears in Current Serving / Up Next, so the pharmacist simply restarts preparation. No stock has been decremented yet, so restarting is safe.

### API Design

**New endpoint**: `GET /prescriptions/billing-pending`

Returns a list of prescriptions (same shape as Current Serving / Up Next) where:
- `p.status = 'DISPENSED'`
- associated `Bill.status = 'DUE'`
- scoped to the current tenant
- ordered by `p.updatedAt ASC` (oldest first)

No new DTO needed; reuse `CurrentServingPrescriptionDto`.

### Frontend Design

On `PrescriptionDispensingPage`:
1. Fetch `GET /prescriptions/billing-pending` alongside current-serving and up-next on mount.
2. Render a new **"Billing Pending"** card/table **above** Current Serving only when records exist. Use a **light yellow background** and an **orange "Complete Billing"** action button so it stands out as a recovery queue.
3. Each row shows Patient Name, Phone, Doctor, Dispensed Date & Time, and the action button.
4. Clicking "Complete Billing" sets the selected prescription ID and opens `BillingModal` directly (`workflowState = "billing"`).
5. After DONE / payment complete, refetch the billing-pending list so the row disappears.

`sessionStorage` continues to be used only for in-tab single-session enforcement (disabling "Dispense Now" while a preparation modal is open). It is **not** relied upon for cross-tab recovery.

### Database / Schema

No changes. Uses existing:
- `prescription.status`
- `bill.status`
- `bill.prescription_id` relationship
