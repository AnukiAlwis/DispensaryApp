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
