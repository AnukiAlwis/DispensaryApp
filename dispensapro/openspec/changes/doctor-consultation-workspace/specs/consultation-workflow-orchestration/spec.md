## ADDED Requirements

### Requirement: Execute initiation cascade
The system SHALL execute a 3-step API cascade when starting a consultation.

#### Scenario: Initiation cascade sequence
- **WHEN** doctor clicks "Start Consulting" button
- **THEN** system executes in order: 1) PATCH /queue/{id}/start, 2) GET /visits?patientId={id}, 3) POST /prescriptions with visitId and patientId

#### Scenario: Cascade step 1 success
- **WHEN** PATCH /queue/{id}/start returns 200 OK
- **THEN** system proceeds to step 2 and shows progress indicator "Loading patient history..."

#### Scenario: Cascade step 2 success
- **WHEN** GET /visits?patientId={id} returns 200 OK
- **THEN** system stores visit history and proceeds to step 3 with progress "Creating prescription..."

#### Scenario: Cascade step 3 success
- **WHEN** POST /prescriptions returns 200 OK with prescription ID
- **THEN** system stores prescription ID, creates bill via POST /bills with visitId, and renders consultation workspace

#### Scenario: Cascade failure at any step
- **WHEN** any step in the cascade fails
- **THEN** system displays error message "Failed at step [N]: [step name]" via snackbar and remains in idle state

### Requirement: Execute finalization cascade
The system SHALL execute a 5-step API cascade when completing a consultation.

#### Scenario: Finalization cascade sequence
- **WHEN** doctor clicks "Complete Consultation & Send Prescription" button
- **THEN** system executes in order: 1) POST /visits/{visitId}/notes, 2) PUT /bills/{billId}/discounts, 3) POST /bills/{billId}/calculate, 4) PUT /prescriptions/{id}/status with status "ISSUED", 5) PATCH /queue/{queueId}/serve

#### Scenario: Save clinical notes step
- **WHEN** step 1 executes
- **THEN** system calls POST /visits/{visitId}/notes with request body { "note": "<notes text or empty string>" }

#### Scenario: Save discounts step
- **WHEN** step 2 executes
- **THEN** system calls PUT /bills/{billId}/discounts with { "doctorDiscountPct": <value>, "pharmacyDiscountPct": <value> }

#### Scenario: Final bill calculation step
- **WHEN** step 3 executes
- **THEN** system calls POST /bills/{billId}/calculate to sync server-side totals

#### Scenario: Lock prescription step
- **WHEN** step 4 executes
- **THEN** system calls PUT /prescriptions/{id}/status with { "status": "ISSUED" } to prevent further modifications

#### Scenario: Complete queue step
- **WHEN** step 5 executes
- **THEN** system calls PATCH /queue/{queueId}/serve to mark consultation complete

#### Scenario: Successful finalization
- **WHEN** all 5 steps complete successfully
- **THEN** system displays completion success modal

#### Scenario: Finalization failure at step N
- **WHEN** any step fails
- **THEN** system displays error "Failed at step [N]: [step name]" and provides "Retry" button to resume from failed step

### Requirement: Show progress indicators
The system SHALL display progress feedback during cascade execution.

#### Scenario: Initiation progress
- **WHEN** initiation cascade is running
- **THEN** system shows loading spinner with text indicating current step (e.g., "Starting consultation...", "Loading patient history...", "Creating prescription...")

#### Scenario: Finalization progress
- **WHEN** finalization cascade is running
- **THEN** system shows loading spinner with step counter "Step 1 of 5: Saving notes..." through "Step 5 of 5: Completing consultation..."

#### Scenario: Disable UI during cascade
- **WHEN** any cascade is executing
- **THEN** system disables all interactive elements to prevent concurrent actions

### Requirement: Handle cascade errors
The system SHALL provide error recovery options when cascades fail.

#### Scenario: Display specific error
- **WHEN** cascade step fails
- **THEN** system shows error message with step number, step name, and backend error message from API response

#### Scenario: Retry failed cascade
- **WHEN** doctor clicks "Retry" button after cascade failure
- **THEN** system re-executes the cascade from the beginning (not from failed step)

#### Scenario: Cancel after error
- **WHEN** doctor closes error snackbar without retrying
- **THEN** system returns to previous state (idle for initiation failure, active workspace for finalization failure)

### Requirement: Prevent concurrent cascades
The system SHALL prevent multiple cascade executions simultaneously.

#### Scenario: Disable start button during initiation
- **WHEN** initiation cascade is running
- **THEN** system disables "Start Consulting" button

#### Scenario: Disable complete button during finalization
- **WHEN** finalization cascade is running
- **THEN** system disables "Complete Consultation & Send Prescription" button

#### Scenario: Re-enable after completion
- **WHEN** cascade completes (success or failure)
- **THEN** system re-enables the respective button
