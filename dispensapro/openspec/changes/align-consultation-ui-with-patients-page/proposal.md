## Why

The Doctor Consultation workspace currently uses an ad-hoc layout and component mix that diverges from the polished, consistent patterns established on the Patients page. Aligning the consultation module with those patterns will make the app feel cohesive, reduce cognitive load for users, and reuse existing shared components instead of introducing one-off styles.

## What Changes

- Replace the inline `Typography h4` page title in `ConsultsPage.tsx` with the shared `PageHeader` component, including a descriptive subtitle.
- Wrap the active consultation sections uniformly in `SectionCard` and remove duplicate inner headings from child components.
- Refactor `PastVisitsAccordion` to render past visits as a `DataTable` consistent with the Patients page table style, including the inline notes rendering already being introduced.
- Apply `StatusChip` to visit status values in the Past Visits table.
- Optionally use `PatientIdentityCell` inside `ActivePatientHeader` to give the active patient the same avatar + identity treatment used elsewhere.
- Remove the direct `Paper` wrapper in `BillingSection` so it relies on `SectionCard` from the parent page.
- Capture before/after Playwright screenshots to verify visual alignment.

## Capabilities

### New Capabilities

None. This is a UI/UX alignment change that does not introduce new business capabilities.

### Modified Capabilities

None. No functional requirements or API contracts are changing.

## Impact

- **Affected files:**
  - `dispensapro/src/features/consults/pages/ConsultsPage.tsx`
  - `dispensapro/src/features/consults/components/PastVisitsAccordion.tsx`
  - `dispensapro/src/features/consults/components/PrescriptionBuilder.tsx`
  - `dispensapro/src/features/consults/components/BillingSection.tsx`
  - `dispensapro/src/features/consults/components/ActivePatientHeader.tsx`
- **Dependencies:** No backend changes required.
- **Risk:** Low; purely presentational. The Past Visits notes rendering should be preserved.
