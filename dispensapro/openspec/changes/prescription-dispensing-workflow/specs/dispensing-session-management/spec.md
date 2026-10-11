## ADDED Requirements

### Requirement: Single Active Dispensing Session
The system SHALL enforce that only one active dispensing session exists per tenant at any given time.

#### Scenario: Enforce single session
- **WHEN** medicine preparation begins for a prescription
- **THEN** no other prescription can be started
- **AND** pharmacist must complete the current workflow or continue the existing one

### Requirement: Dispense Now Button Disablement
The system SHALL disable all Dispense Now buttons when an active dispensing session exists.

#### Scenario: Disable on preparation start
- **WHEN** pharmacist starts preparing medicines for a prescription
- **THEN** all Dispense Now buttons in the Up Next table become disabled
- **AND** manual patient selection is not allowed

### Requirement: Dispense Now Button Enablement
The system SHALL enable all Dispense Now buttons when the dispensing workflow is completed.

#### Scenario: Enable on workflow completion
- **WHEN** pharmacist completes the dispensing workflow by selecting DONE
- **THEN** all Dispense Now buttons become enabled
- **AND** manual patient selection is allowed again

### Requirement: Manual Selection Before Preparation
The system SHALL allow manual patient selection only before preparation has started.

#### Scenario: Allow manual selection
- **WHEN** no active dispensing session exists
- **THEN** pharmacist may select Dispense Now for any prescription in the Up Next table
- **AND** that prescription becomes the Current Serving prescription

#### Scenario: Block manual selection during preparation
- **WHEN** an active dispensing session exists
- **THEN** all Dispense Now buttons are disabled
- **AND** manual patient selection is not allowed

---

## ADDED Requirements: Backend-Driven Recovery for Dropped Tabs

### Requirement: Display Billing Pending Prescriptions
The system SHALL display prescriptions that have been dispensed but not yet paid so a pharmacist can resume billing after closing the tab.

#### Scenario: Display billing pending prescriptions
- **WHEN** the pharmacist opens the Prescription Dispensing page
- **THEN** the system queries the backend for prescriptions with `status = DISPENSED` and an associated Bill with `status = DUE`
- **AND** displays them in a "Billing Pending" section

### Requirement: Resume Billing for a Pending Prescription
The system SHALL allow the pharmacist to open the Billing modal directly from a billing-pending prescription.

#### Scenario: Resume billing for a pending prescription
- **WHEN** the pharmacist selects "Complete Billing" for a billing-pending prescription
- **THEN** the Billing modal opens directly for that prescription
- **AND** the pharmacist can finish payment normally
