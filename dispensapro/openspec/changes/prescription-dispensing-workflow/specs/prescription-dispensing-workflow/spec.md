## ADDED Requirements

### Requirement: Current Serving Prescription Display
The system SHALL display a highlighted "Currently Serving" card showing the oldest prescription that belongs to today, has status ISSUED, and has not yet been dispensed.

#### Scenario: Display current serving prescription
- **WHEN** pharmacist navigates to the Prescription Dispensing page
- **THEN** system displays a highlighted card with patient name, phone number, doctor, issued date & time, and waiting time
- **AND** the card shows the oldest ISSUED prescription from today that has not been dispensed

#### Scenario: No current serving prescription
- **WHEN** there are no ISSUED prescriptions for today
- **THEN** the Currently Serving card displays an empty state or appropriate message

### Requirement: Up Next Prescriptions Table
The system SHALL display a table showing all prescriptions waiting to be dispensed with columns for patient name, phone number, doctor, issued date & time, and actions.

#### Scenario: Display up next prescriptions
- **WHEN** pharmacist navigates to the Prescription Dispensing page
- **THEN** system displays a table with all ISSUED prescriptions from today that have not been dispensed
- **AND** each row includes View Prescription and Dispense Now actions

### Requirement: Start Preparing Action
The system SHALL display a "Start Preparing" button when no preparation has been started for the Current Serving prescription.

#### Scenario: Display start preparing button
- **WHEN** no preparation has been started for the Current Serving prescription
- **THEN** the action button displays "💊 Start Preparing"
- **AND** selecting it opens the Medicine Preparation modal

### Requirement: Continue Dispense Action
The system SHALL display a "Continue Dispense" button when preparation was started but not completed, allowing the pharmacist to resume from the exact point where they left.

#### Scenario: Display continue dispense button
- **WHEN** preparation was started but not completed for the Current Serving prescription
- **THEN** the action button displays "Continue Dispense"
- **AND** selecting it opens the Medicine Preparation modal with preserved progress

### Requirement: View Prescription Read-Only
The system SHALL allow pharmacists to view prescription details in a read-only popup without allowing editing, dispensing, or billing.

#### Scenario: View prescription details
- **WHEN** pharmacist selects "View Prescription" from the Up Next table
- **THEN** system opens a read-only popup with prescription details
- **AND** no editing, dispensing, or billing actions are available

### Requirement: Dispense Now Manual Selection
The system SHALL allow pharmacists to manually choose a prescription by selecting "Dispense Now" before preparation has started.

#### Scenario: Manual patient selection
- **WHEN** pharmacist selects "Dispense Now" for a prescription in the Up Next table
- **AND** no active dispensing session exists
- **THEN** that prescription becomes the Current Serving prescription
- **AND** the previous Current Serving prescription moves to the Up Next table

### Requirement: Automatic Next Patient Loading
The system SHALL automatically load the next oldest waiting prescription into the Currently Serving card after completing the dispensing workflow.

#### Scenario: Auto-load next patient
- **WHEN** pharmacist completes the dispensing workflow by selecting DONE
- **THEN** system clears the current preparation state
- **AND** the next oldest ISSUED prescription automatically becomes the new Current Serving prescription
- **AND** all Dispense Now buttons become enabled

### Requirement: Medicine Preparation Modal
The system SHALL provide a Medicine Preparation modal with a table showing medicines sorted by frequency (highest to lowest) then quantity (highest to lowest).

#### Scenario: Open medicine preparation modal
- **WHEN** pharmacist selects "Start Preparing" or "Continue Dispense"
- **THEN** system opens the Medicine Preparation modal
- **AND** medicines are displayed sorted by frequency (3x/day, 2x/day, 1x/day) then quantity (highest to lowest)

### Requirement: Preparation Status Cycling
The system SHALL allow pharmacists to cycle through preparation statuses (NOT_STARTED → STARTED → READY_TO_DISPENSE → NOT_STARTED) by clicking the status button for each medicine.

#### Scenario: Cycle preparation status
- **WHEN** pharmacist clicks the status button for a medicine
- **THEN** the status cycles to the next state in the sequence
- **AND** button color changes: Grey (NOT_STARTED), Yellow/Orange (STARTED), Green (READY_TO_DISPENSE)

### Requirement: Dispense Button Enablement
The system SHALL enable the DISPENSE button only when every medicine item has reached the READY_TO_DISPENSE status.

#### Scenario: Enable dispense button
- **WHEN** all medicines have status READY_TO_DISPENSE
- **THEN** the DISPENSE button becomes enabled
- **AND** selecting it navigates to the Billing section

#### Scenario: Disable dispense button
- **WHEN** any medicine is not in READY_TO_DISPENSE status
- **THEN** the DISPENSE button remains disabled

### Requirement: Billing Modal Sections
The system SHALL display a Billing modal with three sections: Patient Details, Printable Bill, and Receive Payment.

#### Scenario: Display billing modal
- **WHEN** pharmacist selects DISPENSE from the Medicine Preparation modal
- **THEN** system opens the Billing modal
- **AND** displays Patient Details (patient info, visit info, doctor notes)
- **AND** displays Printable Bill (medicines, prices, totals)
- **AND** displays Receive Payment (total due, amount received, calculated change)

### Requirement: Payment Calculation
The system SHALL automatically calculate the change as Amount Received minus Grand Total.

#### Scenario: Calculate payment change
- **WHEN** pharmacist enters Amount Received
- **THEN** system automatically calculates Change = Amount Received - Grand Total
- **AND** displays the calculated change value

### Requirement: Billing Modal Footer Actions
The system SHALL provide BACK, PRINT, and DONE buttons in the Billing modal footer.

#### Scenario: Back to preparation
- **WHEN** pharmacist selects BACK
- **THEN** system returns to the Medicine Preparation modal

#### Scenario: Print bill
- **WHEN** pharmacist selects PRINT
- **THEN** system prints the bill/receipt

#### Scenario: Complete dispensing workflow
- **WHEN** pharmacist selects DONE
- **THEN** system closes the billing modal
- **AND** clears the frontend preparation state
- **AND** completes the dispensing workflow
- **AND** enables all Dispense Now buttons
- **AND** automatically loads the next waiting prescription into Current Serving

### Requirement: Stock Validation
The system SHALL block dispensing if insufficient medicine quantity is available and display an error message.

#### Scenario: Insufficient stock error
- **WHEN** pharmacist attempts to dispense a medicine with insufficient quantity
- **THEN** system blocks the dispensing action
- **AND** displays error message showing available quantity and required quantity
