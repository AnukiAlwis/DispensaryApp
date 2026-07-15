## 1. Page header alignment

- [x] 1.1 Replace the inline `Typography variant="h4"` title in `ConsultsPage.tsx` with the shared `PageHeader` component.
- [x] 1.2 Add a subtitle to `PageHeader` that describes the workspace.
- [x] 1.3 Remove the `maxWidth` constraint on the `ConsultsPage` root `Box` if it conflicts with `PageHeader` full-width behavior.

## 2. Section container alignment

- [x] 2.1 Ensure every active-consultation section is wrapped in `SectionCard` with the title passed via the `title` prop.
- [x] 2.2 Remove the duplicate `Typography` heading inside `PrescriptionBuilder.tsx`.
- [x] 2.3 Remove the direct `Paper` wrapper and heading inside `BillingSection.tsx` so it is styled by the parent `SectionCard`.

## 3. Past Visits DataTable conversion

- [x] 3.1 Refactor `PastVisitsAccordion.tsx` to render visits using the shared `DataTable` component.
- [x] 3.2 Define columns: Visit Date/Time, Status, Notes.
- [x] 3.3 Render status values using the shared `StatusChip` component.
- [x] 3.4 Preserve inline notes rendering in the Notes cell (author username, role, note text, latest-first).
- [x] 3.5 Keep the "Show More" behavior or equivalent row limit.

## 4. Active patient header polish

- [x] 4.1 Optionally integrate `PatientIdentityCell` into `ActivePatientHeader.tsx` for the avatar + name treatment.
- [x] 4.2 Keep the colored banner and queue chip as the module-specific focal point.

## 5. Enhanced blue header styling

- [x] 5.1 Redesign `ActivePatientHeader` layout to match the reference image with improved visual hierarchy.
- [x] 5.2 Enhance the blue header bar with better spacing, typography, and visual prominence.
- [x] 5.3 Optimize the queue chip styling and positioning within the header.

## 6. Clinical notes UX improvements

- [x] 6.1 Add 2000 character limit validation to `ClinicalNotesSection.tsx`.
- [x] 6.2 Display character count indicator showing current/maximum characters.
- [x] 6.3 Add visual feedback when approaching or exceeding character limit.

## 7. Consultation completion modal redesign

- [x] 7.1 Redesign `CompletionModal.tsx` with success icon and improved visual design.
- [x] 7.2 Display patient details (name, queue number) in the completion modal.
- [x] 7.3 Add prescription status confirmation and professional styling.

## 8. Button styling consistency

- [x] 8.1 Standardize primary action button styling (green "Complete Consultation").
- [x] 8.2 Enhance secondary button styling ("Recalculate", "Start Consulting").
- [x] 8.3 Ensure consistent icon usage and visual hierarchy across all buttons.

