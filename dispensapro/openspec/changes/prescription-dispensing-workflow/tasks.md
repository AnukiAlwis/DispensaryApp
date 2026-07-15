## 1. Backend Phase

> **Verified against codebase**: `Dispense`, `DispenseRepository`, `DispenseService`/`DispenseServiceImpl`, `DispenseController`, `Bill`, `BillLineItem`, `BillService`/`BillServiceImpl`, `BillController` already exist and implement per-medicine dispensing with stock validation (`InsufficientStockException`) and bill calculation from dispense records. Do NOT recreate these. No `/api` prefix is used anywhere in this backend (controllers are mapped at root, e.g. `/prescriptions`, `/dispense`, `/bills`). No SQL migration files exist; schema is Hibernate `ddl-auto` generated, so no migration task is needed.

- [x] 1.1 Add `PrescriptionRepository` query methods: `findFirstByTenant_IdAndStatusAndUpdatedAtBetweenOrderByUpdatedAtAsc` (current serving) and `findByTenant_IdAndStatusAndUpdatedAtBetweenAndIdNotOrderByUpdatedAtAsc` (up next), both scoped to `[startOfToday, startOfTomorrow)` on `updatedAt` (there is no `issuedAt` field; `updatedAt` is used as the ISSUED timestamp)
- [x] 1.2 Implement `GET /prescriptions/current-serving` in `PrescriptionController`/`PrescriptionService` returning the oldest `ISSUED` prescription for today (patient name, phone, doctor name, `updatedAt` as issued time), or an empty/`204` response if none exists
- [x] 1.3 Implement `GET /prescriptions/up-next` returning all remaining `ISSUED` prescriptions for today (excluding the current-serving one), oldest first
- [x] 1.4 Implement `GET /prescriptions/{id}/medicines` reusing `PrescriptionItemRepository.findByPrescriptionId`, then sort in-memory by: (a) frequency weight — parse leading integer from `frequency` string via regex `^(\d+)`, default `0` if unparseable, descending; (b) `qtyPrescribed` descending as tie-break. Include medicine name/strength/current `Medicine.quantity` in the response DTO so the frontend can display and validate stock.
- [x] 1.5 Use existing `PUT /prescriptions/{id}/status` endpoint to transition prescription status to `DISPENSED`. The dispensing logic (stock validation, dispense record creation, stock decrement) is handled by the existing `DispenseService`/`DispenseServiceImpl` and `POST /dispense` endpoint. No new backend endpoint needed for complete-dispense.
- [x] 1.6 Create request/response DTOs for the new endpoints (`CurrentServingPrescriptionDto`, `PrescriptionMedicineDto` with sorted list)


## 2. Frontend Phase

> **Verified against codebase**: create this feature under `dispensapro/src/features/dispensing/` (new folder, sibling to `features/consults` and `features/pharmacy`), following the existing pattern of `types.ts`, `services/*.ts`, `hooks/*.ts`, `pages/*.tsx`, `components/*.tsx`. Reuse `apiClient` from `dispensapro/src/services/apiClient.tsx` (baseURL already configured, no `/api` prefix). Reuse existing `billingService` (in `features/consults/services/billingService.ts`) for `getByPrescriptionId`, `calculate`, and add/reuse an `updateStatus`-style call for `PUT /bills/{id}/status`. Reuse `Bill`/`BillLineItem` types already defined in `features/consults/types.ts` — do not redefine a separate Bill shape. Follow `sessionStoragePersist.ts` pattern (typed load/save with try/catch) for the new preparation-state utility, but keep Amount Received/Change as local component state only (not persisted), per design.md decision.

> **Visual Compliance Requirement**: All UI implementations MUST closely match the reference images in `doc/stories/dispense&BillStory-images.png`. This includes exact colors, spacing, font sizes, button styles, and overall proportions for the Prescription Dispensing page, Medicine Preparation modal, and Billing modal. Refer to the image for precise layout details before implementing each component.

- [ ] 2.0 Extend existing `features/consults/services/billingService.ts` with an `updateStatus(billId, status)` method calling `PUT /bills/{id}/status` (currently missing on the frontend though the backend endpoint exists); `getByPrescriptionId` and `calculate` already exist and require no changes

- [ ] 2.1 Create `dispensing/types.ts` with TypeScript interfaces: `CurrentServingPrescription` (id, patientName, patientPhone, doctorName, issuedAt, waitingTime), `UpNextPrescription` (same fields), `DispensingMedicine` (id, medicineName, strength, dose, frequency, quantity, currentStock, status: `"NOT_STARTED"|"STARTED"|"READY_TO_DISPENSE"`), and `PreparationState` (prescriptionId, medicineStatuses: Record<medicineId, status>). Create `dispensing/services/dispensingService.ts` with methods: `getCurrentServing()`, `getUpNext()`, `getPrescriptionMedicines(id)`, `updatePrescriptionStatus(id, status)` calling the backend endpoints

- [ ] 2.2 Create `PrescriptionDispensingPage` component with exact layout matching reference image:
  - **Section 1 - Currently Serving Card**: Highlighted card displaying Patient Name, Phone Number, Doctor, Issued Date & Time (format: `YYYY-MM-DD HH:mm`), and Waiting Time (calculate as `now - updatedAt`, display in minutes if < 60 mins, else hours + minutes). Action button shows "💊 Start Preparing" if no preparation state exists, else "Continue Dispense". Card should be visually distinct/prominent (refer to image for styling)
  - **Section 2 - Up Next Table**: Data table with columns: Patient Name, Phone Number, Doctor, Issued Date & Time, Actions. Actions column contains two buttons: "View Prescription" (opens read-only modal) and "Dispense Now" (disabled if any preparation state exists in sessionStorage). Table should display all remaining ISSUED prescriptions for today, sorted oldest first
  - **Polling/Refetch**: On component mount, fetch current-serving and up-next. After DONE button is clicked, refetch both to load next patient. Use polling or manual refresh as appropriate (refer to existing patterns in codebase)

- [ ] 2.3 Implement `MedicinePreparationModal` component with exact layout matching reference image:
  - **Header**: Modal title "Medicine Preparation" with prescription patient name and ID
  - **Medicine Table**: Columns: Medicine, Strength, Dose, Frequency, Quantity, Status. Rows are pre-sorted by backend (frequency desc, quantity desc). Each row displays medicine details read-only
  - **Status Button**: Each row has a clickable status button that cycles: NOT_STARTED → STARTED → READY_TO_DISPENSE → NOT_STARTED. Button styling: Grey background for NOT_STARTED, Yellow/Orange for STARTED, Green for READY_TO_DISPENSE (refer to image for exact color values)
  - **DISPENSE Button**: Fixed at bottom of modal, disabled by default. Enabled only when every medicine has status READY_TO_DISPENSE. When clicked, calls complete-dispense API and transitions to Billing Modal
  - **Stock Display**: Show current available stock quantity alongside prescribed quantity for validation context
  - **Error Display**: If backend returns InsufficientStockException, display error message in modal showing which medicines are short and required vs available quantities

- [ ] 2.4 Implement `BillingModal` component with three-section layout matching reference image:
  - **Section 1 - Patient Details**: Display Patient Information (name, phone, age, gender), Visit Information (visit date, visit ID), and Doctor Notes. Doctor Notes are read-only text. If notes are very long (> 200 chars), truncate with "..." and show full text on hover or click (tooltip or expandable section)
  - **Section 2 - Printable Bill**: Invoice-style layout displaying:
    - Header: Bill ID, Date, Patient Name
    - Medicine rows: Medicine Name, Strength, Dose, Frequency, Price per unit, Quantity, Line Total
    - Summary section: Doctor Fee, Medicine Total, Discount (show percentage and amount), Grand Total
    - Layout should resemble a printable receipt/invoice (refer to image for exact spacing and alignment)
  - **Section 3 - Receive Payment**: Display Total Amount Due (read-only, from bill.grandTotal), Amount Received (editable number input), and Calculated Change (computed as Amount Received - Grand Total, read-only). Format all currency values as "Rs. X,XXX.XX"
  - **Footer Buttons**: Three buttons at bottom: BACK (white background, returns to preparation modal), PRINT (orange background, triggers print), DONE (primary blue background, completes workflow)

- [ ] 2.5 Create sessionStorage utility (`dispensing/utils/preparationStorage.ts`) following `sessionStoragePersist.ts` pattern with typed load/save with try/catch. Storage key: `dispensing_preparation_state`. Structure: `{ prescriptionId: string, medicineStatuses: Record<medicineId, status> }`. Methods: `loadState()`, `saveState(state)`, `clearState()`, `hasActiveSession()`

- [ ] 2.6 Implement preparation status cycling logic in MedicinePreparationModal: on status button click, cycle through NOT_STARTED → STARTED → READY_TO_DISPENSE → NOT_STARTED. Update sessionStorage after each status change. On modal open, load existing state from sessionStorage if exists for current prescriptionId

- [ ] 2.7 Add status button styling with exact colors matching reference image:
  - NOT_STARTED: Grey background (e.g., `#e0e0e0` or MUI grey), text "Not Started"
  - STARTED: Yellow/Orange background (e.g., `#ff9800` or MUI orange), text "Started"
  - READY_TO_DISPENSE: Green background (e.g., `#4caf50` or MUI green), text "Ready to Dispense"
  - Button should have hover state (slightly darken) and active state (press effect)
  - Refer to reference image for exact color values and button dimensions

- [ ] 2.8 Implement DISPENSE button enablement logic: button is disabled unless `Object.values(medicineStatuses).every(status => status === 'READY_TO_DISPENSE')`. Re-check this condition on every status change. Disable button during API call (show loading state)

- [ ] 2.9 Implement single active session enforcement: on page load and during preparation modal open, check `preparationStorage.hasActiveSession()`. If true, disable all "Dispense Now" buttons in Up Next table. Only re-enable after DONE button clears sessionStorage. This enforces one-patient-at-a-time rule

- [ ] 2.10 On DISPENSE button click: (a) call `PUT /prescriptions/{id}/status` with `{status: "DISPENSED"}`, (b) on success, call `billingService.calculate(billId)` to refresh totals from newly created Dispense rows, (c) open BillingModal with refreshed Bill data, (d) transition state machine from `preparing` to `billing`. Handle InsufficientStockException by showing error in preparation modal and not transitioning

- [ ] 2.11 Implement payment calculation logic in BillingModal: Amount Received is local component state (editable number input). Change is computed as `Amount Received - bill.grandTotal`. Display Change as read-only. Format as currency "Rs. X,XXX.XX". Handle negative values (if Amount Received < Grand Total) by showing error or warning. This state is NOT persisted to sessionStorage

- [ ] 2.12 Add View Prescription read-only modal component: reuse existing prescription/medicine fetch APIs. Display prescription details (patient, doctor, medicines with dose/frequency/quantity) in a read-only format. No dispense or billing actions. No status buttons. Close button only. Modal should be clean and informational (refer to reference image for layout)

- [ ] 2.13 Implement waiting time calculation and display: for current-serving prescription, calculate `waitingTime = now - prescription.updatedAt`. Display as "X min" if < 60 minutes, else "X hr Y min". Update this display every 30 seconds or on page refresh. Position in Currently Serving card as shown in reference image

- [ ] 2.14 Add print functionality using browser's native `window.print()` with CSS `@media print` rules: scope print styles to the bill container only (Section 2 of BillingModal). Hide other page elements (navigation, Currently Serving card, Up Next table, modal chrome). Ensure bill layout prints cleanly on A4 paper with proper margins. Add a "Print" button in BillingModal footer (orange background per reference image)

- [ ] 2.15 Add routing for Prescription Dispensing page: check existing route setup in `App.tsx` or router file. Add route for pharmacist role (e.g., `/dispensing` or `/pharmacy/dispensing`). Add navigation link in main nav if appropriate for pharmacist users. Follow existing route patterns for role-based access

- [ ] 2.16 Implement navigation between preparation modal and billing modal using single parent state machine: states are `idle` → `preparing` → `billing` → `idle`. On "Start Preparing" or "Continue Dispense", transition to `preparing` and open MedicinePreparationModal. On successful DISPENSE, transition to `billing` and open BillingModal. State transitions should be clean and prevent invalid state jumps

- [ ] 2.17 Add BACK button functionality in BillingModal: when clicked, transition state machine from `billing` back to `preparing`, close BillingModal, reopen MedicinePreparationModal with all preparation statuses unchanged (preserved in sessionStorage). This allows pharmacist to correct mistakes before finalizing

- [ ] 2.18 Implement DONE button in BillingModal: when clicked, (a) call `PUT /bills/{id}/status` with `{status: "PAID"}` if not already confirmed, (b) close BillingModal, (c) call `preparationStorage.clearState()` to remove preparation state, (d) refetch current-serving and up-next to load next patient, (e) transition state machine to `idle`, (f) re-enable all Dispense Now buttons. Show success message or toast

- [ ] 2.19 Add comprehensive error handling for backend API failures:
  - Network errors: show user-friendly error message with retry option
  - InsufficientStockException from complete-dispense: display in MedicinePreparationModal showing which medicines are short (e.g., "Only 21 tablets available. Required: 30 tablets. Dispensing cannot continue.")
  - Validation errors (400): display specific field validation messages
  - 404 errors: show "Resource not found" message
  - 500 errors: show "Server error, please try again"
  - Use existing error handling patterns from codebase (snackbars/alerts)


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
