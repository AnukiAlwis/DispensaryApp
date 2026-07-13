## ADDED Requirements

### Requirement: Display active patient header
The system SHALL display a permanent header showing the currently active patient information during consultation.

#### Scenario: Patient header content
- **WHEN** consultation is active
- **THEN** system displays "You are currently consulting: [First Name] [Last Name], [Age], Last Visit Date: [Date]" with queue number badge

#### Scenario: Last visit date display
- **WHEN** patient has previous visits
- **THEN** system displays the most recent visit date from the visit history

#### Scenario: No previous visits
- **WHEN** patient has no previous visits
- **THEN** system displays "First Visit" or "-" in the last visit date field

### Requirement: Display past visits accordion
The system SHALL provide a collapsible accordion to view patient's historical visits.

#### Scenario: Default collapsed state
- **WHEN** consultation workspace loads
- **THEN** past visits accordion is collapsed by default to optimize vertical space

#### Scenario: Expand visit history
- **WHEN** doctor clicks the accordion header
- **THEN** system expands to show a data table with the last 5 visits sorted chronologically (most recent first)

#### Scenario: Load more visits
- **WHEN** doctor clicks "Show More" button in expanded accordion
- **THEN** system displays up to 10 total visits (next 5 visits)

#### Scenario: Visit history columns
- **WHEN** visit history table is displayed
- **THEN** system shows columns: Visit Date/Time, Notes Preview (first 50 characters)

#### Scenario: No previous visits
- **WHEN** patient has no visit history
- **THEN** system displays "No previous visits to display" message in the accordion

### Requirement: Provide clinical notes input
The system SHALL provide a multi-line text input for capturing clinical observations.

#### Scenario: Notes input field
- **WHEN** consultation workspace is active
- **THEN** system displays a large multi-line TextField labeled "Clinical Notes"

#### Scenario: Empty notes allowed
- **WHEN** doctor leaves notes field blank
- **THEN** system allows finalization and sends empty string "" to the backend

#### Scenario: Notes validation
- **WHEN** notes field contains only whitespace
- **THEN** system treats it as empty and sends empty string to backend

### Requirement: Layout organization
The system SHALL organize consultation components in a top-to-bottom vertical layout.

#### Scenario: Component order
- **WHEN** consultation workspace is displayed
- **THEN** system renders components in order: Active Patient Header, Past Visits Accordion, Clinical Notes, Prescription Builder, Billing Section, Complete Button

#### Scenario: Responsive layout
- **WHEN** workspace is viewed on different screen sizes
- **THEN** system maintains vertical stacking and adjusts component widths responsively using MUI Grid/Box

### Requirement: Workspace state transitions
The system SHALL transition between idle and active states based on consultation status.

#### Scenario: Idle to active transition
- **WHEN** initiation cascade completes successfully
- **THEN** system unmounts idle queue card and renders full consultation workspace

#### Scenario: Active to idle transition
- **WHEN** doctor closes the completion success modal
- **THEN** system unmounts consultation workspace and renders idle queue display

#### Scenario: State persistence
- **WHEN** browser is refreshed during active consultation
- **THEN** system detects IN_PROGRESS queue entry and resumes consultation workspace (90-minute timeout)
