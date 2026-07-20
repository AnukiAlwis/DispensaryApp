## ADDED Requirements

### Requirement: Daily summary endpoint
The system SHALL provide a `GET /summary/today` endpoint that returns per-doctor daily summary statistics for the current day.

#### Scenario: Doctor with activity today
- **WHEN** a GET request is made to `/summary/today` with valid `X-Tenant-ID` and `X-User-ID` headers
- **THEN** the system returns a JSON object with `patientsWaiting` (int), `patientsServed` (int), `totalIncome` (decimal), and `totalCharity` (decimal)

#### Scenario: Doctor with no activity today
- **WHEN** a GET request is made to `/summary/today` and the doctor has no queue entries or bills for today
- **THEN** the system returns `{ "patientsWaiting": 0, "patientsServed": 0, "totalIncome": 0, "totalCharity": 0 }`

#### Scenario: Missing X-User-ID header
- **WHEN** a GET request is made to `/summary/today` without an `X-User-ID` header
- **THEN** the system falls back to the default hardcoded user ID in `TenantContext` (MVP behavior)

### Requirement: Patients waiting count
The system SHALL calculate `patientsWaiting` as the count of `QueueEntry` records where `status = CHECKED_IN_WAITING`, `queueDate = today`, `tenant_id` matches the request tenant, and `doctor_id` matches the current user.

#### Scenario: Multiple patients waiting
- **WHEN** 3 queue entries exist for the doctor today with status `CHECKED_IN_WAITING`
- **THEN** `patientsWaiting` returns `3`

#### Scenario: No patients waiting
- **WHEN** no queue entries exist for the doctor today with status `CHECKED_IN_WAITING`
- **THEN** `patientsWaiting` returns `0`

### Requirement: Patients served count
The system SHALL calculate `patientsServed` as the count of `QueueEntry` records where `status = SERVED`, `queueDate = today`, `tenant_id` matches the request tenant, and `doctor_id` matches the current user.

#### Scenario: Multiple patients served
- **WHEN** 5 queue entries exist for the doctor today with status `SERVED`
- **THEN** `patientsServed` returns `5`

#### Scenario: No patients served
- **WHEN** no queue entries exist for the doctor today with status `SERVED`
- **THEN** `patientsServed` returns `0`

### Requirement: Total income calculation
The system SHALL calculate `totalIncome` as the sum of `grandTotal` (net amount after discounts) from all `Bill` records where `status = PAID`, `createdAt` is today, `tenant_id` matches the request tenant, and the bill's prescription's doctor matches the current user. `grandTotal` represents the actual amount collected from the patient (i.e., `doctorFeeFinal + medicineTotalFinal`, after discounts applied).

#### Scenario: Multiple paid bills today
- **WHEN** the doctor has 2 PAID bills today with `grandTotal` values of 1500.00 and 3000.00
- **THEN** `totalIncome` returns `4500.00`

#### Scenario: No paid bills today
- **WHEN** the doctor has no PAID bills with `createdAt` today
- **THEN** `totalIncome` returns `0`

#### Scenario: DUE bills excluded
- **WHEN** the doctor has bills today but all are in `DUE` status
- **THEN** `totalIncome` returns `0`

### Requirement: Total charity calculation
The system SHALL calculate `totalCharity` as the sum of `((doctorFee * COALESCE(doctorDiscountPct, 0) / 100) + (medicineTotal * COALESCE(pharmacyDiscountPct, 0) / 100))` from all `Bill` records where `createdAt` is today, `tenant_id` matches the request tenant, the bill's prescription's doctor matches the current user, and `status != 'VOID'`. Both PAID and DUE bills are included — discounts/charity given are counted regardless of payment status. VOID (cancelled) bills are excluded. The calculation uses the raw percentage fields (`doctorDiscountPct`, `pharmacyDiscountPct`) rather than the pre-calculated final fields (`doctorFeeFinal`, `medicineTotalFinal`) to ensure correctness even when the `calculateBill` API has not been called.

#### Scenario: Bill with doctor discount only
- **WHEN** a bill today has `doctorFee = 1000`, `doctorDiscountPct = 20`, `medicineTotal = 500`, `pharmacyDiscountPct = null`
- **THEN** `totalCharity` returns `200.00` (1000 × 20 / 100 = 200, pharmacy discount = 0)

#### Scenario: Bill with both doctor and pharmacy discounts
- **WHEN** a bill today has `doctorFee = 1000`, `doctorDiscountPct = 50`, `medicineTotal = 2000`, `pharmacyDiscountPct = 20`
- **THEN** `totalCharity` returns `900.00` (1000 × 50 / 100 = 500, plus 2000 × 20 / 100 = 400)

#### Scenario: No discounts given
- **WHEN** all bills today have `doctorDiscountPct = null` and `pharmacyDiscountPct = null`
- **THEN** `totalCharity` returns `0`

#### Scenario: VOID bills excluded
- **WHEN** the doctor has a VOID bill today with `doctorFee = 1000`, `doctorDiscountPct = 50`, `medicineTotal = 500`, `pharmacyDiscountPct = 10`
- **THEN** `totalCharity` returns `0` — VOID (cancelled) bills are excluded from charity calculation

#### Scenario: calculateBill never called but discounts set
- **WHEN** a bill today has `doctorFee = 1000`, `doctorDiscountPct = 30`, `medicineTotal = 0` (stale, calculateBill was not called after dispensing), `pharmacyDiscountPct = 10`
- **THEN** `totalCharity` returns `300.00` (1000 × 30 / 100 = 300, plus 0 × 10 / 100 = 0) — the doctor discount portion is correct even though `doctorFeeFinal` would be stale

### Requirement: X-User-ID header parsing in TenantFilter
The system SHALL read the `X-User-ID` header in `TenantFilter` and set it as `currentUser` in `TenantContext` when the header is present.

#### Scenario: Header present
- **WHEN** a request includes `X-User-ID: <valid-uuid>`
- **THEN** `TenantContext.getCurrentUser()` returns that UUID

#### Scenario: Header absent
- **WHEN** a request does not include `X-User-ID`
- **THEN** `TenantContext.getCurrentUser()` falls back to the default hardcoded UUID (existing behavior)

### Requirement: Frontend TopSummaryBar displays live data
The frontend `TopSummaryBar` component SHALL fetch summary data from `GET /summary/today` via a React Query hook and display the API response values instead of hardcoded values.

#### Scenario: Successful API response
- **WHEN** the summary API returns `{ "patientsWaiting": 5, "patientsServed": 12, "totalIncome": 4500, "totalCharity": 300 }`
- **THEN** the TopSummaryBar displays 5, 12, 4500, and 300 respectively

#### Scenario: API loading
- **WHEN** the API request is in progress
- **THEN** the TopSummaryBar displays a loading state (e.g., skeleton or dash placeholders)

#### Scenario: API error
- **WHEN** the API request fails
- **THEN** the TopSummaryBar displays 0 for all values or an error indicator

### Requirement: Immediate summary refresh on data-changing actions
The frontend SHALL use React Query's `invalidateQueries` to immediately refresh the summary data when specific user actions occur that change queue status or billing data. This provides instant feedback while 30-second polling continues as a safety net for changes from other sources.

#### Scenario: Queue status change triggers immediate refresh
- **WHEN** a user successfully calls `queueService.serve()`, `queueService.start()`, or `queueService.create()`
- **THEN** the component invalidates the `["summary", "today"]` query, triggering an immediate refetch of the summary API

#### Scenario: Billing status change triggers immediate refresh
- **WHEN** a user successfully calls `billingService.updateStatus()` or `billingService.updateDiscounts()`
- **THEN** the component invalidates the `["summary", "today"]` query, triggering an immediate refetch of the summary API

#### Scenario: Invalidation coexists with polling
- **WHEN** both the 30-second polling timer and a user action trigger a refetch simultaneously
- **THEN** React Query deduplicates the requests and only makes one API call to `/summary/today`
