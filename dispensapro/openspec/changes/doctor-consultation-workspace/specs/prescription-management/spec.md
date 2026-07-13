## ADDED Requirements

### Requirement: Search medicines
The system SHALL provide an autocomplete search field to find medicines by name.

#### Scenario: Medicine autocomplete
- **WHEN** doctor types in the medicine search field
- **THEN** system filters medicines client-side from `GET /medicines` response showing name and strength

#### Scenario: Select medicine
- **WHEN** doctor selects a medicine from autocomplete
- **THEN** system creates a new draft prescription item row below the search field with medicine name and strength pre-filled

#### Scenario: Clear search after selection
- **WHEN** medicine is selected
- **THEN** system clears the autocomplete search field for next medicine entry

### Requirement: Add prescription item
The system SHALL allow doctors to add prescription items with dosage, frequency, duration, and quantity.

#### Scenario: Draft item row
- **WHEN** medicine is selected from autocomplete
- **THEN** system displays a row with fields: Medicine Name (read-only), Dosage (input), Frequency (creatable combobox), Duration Days (numeric input), Qty Prescribed (auto-calculated, read-only)

#### Scenario: Frequency options
- **WHEN** doctor clicks frequency combobox
- **THEN** system shows default options: "After meals", "Before meals", "Twice daily", "At bedtime", "Every 6 hours" and allows custom text entry

#### Scenario: Quantity auto-calculation
- **WHEN** doctor enters dosage "2 tablets", frequency "Twice daily", duration "7" days
- **THEN** system calculates quantity as 2 × 2 × 7 = 28 and displays in Qty Prescribed field

#### Scenario: Frequency parsing for calculation
- **WHEN** frequency is "After meals" or "Before meals"
- **THEN** system assumes 3 times per day for quantity calculation

#### Scenario: Frequency parsing for twice daily
- **WHEN** frequency is "Twice daily"
- **THEN** system assumes 2 times per day for quantity calculation

#### Scenario: Frequency parsing for custom text
- **WHEN** frequency is custom text without numeric indicator
- **THEN** system defaults to 1 time per day for quantity calculation

### Requirement: Validate stock availability
The system SHALL validate that prescribed quantity does not exceed available stock.

#### Scenario: Sufficient stock
- **WHEN** prescribed quantity is less than or equal to medicine.quantity
- **THEN** system shows no warning and enables Confirm button

#### Scenario: Insufficient stock
- **WHEN** prescribed quantity exceeds medicine.quantity
- **THEN** system displays red warning "Stock unavailable. Current Available qty: [X]" and disables Confirm button

#### Scenario: Stock warning persistence
- **WHEN** stock warning is displayed
- **THEN** warning remains visible until dosage/frequency/duration is adjusted to reduce quantity below available stock

### Requirement: Confirm prescription item
The system SHALL save prescription items to the backend when confirmed.

#### Scenario: Successful item confirmation
- **WHEN** doctor clicks Confirm button (checkmark icon)
- **THEN** system calls `POST /prescriptions/{id}/items` with medicineId, dosage, frequency, duration, instructions (frequency text), quantity

#### Scenario: Item confirmation response
- **WHEN** item is successfully saved
- **THEN** system marks the row as "committed" (disables inputs, shows Edit/Delete buttons) and resets billing section to pre-calculation state

#### Scenario: Confirmation failure
- **WHEN** item save API call fails
- **THEN** system displays error via snackbar and keeps row in draft state for retry

### Requirement: Edit prescription item
The system SHALL allow editing of committed prescription items (when backend API is available).

#### Scenario: Edit button disabled
- **WHEN** Edit button (pencil icon) is clicked
- **THEN** system shows tooltip "Coming Soon - Edit functionality pending backend API" and does not enable editing

#### Scenario: Future edit behavior
- **WHEN** backend edit API is available
- **THEN** system will re-enable input fields, allow modifications, and call `PUT /prescriptions/{id}/items/{itemId}` on confirm

### Requirement: Delete prescription item
The system SHALL allow deletion of committed prescription items (when backend API is available).

#### Scenario: Delete button disabled
- **WHEN** Delete button (trashcan icon) is clicked
- **THEN** system shows tooltip "Coming Soon - Delete functionality pending backend API" and does not delete the item

#### Scenario: Future delete behavior
- **WHEN** backend delete API is available
- **THEN** system will show confirmation dialog and call `DELETE /prescriptions/{id}/items/{itemId}` on confirm

### Requirement: Reset billing on prescription changes
The system SHALL reset the billing section when prescription items are added, edited, or deleted.

#### Scenario: Billing reset on item add
- **WHEN** doctor confirms a new prescription item
- **THEN** system hides the billing calculation results and re-enables the "Confirm Prescription & Calculate Bill" button

#### Scenario: Billing reset on item edit
- **WHEN** doctor edits an existing prescription item (future)
- **THEN** system hides billing results and re-enables calculate button

#### Scenario: Billing reset on item delete
- **WHEN** doctor deletes a prescription item (future)
- **THEN** system hides billing results and re-enables calculate button

### Requirement: Display prescription items
The system SHALL display all prescription items in a list format.

#### Scenario: Item row display
- **WHEN** prescription items exist
- **THEN** system displays each item as a row showing: Medicine Name & Strength, Dosage, Frequency, Duration, Qty Prescribed, action buttons

#### Scenario: Draft vs committed state
- **WHEN** item is in draft state
- **THEN** system shows editable fields and Confirm button only

#### Scenario: Committed item state
- **WHEN** item is confirmed
- **THEN** system shows read-only fields with Edit and Delete buttons (disabled with tooltips)
