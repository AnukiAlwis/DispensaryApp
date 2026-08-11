## Purpose

Enables filtering of medicine inventory by stock status to improve visibility for prescribing and inventory management workflows.

## ADDED Requirements

### Requirement: Stock status enum values
The system SHALL define four stock status values with specific meanings:
- ALL: View all medicines
- REORDER_NEEDED: Quantity is less than or equal to reorder level
- UNAVAILABLE: Quantity equals zero
- IN_STOCK: Quantity is greater than reorder level

#### Scenario: Stock status classification
- **WHEN** a medicine has quantity 0
- **THEN** its status is UNAVAILABLE

#### Scenario: Stock at reorder level
- **WHEN** a medicine has quantity equal to its reorder level
- **THEN** its status is REORDER_NEEDED

#### Scenario: Stock below reorder level
- **WHEN** a medicine has quantity less than its reorder level
- **THEN** its status is REORDER_NEEDED

#### Scenario: Stock above reorder level
- **WHEN** a medicine has quantity greater than its reorder level
- **THEN** its status is IN_STOCK

### Requirement: Stock status filtering via API
The system SHALL support filtering medicines by stock status through the GET /medicines endpoint using a comma-separated stockStatus query parameter.

#### Scenario: Filter by single status
- **WHEN** client requests GET /medicines?stockStatus=IN_STOCK
- **THEN** system returns only medicines with IN_STOCK status

#### Scenario: Filter by multiple statuses
- **WHEN** client requests GET /medicines?stockStatus=IN_STOCK,REORDER_NEEDED
- **THEN** system returns medicines matching either IN_STOCK or REORDER_NEEDED status

#### Scenario: Default behavior (no filter)
- **WHEN** client requests GET /medicines without stockStatus parameter
- **THEN** system returns all medicines (ALL status)

#### Scenario: Invalid status value
- **WHEN** client requests GET /medicines?stockStatus=INVALID_VALUE
- **THEN** system returns 400 Bad Request error

### Requirement: Active medicines only
The system SHALL always exclude medicines with isActive=false from all medicine listing responses, regardless of stock status filter.

#### Scenario: Filter with inactive medicines
- **WHEN** a medicine has isActive=false and matches stock status filter
- **THEN** it is excluded from the response

#### Scenario: All medicines filter with inactive medicines
- **WHEN** client requests all medicines and some have isActive=false
- **THEN** only active medicines are returned

### Requirement: Consultation page default filter
The system SHALL use IN_STOCK,REORDER_NEEDED as the default filter for medicine autocomplete in the consultation page.

#### Scenario: Consultation medicine selection
- **WHEN** doctor searches for medicines during consultation
- **THEN** only medicines with IN_STOCK or REORDER_NEEDED status are displayed
- **AND** medicines with UNAVAILABLE status are not displayed

### Requirement: Pharmacy management multi-select filter
The system SHALL provide a multi-select filter dropdown in the medicine management page that allows selecting one or more stock statuses.

#### Scenario: Default filter selection
- **WHEN** pharmacist opens medicine management page
- **THEN** all three statuses (IN_STOCK, REORDER_NEEDED, UNAVAILABLE) are selected by default

#### Scenario: Custom filter selection
- **WHEN** pharmacist selects only IN_STOCK and REORDER_NEEDED
- **THEN** medicines list shows only those matching selected statuses

#### Scenario: Prevent deselecting all filters
- **WHEN** pharmacist attempts to deselect the last remaining status option
- **THEN** system prevents the deselection and keeps at least one status selected
