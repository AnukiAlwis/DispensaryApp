## ADDED Requirements

### Requirement: Display pre-calculation state
The system SHALL show guidance text before bill calculation is performed.

#### Scenario: Initial billing section state
- **WHEN** consultation workspace loads or prescription items are modified
- **THEN** system displays text "Please add prescription items and click 'Confirm Prescription & Calculate Bill' to review billing & discounts section"

#### Scenario: Calculate button enabled
- **WHEN** at least one prescription item is confirmed
- **THEN** system enables the "Confirm Prescription & Calculate Bill" button

#### Scenario: Calculate button disabled
- **WHEN** no prescription items are confirmed
- **THEN** system disables the "Confirm Prescription & Calculate Bill" button

### Requirement: Calculate bill totals
The system SHALL calculate bill totals including doctor fees and medicine costs when requested.

#### Scenario: Successful bill calculation
- **WHEN** doctor clicks "Confirm Prescription & Calculate Bill" button
- **THEN** system calls `POST /bills/{billId}/calculate` and displays the billing matrix

#### Scenario: Calculation response
- **WHEN** calculate API returns successfully
- **THEN** system extracts doctorFee, medicineTotal from response and displays in billing section

#### Scenario: Calculation failure
- **WHEN** calculate API call fails
- **THEN** system displays error via snackbar and keeps pre-calculation state visible

### Requirement: Display billing matrix
The system SHALL display doctor fees, medicine costs, discounts, and total in post-calculation state.

#### Scenario: Billing fields display
- **WHEN** billing matrix is shown
- **THEN** system displays: Doctor Fee (read-only), Doctor Discount % (0-100 input), Medicine Cost (read-only), Pharmacy Discount % (0-100 input), Total Bill Amount LKR (read-only calculated)

#### Scenario: Doctor fee source
- **WHEN** billing matrix is displayed
- **THEN** system shows doctorFee value from the bill calculation response

#### Scenario: Medicine cost source
- **WHEN** billing matrix is displayed
- **THEN** system shows medicineTotal value from the bill calculation response

### Requirement: Apply discount percentages
The system SHALL allow doctors to enter discount percentages for doctor fees and pharmacy items.

#### Scenario: Doctor discount input
- **WHEN** doctor enters a value in Doctor Discount % field
- **THEN** system validates range 0-100 and recalculates total locally

#### Scenario: Pharmacy discount input
- **WHEN** doctor enters a value in Pharmacy Discount % field
- **THEN** system validates range 0-100 and recalculates total locally

#### Scenario: Invalid discount value
- **WHEN** doctor enters value < 0 or > 100
- **THEN** system shows validation error and prevents value entry

### Requirement: Calculate total with discounts
The system SHALL calculate the final bill total using discount percentages.

#### Scenario: Total calculation formula
- **WHEN** discounts are applied
- **THEN** system calculates: Total = (DoctorFee × (1 - DoctorDiscount%/100)) + (MedicineCost × (1 - PharmacyDiscount%/100))

#### Scenario: Live recalculation
- **WHEN** doctor changes any discount percentage
- **THEN** system immediately recalculates and updates the Total Bill Amount field

#### Scenario: Decimal precision
- **WHEN** total is calculated
- **THEN** system rounds to 2 decimal places (e.g., 1950.00)

#### Scenario: Zero discounts
- **WHEN** both discount percentages are 0
- **THEN** system calculates total as DoctorFee + MedicineCost

### Requirement: Lock calculate button after use
The system SHALL disable the calculate button after successful calculation.

#### Scenario: Button disabled after calculation
- **WHEN** bill calculation completes successfully
- **THEN** system disables the "Confirm Prescription & Calculate Bill" button

#### Scenario: Button re-enabled on prescription change
- **WHEN** doctor adds, edits, or deletes a prescription item
- **THEN** system re-enables the calculate button and hides billing matrix

### Requirement: Persist discount values
The system SHALL save discount percentages to the backend during finalization.

#### Scenario: Save discounts
- **WHEN** finalization cascade executes
- **THEN** system calls `PUT /bills/{billId}/discounts` with doctorDiscountPct and pharmacyDiscountPct values

#### Scenario: Discount save failure
- **WHEN** discount save API call fails during finalization
- **THEN** system displays error indicating "Failed at step 2: Save discounts" and provides retry option
