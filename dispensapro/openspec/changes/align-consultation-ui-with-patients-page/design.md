## Context

The Patients page (`/patients`) already defines the application’s standard page pattern: a `PageHeader`, `SectionCard`-wrapped content, `DataTable` for lists, and consistent MUI theme tokens. The Doctor Consultation workspace (`/consults`) currently uses a mix of direct `Typography` headings, `Accordion`, and direct `Paper` wrappers that make the module feel visually separate.

This change is purely presentational. No API contracts or business logic change.

## Goals / Non-Goals

**Goals:**
- Make the Consultation workspace look and feel like the Patients page.
- Reuse existing shared components: `PageHeader`, `SectionCard`, `DataTable`, `StatusChip`, `PatientIdentityCell`.
- Preserve the existing active-patient banner as a recognizable focal point.
- Keep the Past Visits inline notes rendering intact.

**Non-Goals:**
- No backend changes.
- No new routes or navigation changes.
- No changes to the queue initiation/completion logic.
- No mobile-specific redesign beyond existing responsive behavior.

## Decisions

1. **Use `PageHeader` for the top title**
   - Rationale: Patients page uses it; gives consistent title/subtitle/CTA layout.
   - Consults page currently has no top-right action, so the action slot can be omitted.

2. **Keep `ActivePatientHeader` as a colored banner**
   - Rationale: It is a strong, module-specific anchor. We will keep it but optionally integrate `PatientIdentityCell` for the avatar/name treatment.

3. **Convert Past Visits from `Accordion` to `DataTable` inside `SectionCard`**
   - Rationale: Aligns with the Patients list pattern; uses existing `DataTable`, `StatusChip`, and column headers.
   - Trade-off: A long visit list will take more vertical space, but the existing "Show More" behavior can be kept by limiting rows and using pagination/expand controls later if needed.

4. **Move section titles out of child components into `SectionCard` `title` prop**
   - Rationale: `PrescriptionBuilder` and `BillingSection` currently define their own headings, causing duplication and inconsistent spacing when wrapped by `SectionCard`.

5. **Remove direct `Paper` wrapper from `BillingSection`**
   - Rationale: `ConsultsPage` already wraps each section in `SectionCard`; nested card/border creates visual noise.

6. **Use theme tokens directly; avoid hard-coded colors**
   - Rationale: Ensures consistency with `theme.tsx` and future theme updates.

## Risks / Trade-offs

- **[Risk] `DataTable` does not support accordion-style collapse for visits.**
  - Mitigation: Past visits are sorted latest-first and can be limited to the most recent N visits. If the list is long, a follow-up change can add pagination.
- **[Risk] Inline notes in the Past Visits cell may make rows tall.**
  - Mitigation: This is already accepted behavior per `visit-notes-in-list-api-6ed8b9.md`; `DataTable` rows grow naturally with cell content.
- **[Risk] ActivePatientHeader’s circular queue chip uses a 50% radius that differs from the theme’s usual chip radius.**
  - Mitigation: Keep it as a deliberate visual accent; it is contained to that component.

## Migration Plan

No migration needed. Change is frontend-only and backward-compatible.

## Enhanced UI Design Decisions

### Blue Header Bar Enhancement
- **ActivePatientHeader redesign**: Improve visual hierarchy with better spacing, typography, and prominent blue styling
- **Queue chip optimization**: Enhanced positioning and styling for better visual prominence
- **Layout improvements**: Better use of horizontal space and responsive design

### Clinical Notes UX
- **Character limit validation**: 2000 character maximum with real-time character count display
- **Visual feedback**: Color-coded indicators when approaching or exceeding limits
- **Enhanced placeholder**: More descriptive placeholder text guidance

### Completion Modal Redesign
- **Success icon**: Large checkmark or success indicator
- **Patient details display**: Show patient name and queue number prominently
- **Prescription status**: Clear confirmation that prescription was sent to pharmacist
- **Professional styling**: Consistent with overall design language

### Button Styling System
- **Primary actions**: Green styling for "Complete Consultation" with proper iconography
- **Secondary actions**: Consistent styling for "Recalculate", "Start Consulting"
- **Visual hierarchy**: Clear distinction between action types and importance levels

## Open Questions

- Should the idle-state queue card also adopt `PageHeader` or remain centered card-only?
- Should Past Visits keep a default expanded/collapsed state once moved out of the `Accordion`? no
- What specific shade of blue should be used for the enhanced header styling?
