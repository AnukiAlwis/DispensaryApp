## 1. Backend Phase

> **Verified against codebase**: `Dispense`, `DispenseRepository`, `DispenseService`/`DispenseServiceImpl`, `DispenseController`, `Bill`, `BillLineItem`, `BillService`/`BillServiceImpl`, `BillController` already exist and implement per-medicine dispensing with stock validation (`InsufficientStockException`) and bill calculation from dispense records. Do NOT recreate these. No `/api` prefix is used anywhere in this backend (controllers are mapped at root, e.g. `/prescriptions`, `/dispense`, `/bills`). No SQL migration files exist; schema is Hibernate `ddl-auto` generated, so no migration task is needed.

- [ ] 1.1 Add `PrescriptionRepository` query methods: `findFirstByTenant_IdAndStatusAndUpdatedAtBetweenOrderByUpdatedAtAsc` (current serving) and `findByTenant_IdAndStatusAndUpdatedAtBetweenAndIdNotOrderByUpdatedAtAsc` (up next), both scoped to `[startOfToday, startOfTomorrow)` on `updatedAt` (there is no `issuedAt` field; `updatedAt` is used as the ISSUED timestamp)
- [ ] 1.2 Implement `GET /prescriptions/current-serving` in `PrescriptionController`/`PrescriptionService` returning the oldest `ISSUED` prescription for today (patient name, phone, doctor name, `updatedAt` as issued time), or an empty/`204` response if none exists
- [ ] 1.3 Implement `GET /prescriptions/up-next` returning all remaining `ISSUED` prescriptions for today (excluding the current-serving one), oldest first
- [ ] 1.4 Implement `GET /prescriptions/{id}/medicines` reusing `PrescriptionItemRepository.findByPrescriptionId`, then sort in-memory by: (a) frequency weight — parse leading integer from `frequency` string via regex `^(\d+)`, default `0` if unparseable, descending; (b) `qtyPrescribed` descending as tie-break. Include medicine name/strength/current `Medicine.quantity` in the response DTO so the frontend can display and validate stock.
- [ ] 1.5 Add `POST /prescriptions/{id}/complete-dispense` to `PrescriptionService`/`PrescriptionServiceImpl` (or a new method on `DispenseService`) that, in one `@Transactional` method: (a) loads all `PrescriptionItem`s for the prescription, (b) validates `Medicine.quantity >= qtyPrescribed` for every item first and collects all shortfalls, throwing `InsufficientStockException` listing every insufficient medicine if any fail, (c) otherwise creates one `Dispense` row per item (reusing existing `Dispense` entity/fields, `dispensedBy` = current user) and decrements each `Medicine.quantity`, (d) transitions `Prescription.status` to `DISPENSED` via the existing transition logic in `PrescriptionServiceImpl.updatePrescriptionStatus`. Expose via `PrescriptionController`.
- [ ] 1.6 Create request/response DTOs for the three new endpoints above (`CurrentServingPrescriptionDto`, `PrescriptionMedicineDto` with sorted list, no new DTO needed for complete-dispense beyond a simple confirmation response)


## 2. Frontend Phase

> **Verified against codebase**: create this feature under `dispensapro/src/features/dispensing/` (new folder, sibling to `features/consults` and `features/pharmacy`), following the existing pattern of `types.ts`, `services/*.ts`, `hooks/*.ts`, `pages/*.tsx`, `components/*.tsx`. Reuse `apiClient` from `dispensapro/src/services/apiClient.tsx` (baseURL already configured, no `/api` prefix). Reuse existing `billingService` (in `features/consults/services/billingService.ts`) for `getByPrescriptionId`, `calculate`, and add/reuse an `updateStatus`-style call for `PUT /bills/{id}/status`. Reuse `Bill`/`BillLineItem` types already defined in `features/consults/types.ts` — do not redefine a separate Bill shape. Follow `sessionStoragePersist.ts` pattern (typed load/save with try/catch) for the new preparation-state utility, but keep Amount Received/Change as local component state only (not persisted), per design.md decision.

- [ ] 2.0 Extend existing `features/consults/services/billingService.ts` with an `updateStatus(billId, status)` method calling `PUT /bills/{id}/status` (currently missing on the frontend though the backend endpoint exists); `getByPrescriptionId` and `calculate` already exist and require no changes
- [ ] 2.1 Create `dispensing/types.ts` (CurrentServingPrescription, UpNextPrescription, DispensingMedicine with `status: "NOT_STARTED"|"STARTED"|"READY_TO_DISPENSE"`) and `dispensing/services/dispensingService.ts` calling `GET /prescriptions/current-serving`, `GET /prescriptions/up-next`, `GET /prescriptions/{id}/medicines`, `POST /prescriptions/{id}/complete-dispense`
- [ ] 2.2 Create `PrescriptionDispensingPage` component with Currently Serving card and Up Next table, polling/refetching current-serving + up-next on mount and after DONE
- [ ] 2.3 Implement `MedicinePreparationModal` component with medicine table (Medicine, Strength, Dose, Frequency, Quantity, Status) and status cycling
- [ ] 2.4 Implement `BillingModal` component with three sections: Patient Details (from existing `patientService`/`visitService.getVisit` notes) + Printable Bill (from `billingService.getByPrescriptionId`) + Receive Payment (local Amount Received input, computed Change)
- [ ] 2.5 Create sessionStorage utility (`dispensing/utils/preparationStorage.ts`) for preparation state keyed by prescriptionId: `{ prescriptionId, medicineStatuses: Record<medicineId, status> }`
- [ ] 2.6 Implement preparation status cycling logic (NOT_STARTED → STARTED → READY_TO_DISPENSE → NOT_STARTED)
- [ ] 2.7 Add status button styling: Grey (NOT_STARTED), Yellow/Orange (STARTED), Green (READY_TO_DISPENSE)
- [ ] 2.8 Implement DISPENSE button enablement logic (only when all medicines are READY_TO_DISPENSE)
- [ ] 2.9 Implement single active session enforcement (disable Dispense Now buttons in Up Next table whenever sessionStorage preparation state exists for any prescription)
- [ ] 2.10 On DISPENSE, call `POST /prescriptions/{id}/complete-dispense`, then `billingService.calculate(billId)` to refresh totals, then open BillingModal with the refreshed Bill
- [ ] 2.11 Implement payment calculation logic (Change = Amount Received - Grand Total), local component state only
- [ ] 2.12 Add View Prescription read-only modal component (reuse existing prescription/medicine fetch, no dispense/billing actions rendered)
- [ ] 2.13 Implement waiting time calculation and display (`now - updatedAt` of the current-serving prescription)
- [ ] 2.14 Add print functionality using browser's native `window.print()` with CSS `@media print` rules scoping to the bill container
- [ ] 2.15 Add routing for Prescription Dispensing page in the app's router/nav config (check existing route setup, e.g. `App.tsx`/router file, for pharmacist-role route pattern)
- [ ] 2.16 Implement navigation between preparation modal and billing modal (single parent state machine: `preparing -> billing`)
- [ ] 2.17 Add BACK button functionality to return from billing to preparation (state machine: `billing -> preparing`, preparation statuses unchanged)
- [ ] 2.18 Implement DONE button: call `PUT /bills/{id}/status` with `PAID` (if not already confirmed), close modal, clear sessionStorage preparation state for this prescription, refetch current-serving/up-next
- [ ] 2.19 Add error handling for backend API failures, in particular surfacing `InsufficientStockException` messages from `complete-dispense` in the Medicine Preparation modal


## 3. Integration & Testing Phase

> No new entity/migration tasks needed here: `Medicine.quantity`, `Dispense`, and `Bill` tables already exist via Hibernate `ddl-auto`.

- [ ] 3.1 Test end-to-end dispensing workflow from start to finish (current-serving → prepare → complete-dispense → billing → done → next patient)
- [ ] 3.2 Test sessionStorage persistence across page navigation and browser refresh
- [ ] 3.3 Test single session enforcement (verify Dispense Now buttons disable during preparation)
- [ ] 3.4 Test automatic next patient loading after workflow completion
- [ ] 3.5 Test stock validation with insufficient quantity scenarios (verify no partial dispense occurs and error lists the exact shortfall)
- [ ] 3.6 Test payment calculation with various amount received values
- [ ] 3.7 Test print functionality and bill layout
- [ ] 3.8 Verify UI matches reference images in doc/stories/dispense&BillStory-images.png (colors, spacing, font sizes, proportions)
- [ ] 3.9 Test medicine sorting by frequency and quantity, including prescriptions with unparseable/free-text frequency values
- [ ] 3.10 Test View Prescription read-only modal
- [ ] 3.11 Test error scenarios (backend unavailable, network errors)
- [ ] 3.12 Perform manual testing with realistic prescription data
- [ ] 3.13 Fix any identified bugs or UI inconsistencies
- [ ] 3.14 Final code review and cleanup
