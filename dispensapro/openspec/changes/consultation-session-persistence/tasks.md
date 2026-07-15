## 1. Backend: lookup prescription by visitId

- [ ] 1.1 In `com.anucode.dispensary.services.PrescriptionService`, add method signature `PrescriptionResponseDto getPrescriptionByVisitId(UUID tenantId, UUID visitId);`.
- [ ] 1.2 In `PrescriptionServiceImpl`, implement it using the existing `prescriptionRepository.findByVisitId(visitId)` (already exists, currently unused): throw `NotFoundException` if absent or tenant mismatch, otherwise map to `PrescriptionResponseDto` the same way `getPrescription` does.
- [ ] 1.3 In `PrescriptionController`, add:
  ```java
  @GetMapping
  public ResponseEntity<PrescriptionResponseDto> getPrescriptionByVisitId(@RequestParam UUID visitId) {
      UUID tenantId = UUID.fromString(TenantContext.getTenantId());
      return ResponseEntity.ok(prescriptionService.getPrescriptionByVisitId(tenantId, visitId));
  }
  ```

## 2. Backend: lookup bill by prescriptionId

- [ ] 2.1 In `com.anucode.dispensary.repos.BillRepository`, add `Optional<Bill> findByPrescription_Id(UUID prescriptionId);`.
- [ ] 2.2 In `com.anucode.dispensary.services.BillService`, add method signature `BillResponseDto getBillByPrescriptionId(UUID tenantId, UUID prescriptionId);`.
- [ ] 2.3 In `BillServiceImpl`, implement using `billRepository.findByPrescription_Id(prescriptionId)`: throw `NotFoundException` if absent, tenant-check same as `getBill`, then map to `BillResponseDto` the same way `getBill` does.
- [ ] 2.4 In `BillController`, extend the existing `listByPatient` GET handler to also accept `prescriptionId`:
  ```java
  @GetMapping
  public ResponseEntity<?> listOrLookup(@RequestParam(required = false) UUID patientId,
                                         @RequestParam(required = false) UUID prescriptionId) {
      UUID tenantId = UUID.fromString(TenantContext.getTenantId());
      if (prescriptionId != null) {
          return ResponseEntity.ok(billService.getBillByPrescriptionId(tenantId, prescriptionId));
      }
      if (patientId == null) {
          return ResponseEntity.ok(List.of());
      }
      return ResponseEntity.ok(billService.listBillsByPatient(tenantId, patientId));
  }
  ```
  (Replace the existing `listByPatient` method with this one; keep the same `@GetMapping` path `/bills`.)

## 3. Frontend: expose new lookups in services

- [ ] 3.1 In `src/features/consults/services/prescriptionService.ts`, add:
  ```ts
  getByVisitId: async (visitId: string): Promise<Prescription> => {
    const response = await apiClient.get<Prescription>(BASE_URL, { params: { visitId } });
    return response.data;
  },
  ```
- [ ] 3.2 In `src/features/consults/services/billingService.ts`, add:
  ```ts
  getByPrescriptionId: async (prescriptionId: string): Promise<Bill> => {
    const response = await apiClient.get<Bill>(BASE_URL, { params: { prescriptionId } });
    return response.data;
  },
  ```

## 4. sessionStorage persistence helper (no new dependency)

- [ ] 4.1 Create `src/store/sessionStoragePersist.ts` exporting:
  - `loadPersistedSession(): ConsultationSessionState | undefined` — reads `sessionStorage.getItem("consultationSession")`, `JSON.parse`s it in a try/catch, returns `undefined` if missing or invalid.
  - `savePersistedSession(state: ConsultationSessionState): void` — `JSON.stringify(state)` and `sessionStorage.setItem("consultationSession", ...)` inside a try/catch (ignore quota errors).

## 5. `consultationSession` Redux slice

- [ ] 5.1 Create `src/store/consultationSlice.ts` with `ConsultationSessionState`:
  ```ts
  interface ConsultationSessionState {
    status: "idle" | "active";
    queueId: string | null;
    patientId: string | null;
    visitId: string | null;
    prescriptionId: string | null;
    billId: string | null;
    startedAt: string | null;
    clinicalNotes: string;
    doctorDiscountPct: number;
    pharmacyDiscountPct: number;
  }
  ```
- [ ] 5.2 Define `defaultConsultationSessionState` (status `"idle"`, all IDs `null`, `clinicalNotes: ""`, both discount pcts `0`).
- [ ] 5.3 Set slice `initialState = loadPersistedSession() ?? defaultConsultationSessionState`.
- [ ] 5.4 Add reducers:
  - `startSession(state, action: PayloadAction<{queueId, patientId, visitId, prescriptionId, billId, startedAt}>)` — sets all identity fields, `status = "active"`, resets `clinicalNotes = ""`, both discount pcts `0`.
  - `setClinicalNotes(state, action: PayloadAction<string>)`.
  - `setDiscounts(state, action: PayloadAction<{doctorDiscountPct: number; pharmacyDiscountPct: number}>)`.
  - `clearSession(state)` — reset to `defaultConsultationSessionState`.
- [ ] 5.5 Export actions (`startSession`, `setClinicalNotes`, `setDiscounts`, `clearSession`) and default-export the reducer.

## 6. Wire slice into the store

- [ ] 6.1 In `src/store.tsx`: import `consultationSessionReducer` and `savePersistedSession`, add `consultationSession: consultationSessionReducer` to the `reducer` map.
- [ ] 6.2 Immediately after `configureStore(...)`, add:
  ```ts
  store.subscribe(() => {
    savePersistedSession(store.getState().consultationSession);
  });
  ```

## 7. Fix discount wiring bug and make `BillingSection` controlled

- [ ] 7.1 In `src/features/consults/components/BillingSection.tsx`: add props `doctorDiscountPct: number`, `pharmacyDiscountPct: number`, `onDiscountsChange: (doctorPct: number, pharmacyPct: number) => void` to `BillingSectionProps`.
- [ ] 7.2 Remove the internal `const [doctorDiscountPct, setDoctorDiscountPct] = useState(0)` and `const [pharmacyDiscountPct, setPharmacyDiscountPct] = useState(0)` — use the props instead everywhere they're currently referenced (the `useEffect` total calculation, the two `TextField` `value`s, and the `reset()` function).
- [ ] 7.3 Update `handleDoctorDiscountChange`/`handlePharmacyDiscountChange` to call `onDiscountsChange(newDoctorPct, pharmacyDiscountPct)` / `onDiscountsChange(doctorDiscountPct, newPharmacyPct)` instead of local `setState`.
- [ ] 7.4 Update `reset()` to call `onDiscountsChange(0, 0)` instead of local `setState` calls for the two discount fields.

## 8. Wire `ConsultsPage` to the slice for drafts and session identity

- [ ] 8.1 In `src/features/consults/pages/ConsultsPage.tsx`, import `useDispatch` from `react-redux` and `startSession`, `setClinicalNotes`, `setDiscounts`, `clearSession` from `../../../store/consultationSlice`.
- [ ] 8.2 Add `const dispatch = useDispatch();` and read the slice: `const session = useSelector((state: RootState) => state.consultationSession);`.
- [ ] 8.3 Remove the local `const [clinicalNotes, setClinicalNotes] = useState("")`. Replace all reads of `clinicalNotes` with `session.clinicalNotes`. In the `ClinicalNotesSection` `onChange` handler, replace `setClinicalNotes(value)` with `dispatch(setClinicalNotes(value))` (keep the existing `clinicalNotesError` clearing logic).
- [ ] 8.4 Replace the `doctorDiscountPct`/`pharmacyDiscountPct` destructured from `useBilling()` with `session.doctorDiscountPct`/`session.pharmacyDiscountPct`. Remove `updateDiscounts` from the `useBilling()` destructure (no longer used).
- [ ] 8.5 Pass `doctorDiscountPct={session.doctorDiscountPct}`, `pharmacyDiscountPct={session.pharmacyDiscountPct}`, and `onDiscountsChange={(d, p) => dispatch(setDiscounts({ doctorDiscountPct: d, pharmacyDiscountPct: p }))}` to `<BillingSection />`.
- [ ] 8.6 In `handleStartConsultation`, after `loadConsultationData(...)` succeeds, dispatch `startSession({ queueId: result.queue.id, patientId: result.queue.patientId, visitId: result.prescription.visitId, prescriptionId: result.prescription.id, billId: result.bill.id, startedAt: new Date().toISOString() })`.
- [ ] 8.7 In `handleComplete`, after `finalizeConsultation(...)` returns `result?.success === true` (existing `if (result?.success)` block), dispatch `clearSession()` before or alongside `setShowCompletionModal(true)`.
- [ ] 8.8 In `handleCloseCompletion`, add `dispatch(clearSession())` (defensive; harmless if already cleared) alongside the existing local `setState` resets. Remove the now-redundant `setClinicalNotes("")` call from this function (state lives in the slice now).

## 9. Prescription status normalizer

- [ ] 9.1 In `src/features/consults/services/prescriptionService.ts`, add and export a helper:
  ```ts
  export const normalizePrescriptionStatus = (
    status: string
  ): Prescription["status"] =>
    status === "STARTED" ? "ACTIVE" : (status as Prescription["status"]);
  ```
- [ ] 9.2 Do not change `create()` or any other existing method behavior in this file.

## 10. Resume-on-mount effect in `ConsultsPage` (fast path: session present)

- [ ] 10.1 Add local state: `const [isResuming, setIsResuming] = useState(false);` and `const [resumeError, setResumeError] = useState<string | null>(null);`.
- [ ] 10.2 Add a `resumeFromSession` async function and call it from a `useEffect` that runs once on mount (empty dependency array), only if `status === "idle"`:
  1. If `!session.queueId`, call `resumeFromBackendQueue()` (see Section 11) instead and return.
  2. Compute `minutesElapsed = (Date.now() - new Date(session.startedAt as string).getTime()) / 60000`. If `minutesElapsed > 90`, dispatch `clearSession()`, then call `resumeFromBackendQueue()` (a still-`IN_PROGRESS` queue may exist even though the local session expired) and return.
  3. Set `isResuming = true`. `try` block: call `queueService.getById(session.queueId)`. If the returned `queue.status !== "IN_PROGRESS"`, dispatch `clearSession()`, `setIsResuming(false)`, return.
  4. Fetch (can be sequential or `Promise.all`): `patientService.getById(session.patientId!)`, `visitService.getAllByPatientId(session.patientId!)`, `prescriptionService.getById(session.prescriptionId!)`, `prescriptionService.getItems(session.prescriptionId!)`, `billingService.getById(session.billId!)`.
  5. Apply `normalizePrescriptionStatus(prescription.status)` and assign back onto the fetched prescription object before calling `setCurrentPrescription`.
  6. Call `setCurrentQueue(queue)`, `setCurrentPatient(patient)`, `setVisitHistory(visits)`, `setCurrentPrescription(prescription)`, `setPrescriptionItems(items)`, `setCurrentBill(bill)`, `setStatus("active")`.
  7. `catch`: on any error from step 3 (queue lookup itself failing, e.g. 404), dispatch `clearSession()`. On any error from steps 4-6 (queue was valid but a later fetch failed), set `resumeError` to a user-facing message instead of clearing the session, so the doctor can retry without losing the identifiers.
  8. `finally`: `setIsResuming(false)`.
- [ ] 10.3 Render a loading state (reuse the existing `Backdrop`/`CircularProgress` pattern) while `isResuming` is true, and show `resumeError` with a retry button that re-runs `resumeFromSession` (or `resumeFromBackendQueue`, whichever path failed).

## 11. Resume-on-mount fallback (no local session: fresh tab / post-close / post-logout)

- [ ] 11.1 Add a `resumeFromBackendQueue` async function in `ConsultsPage`:
  1. Set `isResuming = true`. `try` block: call `queueService.getAll(doctorId)`, find the entry with `status === "IN_PROGRESS"`. If none found, `setIsResuming(false)` and return (stay idle — this is the normal/common case).
  2. Fetch `visits = await visitService.getAllByPatientId(queue.patientId)`; take `latestVisit = visits[0]` (mirrors the convention already used in `useConsultation.initiateConsultation`). If no visits found, `setIsResuming(false)` and return (log a console error; do not throw to the UI as a hard failure — this indicates a data inconsistency, not a normal empty state).
  3. Fetch `prescription = await prescriptionService.getByVisitId(latestVisit.id)`, then `bill = await billingService.getByPrescriptionId(prescription.id)`, then `items = await prescriptionService.getItems(prescription.id)`.
  4. Apply `normalizePrescriptionStatus(prescription.status)` before using it.
  5. Call `setCurrentQueue(queue)`, `setCurrentPatient` (fetch via `patientService.getById(queue.patientId)` first), `setVisitHistory(visits)`, `setCurrentPrescription(prescription)`, `setPrescriptionItems(items)`, `setCurrentBill(bill)`, `setStatus("active")`.
  6. Dispatch `startSession({ queueId: queue.id, patientId: queue.patientId, visitId: latestVisit.id, prescriptionId: prescription.id, billId: bill.id, startedAt: queue.inProgressAt ?? new Date().toISOString() })` so the discovered identity is now persisted for subsequent same-tab navigation.
  7. `catch`: set `resumeError` to a user-facing message with a retry button (do not dispatch `clearSession()` here — there was nothing to clear, and clearing would not help).
  8. `finally`: `setIsResuming(false)`.

## 12. Verification

- [ ] 12.1 Path 1 (no navigation): start consultation, add prescription items, enter clinical notes, set discount percentages, calculate bill, complete — verify the completion request now actually sends the entered discount percentages (previously always 0).
- [ ] 12.2 Path 1 continued: navigate from `/consults` to another route and back within the same tab — clinical notes, discount inputs, and the active workspace (queue/patient/prescription/bill) are all restored.
- [ ] 12.3 Refresh the browser tab while a consultation is active (same tab, within 90 minutes) — workspace and drafts are restored via `resumeFromSession`.
- [ ] 12.4 Close the tab (clearing sessionStorage) and reopen the app in a new tab while the queue is still `IN_PROGRESS` — `resumeFromBackendQueue` restores the queue/patient/prescription/items/bill; `clinicalNotes` and both discount percentages are empty/0 (correctly lost with the old tab).
- [ ] 12.5 Simulate `startedAt` older than 90 minutes (e.g., temporarily edit sessionStorage in devtools) — on next mount, the local session is cleared and `resumeFromBackendQueue` is attempted (queue may or may not still be `IN_PROGRESS` depending on backend state).
- [ ] 12.6 Complete a consultation and confirm `sessionStorage["consultationSession"]` is cleared (back to default) immediately after finalize succeeds, without needing to close the completion modal.
- [ ] 12.7 New backend endpoints: call `GET /prescriptions?visitId=<valid>` and `GET /bills?prescriptionId=<valid>` directly (e.g. via curl/Postman) and confirm 200 with correct payload, and 404 for a non-existent id.
