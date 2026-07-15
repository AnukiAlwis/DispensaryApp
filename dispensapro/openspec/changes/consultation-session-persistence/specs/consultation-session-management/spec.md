## ADDED Requirements

### Requirement: Persist in-progress consultation session within the same browser tab
The system SHALL persist the minimal active consultation session identity and unsaved draft inputs to sessionStorage so that the doctor can navigate within the app or refresh the page without losing work.

#### Scenario: Persist session identity and drafts
- **WHEN** a consultation is started
- **THEN** the system stores `queueId`, `patientId`, `visitId`, `prescriptionId`, `billId`, and `startedAt` in sessionStorage
- **AND** the system stores draft-only inputs: `clinicalNotes`, `doctorDiscountPct`, `pharmacyDiscountPct`

#### Scenario: Do not persist bulky objects
- **WHEN** a consultation is in progress
- **THEN** the system SHALL NOT persist entire Queue, Patient, Visit, Bill, or Prescription objects to client storage

### Requirement: Resume consultation workspace on route change or same-tab refresh
The system SHALL detect an IN_PROGRESS queue within a 90-minute window and rehydrate the consultation workspace using fresh backend data.

#### Scenario: Auto-resume after route change
- **WHEN** the doctor leaves the consultation route and returns within 90 minutes
- **THEN** the system detects an IN_PROGRESS queue matching the stored `queueId`
- **AND** refetches Patient, Visit history, Prescription (+items), and Bill from the backend
- **AND** restores draft `clinicalNotes` and discount percentages from sessionStorage

#### Scenario: Auto-resume after page refresh
- **WHEN** the browser page is refreshed while an active consultation is in progress and within 90 minutes
- **THEN** the system rehydrates the consultation workspace as above

### Requirement: Resume committed consultation data without a client-side session
The system SHALL allow the doctor to resume a consultation's committed backend data (queue, prescription, prescription items, bill) after the sessionStorage session is unavailable (closed tab, new tab, or app restart), as long as the queue is still IN_PROGRESS.

#### Scenario: Resume after closing the tab
- **WHEN** the doctor closes the tab (or logs out) while a queue entry is IN_PROGRESS, then reopens the application
- **THEN** the system detects the IN_PROGRESS queue entry for the doctor
- **AND** looks up the prescription for the patient's latest visit and the bill for that prescription
- **AND** rehydrates the consultation workspace with the committed prescription items and bill
- **AND** leaves `clinicalNotes` and discount percentage fields empty/zero, since those drafts were not persisted

#### Scenario: No resumable session and no in-progress queue
- **WHEN** the doctor opens the consultation workspace with no persisted session and no IN_PROGRESS queue for them
- **THEN** the system renders the idle state and does not attempt any resume lookups beyond the initial queue check

### Requirement: Explicit non-goals and cleanup
The system SHALL limit draft persistence to the current browser tab/session and clear it at defined points.

#### Scenario: Drafts cleared on completion
- **WHEN** the doctor completes the consultation and the queue is marked SERVED
- **THEN** the system clears the persisted session keys and drafts from sessionStorage

#### Scenario: Drafts cleared on logout or timeout
- **WHEN** the doctor logs out or the session exceeds 90 minutes since `inProgressAt`/`startedAt`
- **THEN** the system clears the persisted session keys and drafts from sessionStorage

#### Scenario: No cross-tab draft syncing
- **WHEN** the doctor opens the application in a new browser tab
- **THEN** the system SHALL NOT load unsaved drafts into the new tab
- **AND** the new tab MAY still resume server-side state (e.g., IN_PROGRESS queue) without the unsaved drafts
