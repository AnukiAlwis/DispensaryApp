## Context

The consultation workspace currently keeps working state in component-local React state within `ConsultsPage` and helper hooks. Initiation and finalization cascades already call backend services to create and complete resources (queue start, prescription create/items, bill create/calculate). Session recovery code exists but is commented out. As a result, navigating to another route or refreshing the page loses client-only state such as clinical notes and discount inputs.

The backend already supports: queue `IN_PROGRESS` status with timestamps; listing today’s queues; creating/fetching prescriptions and items; creating/fetching/calculating bills; and visit notes APIs. No backend changes are strictly required.

We decided to persist client-only drafts using sessionStorage so drafts live within the same tab/session and are cleared on tab close or logout.

## Goals / Non-Goals

**Goals:**
- Preserve in-progress consultation state across in-app navigation and same-tab refresh.
- Persist only minimal session identity and unsaved drafts in the client; refetch authoritative data from backend on resume.
- Enforce a 90-minute timeout window for auto-resume based on queue `inProgressAt`.
- Clear session on completion, logout, or when the queue is no longer `IN_PROGRESS`.
- Minimal changes to existing flows and backend.

**Non-Goals:**
- Cross-tab or cross-device draft syncing (drafts intentionally do not cross tabs).
- Offline editing or background autosave of clinical notes to backend.
- Changing backend queue/prescription/bill domain flows.

## Decisions

- Use a Redux Toolkit `consultationSession` slice (`src/store/consultationSlice.ts`) to hold ONLY:
  - Identity: `status` ("idle" | "active"), `queueId`, `patientId`, `visitId`, `prescriptionId`, `billId`, `startedAt`.
  - Unsaved drafts: `clinicalNotes`, `doctorDiscountPct`, `pharmacyDiscountPct`.
  - No full domain objects (Queue/Patient/Visit/Prescription/Bill) are stored here. `ConsultsPage` keeps those as local `useState`, refetched by ID on resume. This keeps the slice small and avoids stale/duplicated data.

- **Persistence mechanism**: no new dependency (`redux-persist` is NOT installed and will NOT be added). Instead:
  - `src/store/sessionStoragePersist.ts` exports `loadPersistedSession()` (reads/parses `sessionStorage["consultationSession"]`, returns `undefined` on missing/invalid JSON) and `savePersistedSession(state)` (writes `JSON.stringify(state)`, swallows quota/serialization errors).
  - `consultationSlice.ts` uses `loadPersistedSession() ?? defaultInitialState` as its `initialState`.
  - `store.tsx` calls `store.subscribe(() => savePersistedSession(store.getState().consultationSession))` once, right after `configureStore`.
  - This is a plain subscribe-and-write pattern — no middleware, no extra config, easy to reason about and test.

- **Existing bug found during review — must fix as part of this change**: `BillingSection.tsx` currently keeps `doctorDiscountPct`/`pharmacyDiscountPct` as internal `useState`, never surfaced to the parent. `ConsultsPage.handleComplete` sends `doctorDiscountPct`/`pharmacyDiscountPct` from `useBilling()`, whose `updateDiscounts` is never called by anyone — so discounts entered by the doctor are **currently always saved as 0**. Fixing the wiring is required, not optional, because the same fields are being moved into the Redux slice and must be the single source of truth:
  - `BillingSection` becomes a controlled component: replace its internal `doctorDiscountPct`/`pharmacyDiscountPct` state with two new required props (`doctorDiscountPct`, `pharmacyDiscountPct`) and a new callback prop `onDiscountsChange(doctorPct: number, pharmacyPct: number)`, invoked from the existing change handlers instead of local `setState`.
  - `ConsultsPage` supplies these props from the Redux slice and dispatches an update action in `onDiscountsChange`.
  - `useBilling()` keeps `doctorFee`, `medicineTotal`, `calculate()` as-is (these are recalculated from the backend, not drafts) but its own `doctorDiscountPct`/`pharmacyDiscountPct`/`updateDiscounts` become unused and are removed to avoid two sources of truth.

- **Prescription status mismatch**: backend `PrescriptionResponseDto.status` / `Prescription` entity return `STARTED` for a newly created prescription (see `PrescriptionServiceImpl`), but `prescriptionService.create` in the frontend fabricates `status: "ACTIVE"` client-side (since the create endpoint only returns a UUID), and the `Prescription` TS type only allows `"ACTIVE" | "ISSUED" | "DISPENSED" | "CANCELLED"`. When resuming via `prescriptionService.getById` (which hits the real backend GET), the raw value will be `"STARTED"`. Add a small normalizer used only on the resume path: map backend `"STARTED"` → frontend `"ACTIVE"`, pass through other values unchanged. Keep this local to the resume code path; do not change the backend enum or the initiation path.

- **Resume algorithm (fast path only; see "Unified resume algorithm" below for the full picture including the no-session case)**, implemented as a `useEffect` in `ConsultsPage` that runs once on mount (guarded so it does not run when `status` is already `"active"`):
  1. Read `queueId`, `patientId`, `visitId`, `prescriptionId`, `billId`, `startedAt` from the `consultationSession` slice (already rehydrated into Redux from sessionStorage on app load).
  2. If `queueId` is missing → fall through to the no-session branch of the unified algorithm (may still resume via backend lookup).
  3. Compute `minutesElapsed = (Date.now() - new Date(startedAt).getTime()) / 60000`. If `> 90` → dispatch `clearSession()` and stay idle.
  4. Call `queueService.getById(queueId)`. If it throws, or `queue.status !== "IN_PROGRESS"` → dispatch `clearSession()` and stay idle.
  5. Fetch in parallel: `patientService.getById(patientId)`, `visitService.getAllByPatientId(patientId)`, `prescriptionService.getById(prescriptionId)` (apply the status normalizer), `prescriptionService.getItems(prescriptionId)`, `billingService.getById(billId)`.
  6. Populate the existing local `useState` setters (`setCurrentQueue`, `setCurrentPatient`, `setVisitHistory`, `setCurrentPrescription`, `setPrescriptionItems`, `setCurrentBill`) and set `status` to `"active"`.
  7. `clinicalNotes`/`doctorDiscountPct`/`pharmacyDiscountPct` need no extra fetch — they are read live from the already-rehydrated Redux slice.
  8. On any fetch failure in steps 5-6, show a retry affordance (reuse the existing `Backdrop`/`error` pattern in `ConsultsPage`) rather than silently clearing the session, since the queue was confirmed valid in step 4.

- **Cleanup triggers** (dispatch `clearSession()`):
  - Immediately after a successful `finalizeConsultation` in `handleComplete` (queue is now `SERVED`).
  - In `handleCloseCompletion` (defensive double-clear, harmless no-op if already cleared).
  - On resume-timeout or invalid-queue detection (step 3/4 above).
  - Logout: **out of scope for this change**. `TopBar.tsx`'s logout icon currently has no `onClick` handler at all (no logout flow exists yet in the app). We will not invent one. `clearSession()` is exported from the slice so a future logout implementation can call it, but wiring it up is not part of this change's required tasks.

- **Cross-tab / post-close resume (Path 2) requires a minimal backend addition.** sessionStorage is empty in a fresh tab, so there is no `prescriptionId`/`billId` to resume from. `queueService.start()` also cannot be called again on an already-`IN_PROGRESS` queue (`ALLOWED_TRANSITIONS` in `QueueServiceImpl` only allows `CHECKED_IN_WAITING → IN_PROGRESS`, not `IN_PROGRESS → IN_PROGRESS`, so retrying `start()` throws `InvalidStatusTransitionException`). To recover committed backend state without sessionStorage, we add two small read-only backend lookups:
  - `PrescriptionRepository.findByVisitId(UUID)` already exists and is unused. Expose it via a new service method `getPrescriptionByVisitId` and a new controller endpoint `GET /prescriptions?visitId={uuid}` (404 if none).
  - `Bill` has a `OneToOne` to `Prescription` (`Bill.prescription`), so add `BillRepository.findByPrescription_Id(UUID prescriptionId)` (derived query), a new service method `getBillByPrescriptionId`, and a new controller endpoint `GET /bills?prescriptionId={uuid}` (extending the existing `GET /bills` endpoint's query params alongside `patientId`, 404 if none).
  - These are additive, read-only, tenant-scoped lookups; no existing endpoint behavior changes.

- **Unified resume algorithm** (covers both Path 1 same-tab nav/refresh and Path 2 fresh-tab/post-close), run once on `ConsultsPage` mount:
  1. If the Redux slice has a `queueId` (sessionStorage had a session): validate timeout and `IN_PROGRESS` status as before, then fetch patient/visits/prescription-by-id/items/bill-by-id directly (fast path, full drafts restored).
  2. If the slice has no `queueId` (fresh tab, or first load): call `queueService.getAll(doctorId)` and look for an entry with `status === "IN_PROGRESS"` belonging to this doctor. If none found, stay idle (normal case, nothing to resume).
  3. If found: fetch `visits = visitService.getAllByPatientId(queue.patientId)`, take `latestVisit = visits[0]` (same convention already used in `useConsultation.initiateConsultation`). Fetch `prescription = prescriptionService.getByVisitId(latestVisit.id)` (new endpoint) and `bill = billingService.getByPrescriptionId(prescription.id)` (new endpoint), then `items = prescriptionService.getItems(prescription.id)`.
  4. Populate the same local `useState` setters as the fast path, set `status = "active"`, and dispatch `startSession({ queueId: queue.id, patientId: queue.patientId, visitId: latestVisit.id, prescriptionId: prescription.id, billId: bill.id, startedAt: queue.inProgressAt ?? new Date().toISOString() })` so the now-discovered identity is persisted for subsequent same-tab navigation. `clinicalNotes`/discount drafts remain empty/0 (correct — they were lost with the old tab).
  5. If any lookup in step 3 fails (e.g., prescription not found for an `IN_PROGRESS` queue — a data-inconsistency edge case), show `resumeError` with a retry button rather than crash; do not attempt to auto-fix by creating a new prescription.

- Do not add `medicineName`/`strength` to `PrescriptionItemResponseDto` in this change. Resumed committed items will render with the existing "Medicine" fallback label in `CommittedItemRow` — a known, acceptable, cosmetic limitation, not a functional blocker.

## Risks / Trade-offs

- Accidental tab close loses unsaved drafts (intentional with sessionStorage). No navigate/close warning is added in this change (kept out of scope to limit blast radius).
- Multi-tab scenarios may open a second tab without drafts; acceptable per non-goals. The `IN_PROGRESS` queue gate prevents a second tab from double-starting the same consultation, but does not prevent viewing/resuming the same in-progress queue from two tabs (last write wins on discounts/notes). Acceptable for v1.
- `STARTED` vs `ACTIVE` status normalization is applied only on the resume path; if other code paths later call `prescriptionService.getById` directly, they must apply the same normalizer or risk a TS/runtime mismatch. Mitigation: keep the normalizer as a small exported function (e.g., `normalizePrescriptionStatus`) in `prescriptionService.ts` so it's reusable.
- Fixing the discount-wiring bug changes real behavior (discounts will now actually be saved) — call this out explicitly to the user as a behavior change, not just a refactor.
- No logout cleanup hook exists yet; a doctor who logs out via some future mechanism without hitting `clearSession()` will still have a resumable session next login, gated only by the 90-minute timeout and `IN_PROGRESS` check. Acceptable given no logout flow currently exists.
