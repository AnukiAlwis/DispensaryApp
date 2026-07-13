## ADDED Requirements

### Requirement: Detect interrupted consultations
The system SHALL detect when a consultation was interrupted and allow resumption.

#### Scenario: Page refresh during active consultation
- **WHEN** browser is refreshed while consultation is active
- **THEN** system checks for queue entries with status IN_PROGRESS for the current doctor

#### Scenario: Resume consultation found
- **WHEN** IN_PROGRESS queue entry exists and is within 90-minute timeout
- **THEN** system automatically loads the consultation workspace with existing prescription and bill data

#### Scenario: Resume consultation expired
- **WHEN** IN_PROGRESS queue entry exists but exceeds 90-minute timeout
- **THEN** system displays modal "Session expired. Would you like to resume or start fresh?" with Resume/Start Fresh buttons

#### Scenario: No interrupted consultation
- **WHEN** no IN_PROGRESS queue entry exists for current doctor
- **THEN** system displays idle queue state normally

### Requirement: Implement 90-minute timeout
The system SHALL enforce a 90-minute timeout for consultation sessions.

#### Scenario: Calculate session duration
- **WHEN** checking for interrupted consultation
- **THEN** system calculates duration as current time minus queue.inProgressAt timestamp

#### Scenario: Within timeout window
- **WHEN** session duration is ≤ 90 minutes
- **THEN** system allows automatic resume without confirmation

#### Scenario: Beyond timeout window
- **WHEN** session duration is > 90 minutes
- **THEN** system requires user confirmation before resuming

### Requirement: Resume consultation state
The system SHALL restore all consultation data when resuming an interrupted session.

#### Scenario: Load prescription data
- **WHEN** resuming consultation
- **THEN** system calls GET /prescriptions/{id} to fetch existing prescription items

#### Scenario: Load bill data
- **WHEN** resuming consultation
- **THEN** system calls GET /bills/{billId} to fetch existing bill with discounts and totals

#### Scenario: Load patient data
- **WHEN** resuming consultation
- **THEN** system calls GET /visits?patientId={id} to fetch visit history

#### Scenario: Restore UI state
- **WHEN** all data is loaded
- **THEN** system renders consultation workspace with prescription items, clinical notes (if saved), and billing section in appropriate state

### Requirement: Handle resume failures
The system SHALL handle errors during consultation resume gracefully.

#### Scenario: Resume data fetch failure
- **WHEN** any data fetch fails during resume
- **THEN** system displays error "Failed to resume consultation. Starting fresh." and executes normal initiation cascade

#### Scenario: Corrupted session state
- **WHEN** prescription or bill data is missing/invalid
- **THEN** system displays error and offers to start fresh consultation

### Requirement: Provide manual resume option
The system SHALL allow doctors to manually resume interrupted consultations.

#### Scenario: Resume button in idle state
- **WHEN** IN_PROGRESS queue entry exists
- **THEN** system shows "Resume Consultation" button alongside "Start Consulting" in idle queue display

#### Scenario: Manual resume action
- **WHEN** doctor clicks "Resume Consultation" button
- **THEN** system loads the interrupted consultation workspace

#### Scenario: Start fresh option
- **WHEN** doctor clicks "Start Consulting" while interrupted session exists
- **THEN** system shows confirmation "An active consultation exists. Starting fresh will discard it. Continue?" with Yes/No buttons

### Requirement: Clear session on completion
The system SHALL clear session state when consultation completes normally.

#### Scenario: Successful completion cleanup
- **WHEN** finalization cascade completes successfully
- **THEN** system clears all local state (prescription items, notes, billing data) before transitioning to idle

#### Scenario: Session persistence
- **WHEN** consultation is active
- **THEN** system does NOT persist state to localStorage (relies on backend queue status only)

### Requirement: Display completion modal
The system SHALL show a success modal after consultation finalization.

#### Scenario: Modal content
- **WHEN** finalization cascade succeeds
- **THEN** system displays modal with header "Consultation Finished", body "Queue number [X] finished serving. Prescription sent to pharmacist.", and "CLOSE" button

#### Scenario: Modal close action
- **WHEN** doctor clicks "CLOSE" button
- **THEN** system closes modal, resets all state, unmounts workspace, and auto-fetches next patient

#### Scenario: Modal is blocking
- **WHEN** completion modal is displayed
- **THEN** system prevents interaction with underlying workspace (modal overlay blocks clicks)
