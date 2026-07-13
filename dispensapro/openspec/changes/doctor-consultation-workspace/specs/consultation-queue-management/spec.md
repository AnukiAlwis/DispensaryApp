## ADDED Requirements

### Requirement: Fetch next patient in queue
The system SHALL fetch the next waiting patient from the doctor's queue when the consultation workspace is in idle state.

#### Scenario: Next patient available
- **WHEN** the workspace loads in idle state
- **THEN** system calls `GET /queue?doctorId={doctorId}` and displays the first patient with status `WAITING` or `CHECKED_IN`

#### Scenario: Empty queue
- **WHEN** the queue has no waiting patients
- **THEN** system displays "No patients currently waiting in queue" message and disables the "Start Consulting" button

### Requirement: Start consultation
The system SHALL transition a queue entry to `IN_PROGRESS` status when the doctor starts a consultation.

#### Scenario: Successful consultation start
- **WHEN** doctor clicks "Start Consulting" button
- **THEN** system calls `PATCH /queue/{id}/start` and transitions queue status to `IN_PROGRESS`

#### Scenario: Start consultation failure
- **WHEN** the start consultation API call fails
- **THEN** system displays error message via snackbar and keeps the idle queue display visible

### Requirement: Complete consultation
The system SHALL mark a queue entry as `COMPLETED` when the doctor finishes the consultation workflow.

#### Scenario: Successful consultation completion
- **WHEN** the finalization cascade completes successfully
- **THEN** system calls `PATCH /queue/{id}/serve` to set queue status to `COMPLETED`

#### Scenario: Completion failure
- **WHEN** the serve API call fails during finalization
- **THEN** system displays error message indicating which step failed and provides retry option

### Requirement: Auto-fetch next patient
The system SHALL automatically fetch the next patient in queue after completing a consultation.

#### Scenario: Next patient available after completion
- **WHEN** doctor closes the completion success modal
- **THEN** system automatically calls `GET /queue?doctorId={doctorId}` to fetch the next waiting patient

#### Scenario: No more patients after completion
- **WHEN** doctor closes the completion modal and queue is empty
- **THEN** system displays idle state with "No patients currently waiting in queue" message

### Requirement: Display queue information
The system SHALL display patient identity and queue number in the idle state.

#### Scenario: Patient information display
- **WHEN** next patient is fetched successfully
- **THEN** system displays First Name, Last Name, Age, Gender, and Queue Number in a centered card layout

#### Scenario: Queue number badge
- **WHEN** consultation is active
- **THEN** system displays a prominent circular badge with the current queue number in the patient header
