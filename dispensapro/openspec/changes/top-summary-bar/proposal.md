## Why

The frontend `TopSummaryBar` displays "Today's Summary" with four hardcoded values (patients waiting, patients served, total income, total charity). There is no backend API to serve this data. The backend has all the necessary entities (`QueueEntry`, `Bill`) but no aggregation endpoints. A per-doctor daily summary API is needed so each doctor sees their own queue and revenue statistics for the current day.

## What Changes

- Add `X-User-ID` header parsing to `TenantFilter` so the logged-in doctor's identity is available in `TenantContext.currentUser` (currently hardcoded to a default UUID).
- Add `X-User-ID` header to the frontend `apiClient` interceptor.
- Add count queries to `QueueEntryRepository` for patients waiting (`CHECKED_IN_WAITING`) and served (`SERVED`) filtered by tenant, doctor, and queue date.
- Add sum queries to `BillRepository` for total income (`SUM(grandTotal)` where `status = PAID`) and total charity (`SUM` of discount amounts) filtered by tenant, doctor (via `prescription.doctor` join), and bill creation date.
- New `DailySummaryDto` with four fields: `patientsWaiting`, `patientsServed`, `totalIncome`, `totalCharity`.
- New `SummaryService` interface and `SummaryServiceImpl` that calls the four repository methods and assembles the DTO.
- New `SummaryController` with `GET /summary/today` endpoint.
- New frontend `summaryService.ts` and `useSummary` hook (React Query) to fetch the summary.
- Modify `TopSummaryBar.tsx` to replace hardcoded values with API data.

## Capabilities

### New Capabilities
- `daily-summary`: Per-doctor daily summary API returning patient counts (waiting/served) and financial totals (income/charity) for the current day.

### Modified Capabilities
- `consultation-queue-management`: No spec-level requirement changes — only adding repository count methods (implementation detail).
- `consultation-billing`: No spec-level requirement changes — only adding repository sum queries (implementation detail).

## Impact

- **Backend filter**: `TenantFilter.java` — add `X-User-ID` header reading (currently only reads `X-Tenant-ID`).
- **Backend repositories**: `QueueEntryRepository.java`, `BillRepository.java` — new query methods.
- **Backend new files**: `DailySummaryDto.java`, `SummaryService.java`, `SummaryServiceImpl.java`, `SummaryController.java`.
- **Frontend API client**: `apiClient.tsx` — add `X-User-ID` header.
- **Frontend new files**: `summaryService.ts`, `useSummary.ts`.
- **Frontend component**: `TopSummaryBar.tsx` — replace hardcoded stats with API-driven data.
- **No database migrations needed** — all queries operate on existing tables and columns.
- **No breaking changes** — new endpoint only; existing endpoints unaffected.
