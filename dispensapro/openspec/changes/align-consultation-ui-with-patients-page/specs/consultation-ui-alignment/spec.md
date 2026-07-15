## ADDED Requirements

### Requirement: Consultation page uses shared page header

The Consultation page SHALL use the shared `PageHeader` component for its top title and subtitle, consistent with the Patients page.

#### Scenario: Doctor opens Consultation page

- **WHEN** the doctor navigates to `/consults`
- **THEN** the page displays a `PageHeader` with the title "Doctor Consultation Workspace" and a descriptive subtitle

### Requirement: Active consultation sections use shared SectionCard

Each active-consultation section (Past Visits, Clinical Notes, Prescription Builder, Billing & Discounts) SHALL be wrapped in the shared `SectionCard` component, with the section title provided via the `SectionCard` `title` prop.

#### Scenario: Doctor starts a consultation

- **WHEN** the doctor starts a consultation
- **THEN** each section renders as a `SectionCard` with a consistent title, border radius, shadow, and padding
- **AND** no child component renders its own duplicate section heading

### Requirement: Past Visits renders as a DataTable

The Past Visits section SHALL render visits using the shared `DataTable` component, with columns for visit date/time, status, and notes, using the same table styling as the Patients page.

#### Scenario: Doctor views past visits

- **WHEN** the doctor views the Past Visits section
- **THEN** visits are listed in a `DataTable` with uppercase column headers and hover-highlighted rows
- **AND** the visit status is rendered with the shared `StatusChip` component
- **AND** notes are rendered inline inside the Notes cell, sorted latest first

### Requirement: Billing section styling matches other sections

The Billing & Discounts section SHALL not use its own `Paper` wrapper; it SHALL rely on the parent `SectionCard` for its container styling.

#### Scenario: Doctor views billing section

- **WHEN** the doctor expands the Billing & Discounts section
- **THEN** it shares the same card border, radius, and shadow as the other sections
- **AND** it does not render a nested outlined paper inside the section card
