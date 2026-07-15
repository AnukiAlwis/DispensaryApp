## ADDED Requirements

### Requirement: Patient Details Display
The system SHALL display patient information, visit information, and doctor notes in the Billing modal.

#### Scenario: Display patient details
- **WHEN** Billing modal opens
- **THEN** system displays patient information (name, phone, etc.)
- **AND** displays visit information (date, doctor, etc.)
- **AND** displays doctor notes as read-only

### Requirement: Printable Bill Layout
The system SHALL display a printable bill layout with medicine name, strength, dose, frequency, and price for each medicine, plus doctor fee, medicine total, discount, and grand total.

#### Scenario: Display bill layout
- **WHEN** Billing modal opens
- **THEN** system displays a bill-like layout
- **AND** each medicine row shows: medicine name, strength, dose, frequency, price
- **AND** bill footer shows: doctor fee, medicine total, discount, grand total

### Requirement: Payment Input
The system SHALL provide an editable Amount Received field and automatically calculate the change.

#### Scenario: Calculate change
- **WHEN** pharmacist enters Amount Received
- **THEN** system automatically calculates Change = Amount Received - Grand Total
- **AND** displays the calculated change

### Requirement: Payment Confirmation
The system SHALL provide a Confirm Payment button to complete the payment process.

#### Scenario: Confirm payment
- **WHEN** pharmacist enters Amount Received and selects Confirm Payment
- **THEN** system validates the payment
- **AND** enables the DONE button for workflow completion

### Requirement: Print Functionality
The system SHALL provide a PRINT button to print the bill/receipt.

#### Scenario: Print bill
- **WHEN** pharmacist selects PRINT
- **THEN** system prints the current bill/receipt

### Requirement: Done Action
The system SHALL provide a DONE button that completes the dispensing workflow, closes the modal, clears preparation state, and loads the next patient.

#### Scenario: Complete workflow
- **WHEN** pharmacist selects DONE after confirming payment
- **THEN** system closes the billing modal
- **AND** clears the frontend preparation state
- **AND** completes the dispensing workflow
- **AND** enables all Dispense Now buttons
- **AND** automatically loads the next waiting prescription into Current Serving
