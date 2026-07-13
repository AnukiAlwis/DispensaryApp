## Why

The DispensaPro application needs a unified doctor consultation workspace to streamline the clinical workflow. Currently, doctors must navigate between multiple screens to review patient history, write prescriptions, manage billing, and complete consultations. This creates inefficiency and increases the risk of errors. A single, integrated workspace will enable doctors to complete entire consultations—from patient review to prescription finalization—in one continuous flow, improving both speed and accuracy while reducing context switching.

## What Changes

- **New Consultation Workspace**: A single-page application for doctors to manage complete patient consultations
- **Idle Queue Display**: Shows the next patient in queue with "Start Consulting" action
- **Active Patient Header**: Displays current patient information and queue number during consultation
- **Past Visits Accordion**: Collapsible view of patient's historical visits (last 5-10 visits)
- **Clinical Notes Section**: Multi-line text input for capturing signs, symptoms, and diagnostic observations
- **Prescription Builder**: Dynamic interface for searching medicines, adding prescription items with dosage/frequency/duration, and real-time stock validation
- **Billing Calculator**: Automatic bill calculation with doctor fee and medicine costs, plus discount management
- **Multi-Step Cascade Workflows**: Automated initiation (3 API calls) and finalization (5 API calls) sequences
- **Completion Modal**: Success confirmation with automatic transition to next patient
- **Resume Consultation**: 90-minute timeout mechanism to handle interrupted sessions

## Capabilities

### New Capabilities

- `consultation-queue-management`: Managing the doctor's consultation queue, including fetching next patient, starting consultations, and marking consultations complete
- `consultation-workspace-ui`: The unified consultation interface with patient header, visit history, clinical notes, prescription builder, and billing sections
- `prescription-management`: Creating and managing prescription items with medicine search, dosage entry, quantity calculation, and stock validation
- `consultation-billing`: Calculating bills with doctor fees, medicine costs, and discount percentages with live frontend recalculation
- `consultation-workflow-orchestration`: Multi-step API cascade workflows for consultation initiation and finalization with error handling
- `consultation-session-management`: Resume consultation feature with 90-minute timeout and state persistence

### Modified Capabilities

<!-- No existing capabilities are being modified at the requirement level -->

## Impact

**Frontend Changes:**
- New feature module: `src/features/consults/` with components, hooks, services, pages, and types
- 8+ new React components (IdleQueueCard, ActivePatientHeader, PrescriptionBuilder, BillingSection, etc.)
- 4+ new custom hooks (useConsultation, usePrescription, useBilling, enhanced useQueue)
- 3+ new service modules (consultationService, prescriptionService, billingService)
- Enhanced error handling for multi-step cascade workflows
- New route: `/consults` (already exists as placeholder)

**Backend Dependencies:**
- Relies on existing APIs: `/queue`, `/visits`, `/prescriptions`, `/bills`, `/medicines`
- **Missing APIs** (to be developed later): 
  - `PUT /prescriptions/{id}/items/{itemId}` (edit prescription item)
  - `DELETE /prescriptions/{id}/items/{itemId}` (delete prescription item)
  - Optional: `GET /medicines?search=<term>` (medicine search endpoint)

**Shared Components:**
- Reuses: `SectionCard`, `DataTable`, `DialogModal`, `StatusChip`, `QueueBadge`, `PatientIdentityCell`
- May need new shared components for autocomplete or creatable combobox patterns

**State Management:**
- Local component state for consultation workflow (no Redux needed)
- Feature-scoped hooks for data fetching and CRUD operations

**User Experience:**
- Doctors can complete consultations 40-60% faster with unified workspace
- Reduced errors from real-time stock validation
- Automatic queue progression improves patient throughput
- Resume capability prevents lost work from interruptions
