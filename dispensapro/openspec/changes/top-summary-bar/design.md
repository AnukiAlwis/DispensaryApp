## Context

The frontend `TopSummaryBar` component (in `src/layouts/TopSummaryBar.tsx`) is rendered globally in `AppLayout` and displays four "Today's Summary" stats with hardcoded values. The backend (Spring Boot, `dispensary/`) has the necessary entities — `QueueEntry` for queue status and `Bill` for financial data — but no aggregation/summary endpoints exist.

The backend is multi-tenant with per-doctor scoping. `TenantContext` holds `tenantId` (from `X-Tenant-ID` header via `TenantFilter`) and `currentUser` (currently hardcoded to a default UUID because `TenantFilter` does not read any user header). The frontend `apiClient.tsx` sends `X-Tenant-ID` but not `X-User-ID`.

Key entity relationships for the summary:
- `QueueEntry` has `doctor_id`, `queue_date`, `status` (BOOKED, CHECKED_IN_WAITING, IN_PROGRESS, SERVED, NO_SHOW, REMOVED), and `tenant_id`.
- `Bill` has `tenant_id`, `prescription_id` (OneToOne to `Prescription`), `grand_total`, `doctor_fee`, `doctor_fee_final`, `medicine_total`, `medicine_total_final`, `status` (DUE, PAID, VOID), and `created_at`. `Bill` has no direct `doctor_id` — the doctor is reached through `Bill → Prescription → User(doctor)`.

## Goals / Non-Goals

**Goals:**
- Provide a single `GET /summary/today` endpoint returning per-doctor daily stats.
- Return 4 metrics: patients waiting (CHECKED_IN_WAITING count), patients served (SERVED count), total income (SUM of grandTotal for PAID bills), total charity (SUM of discount amounts for all bills created today).
- Make the logged-in doctor's identity available in `TenantContext` via `X-User-ID` header.
- Replace hardcoded values in `TopSummaryBar.tsx` with live API data.

**Non-Goals:**
- Full authentication / Keycloak integration (still MVP with header-based identity).
- Historical summaries (e.g., weekly/monthly) — only "today".
- Tenant-wide summaries (always per-doctor).
- Real-time updates (no WebSocket/SSE — standard HTTP request).
- Caching or materialized views for performance.

## Decisions

### 1. Single endpoint vs. multiple endpoints
**Decision**: Single `GET /summary/today` returning a JSON object with all 4 fields.

**Rationale**: The frontend needs all 4 values simultaneously in one component. One round-trip is simpler and faster than four. The service layer calls four repository methods internally.

**Alternative considered**: Separate endpoints (`/queue/count-waiting`, `/bills/income-today`, etc.) — rejected as over-engineered for a single UI component.

### 2. Doctor identity via `X-User-ID` header
**Decision**: Add `X-User-ID` header parsing to `TenantFilter`. Frontend `apiClient.tsx` sends a hardcoded doctor UUID (same MVP pattern as `X-Tenant-ID`).

**Rationale**: Minimal change to existing architecture. `TenantContext.getCurrentUser()` already exists and is used by other controllers. The filter just needs to populate it from the header instead of relying on the hardcoded fallback.

**Alternative considered**: JWT token parsing — rejected as out of scope for MVP. Keycloak integration is future work.

### 3. Charity calculation: discount-based, computed from percentage fields (defensive)
**Decision**: Total charity = `SUM((doctorFee * COALESCE(doctorDiscountPct, 0) / 100) + (medicineTotal * COALESCE(pharmacyDiscountPct, 0) / 100))` for all bills created today for this doctor, regardless of bill status.

**Rationale**: The backend has no explicit "charity" field. The discount amounts (`doctorDiscountPct` applied to `doctorFee`, `pharmacyDiscountPct` applied to `medicineTotal`) represent the concession/charity given. Computing from the raw percentage fields is **defensive** — it does not depend on `doctorFeeFinal` or `medicineTotalFinal` being up-to-date. The `doctorDiscountPct` and `pharmacyDiscountPct` fields are set directly by `updateDiscounts` and do not require `calculateBill` to have been called. This avoids the risk of stale `*Final` fields if the `calculate` API call fails or is skipped in the workflow (see Risk 3).

**Alternative considered (rejected)**: `SUM((doctorFee - doctorFeeFinal) + (medicineTotal - medicineTotalFinal))` — this depends on `calculateBill` being called to populate `doctorFeeFinal` and `medicineTotalFinal`. If `calculate` fails silently (as it can in `PrescriptionDispensingPage.tsx` where the error is swallowed), the final fields remain stale and charity is underreported.

**Alternative considered (rejected)**: Only count bills where `doctorDiscountPct = 100 AND pharmacyDiscountPct = 100` — too narrow; partial discounts are also charity.

**Calculation breakdown**:
```
Charity per bill = (doctorFee × doctorDiscountPct / 100) + (medicineTotal × pharmacyDiscountPct / 100)

Example:
  doctorFee = 1000, doctorDiscountPct = 20  → doctor charity = 200
  medicineTotal = 500, pharmacyDiscountPct = 10 → pharmacy charity = 50
  Total charity for this bill = 250

If doctorDiscountPct is null → treated as 0 (COALESCE)
If pharmacyDiscountPct is null → treated as 0 (COALESCE)
```

### 4. Income: only PAID bills
**Decision**: Total income = `SUM(grandTotal) WHERE status = 'PAID'` for bills created today for this doctor.

**Rationale**: User explicitly confirmed only PAID bills count as income. DUE bills represent unbilled/pending revenue, not actual income.

### 5. Date filtering: `created_at` for bills, `queue_date` for queue entries
**Decision**: Bills filtered by `DATE(createdAt) = today`. Queue entries filtered by `queueDate = today`.

**Rationale**: `Bill.createdAt` records when the bill was generated. `QueueEntry.queueDate` is the explicit field for which day's queue the entry belongs to (set to `LocalDate.now()` in `@PrePersist`).

### 6. Bill → Doctor join path
**Decision**: JPQL query joins through `b.prescription.doctor.id` to filter bills by doctor.

**Rationale**: `Bill` has no direct `doctorId` column. The only path is `Bill → Prescription (OneToOne) → User (doctor, ManyToOne)`. JPQL handles this naturally.

## Risks / Trade-offs

- **[Risk] `X-User-ID` header is spoofable** → Mitigation: Acceptable for MVP. Future Keycloak integration will replace this with JWT-based identity. Document in code comments.
- **[Risk] `DATE(createdAt)` in JPQL may not use index** → Mitigation: For MVP data volumes this is fine. If performance becomes an issue, add a derived column or use date range queries (`createdAt >= startOfDay AND createdAt < startOfNextDay`).
- **[Risk] Charity calculation depends on `calculateBill` being called** → **RESOLVED**: Charity is now computed from raw percentage fields (`doctorDiscountPct`, `pharmacyDiscountPct`) instead of pre-calculated final fields (`doctorFeeFinal`, `medicineTotalFinal`). The percentage fields are set directly by `updateDiscounts` and do not depend on `calculateBill` being called. This makes the summary query resilient to stale final fields. Note: `medicineTotal` itself could still be stale if `calculateBill` was never called after dispensing, but this is a separate workflow bug that affects the billing modal display too, not just the summary.
- **[Risk] Frontend hardcoded doctor UUID may not match any doctor** → Mitigation: Use the same UUID that `TenantContext` defaults to (`3c2c95c5-db0d-42e9-86de-b02cfecddbda`). Verify this user exists and has role DOCTOR in the database.
