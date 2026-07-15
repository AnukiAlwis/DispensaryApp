## ADDED Requirements

### Requirement: Frontend-Only Preparation State
The system SHALL store medicine preparation status only in the frontend using sessionStorage, not in the backend.

#### Scenario: Store preparation in sessionStorage
- **WHEN** pharmacist starts preparing medicines
- **THEN** system stores preparation status in sessionStorage
- **AND** no backend persistence occurs

### Requirement: Preparation State Persistence
The system SHALL preserve preparation progress during page navigation and browser refresh within the active browser session.

#### Scenario: Survive page navigation
- **WHEN** pharmacist navigates between different pages (e.g., reception to dispensing)
- **THEN** preparation progress is preserved in sessionStorage
- **AND** selecting "Continue Dispense" resumes the workflow

#### Scenario: Survive browser refresh
- **WHEN** pharmacist refreshes the browser
- **THEN** preparation progress is preserved in sessionStorage
- **AND** selecting "Continue Dispense" resumes the workflow

### Requirement: Preparation State Clearance
The system SHALL clear preparation progress when the browser tab is closed, the browser is closed, or the dispensing workflow is completed by selecting DONE.

#### Scenario: Clear on workflow completion
- **WHEN** pharmacist selects DONE from the Billing modal
- **THEN** system clears the frontend preparation state from sessionStorage

#### Scenario: Clear on browser close
- **WHEN** pharmacist closes the browser tab or browser
- **THEN** sessionStorage is automatically cleared by the browser

### Requirement: Preparation Status Values
The system SHALL support three preparation status values: NOT_STARTED, STARTED, and READY_TO_DISPENSE.

#### Scenario: Initial status
- **WHEN** medicine preparation modal opens
- **THEN** all medicines have initial status NOT_STARTED

#### Scenario: Status transitions
- **WHEN** pharmacist clicks status button
- **THEN** status cycles: NOT_STARTED → STARTED → READY_TO_DISPENSE → NOT_STARTED

### Requirement: Status Button Styling
The system SHALL display status buttons with specific colors: Grey for NOT_STARTED, Yellow/Orange for STARTED, and Green for READY_TO_DISPENSE.

#### Scenario: Display status colors
- **WHEN** medicine has status NOT_STARTED
- **THEN** status button is Grey
- **WHEN** medicine has status STARTED
- **THEN** status button is Yellow/Orange
- **WHEN** medicine has status READY_TO_DISPENSE
- **THEN** status button is Green
