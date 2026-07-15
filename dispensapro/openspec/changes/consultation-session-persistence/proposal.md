## Why

The current consultation workspace loses client-only state (clinical notes, discount percentages, active session identity) when the doctor navigates to another route or refreshes. This creates friction and risks rework. We need a reliable way to persist the in-progress consultation within the same browser tab/session and to resume the workspace on refresh with minimal backend changes.

## What Changes

- Introduce a Redux Toolkit `consultationSession` slice to hold the minimal session identity and unsaved draft inputs, persisted to sessionStorage only (no new npm dependency).
- Rehydrate the consultation workspace on `ConsultsPage` mount via two paths:
  - Fast path: a persisted session exists in sessionStorage → validate `IN_PROGRESS` + 90-minute timeout, then refetch by ID.
  - Fallback path: no persisted session (fresh tab / post-close / post-logout) but the backend still has an `IN_PROGRESS` queue for this doctor → discover `prescriptionId`/`billId` via two new backend lookups and resume with committed data (unsaved drafts are correctly empty).
- **Fix an existing bug**: `BillingSection` currently keeps discount percentages as internal, unsynced local state, so entered discounts are never actually sent to the backend at finalize time (always saved as 0). This change makes `BillingSection` a controlled component driven by the new slice, fixing the bug as a side effect of the migration.
- Add two new, purely additive, read-only backend lookup endpoints — `GET /prescriptions?visitId={uuid}` and `GET /bills?prescriptionId={uuid}` — no existing endpoint behavior changes; not a breaking change.
- Add a `normalizePrescriptionStatus` helper to reconcile backend `STARTED` vs frontend `ACTIVE` status values used only on resume paths.

## What Changes — Explicitly Out of Scope
- Cross-tab draft syncing, offline autosave, logout-triggered cleanup (no logout handler exists in the app yet), and `medicineName`/strength enrichment on resumed prescription items (cosmetic-only gap).

## Capabilities

### New Capabilities
- `consultation-session-management`: Defines how an active consultation session is identified, which client-only fields are persisted to sessionStorage, resume behavior on route change/refresh (90-minute timeout), and explicit non-goals (no cross-tab draft sync; drafts cleared on tab close/logout).

### Modified Capabilities
- None.

## Impact

- Frontend: new `src/store/consultationSlice.ts` and `src/store/sessionStoragePersist.ts` (custom, no new dependency); `src/store.tsx` registers the reducer and a `store.subscribe` write-through; `ConsultsPage.tsx` gains the resume effect and slice wiring; `BillingSection.tsx` becomes a controlled component; `useBilling.ts` loses its unused discount state; `prescriptionService.ts` gains `normalizePrescriptionStatus` and `getByVisitId`; `billingService.ts` gains `getByPrescriptionId`.
- Backend: additive only, no breaking changes. New `PrescriptionController` endpoint `GET /prescriptions?visitId=`, new `PrescriptionService.getPrescriptionByVisitId`. New/extended `BillController` `GET /bills` to accept `prescriptionId`, new `BillService.getBillByPrescriptionId`, new `BillRepository.findByPrescription_Id`.
- `IdleQueueCard.tsx`: no changes required — resume detection lives entirely in `ConsultsPage`'s mount effect.
