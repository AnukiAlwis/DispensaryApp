## Context

The DispensaPro frontend follows a feature-based vertical slice architecture with React 19, TypeScript, MUI v7, Redux Toolkit, and React Router v7. The consultation workspace is a new feature that integrates with existing backend APIs for queue management, visits, prescriptions, billing, and medicines.

**Current State:**
- Placeholder ConsultsPage exists at `/consults` route with minimal content
- Backend APIs are fully implemented and documented
- Shared components (SectionCard, DataTable, DialogModal, etc.) are available
- Pattern established: Page → Hook → Service → apiClient

**Constraints:**
- Must follow existing architecture patterns (no new patterns)
- Backend edit/delete prescription item APIs not yet available (disable UI with tooltips)
- Medicine search endpoint (`GET /medicines?search=`) not available (client-side filtering)
- Must handle multi-step API cascades with proper error recovery
- 90-minute session timeout requirement for interrupted consultations

**Stakeholders:**
- Doctors (primary users)
- Patients (indirect - faster consultations)
- Pharmacists (receive prescriptions)
- Development team (maintainability)

## Goals / Non-Goals

**Goals:**
- Implement complete consultation workflow in a single unified interface
- Enable doctors to complete consultations 40-60% faster
- Provide real-time stock validation to prevent prescription errors
- Support session resumption after browser refresh/crash
- Follow established frontend architecture patterns exactly
- Reuse existing shared components wherever possible
- Handle multi-step API cascades with clear error messages

**Non-Goals:**
- Implementing backend edit/delete prescription APIs (future work)
- Implementing medicine search backend endpoint (future optimization)
- Adding new state management patterns (use existing local state + hooks)
- Supporting offline mode or local prescription drafts
- Implementing prescription templates or favorites
- Adding prescription history comparison features
- Supporting multi-doctor concurrent consultations on same patient

## Decisions

### Decision 1: Feature-Based Folder Structure

**Choice:** Use `src/features/consults/` with standard 5-part structure (components, hooks, pages, services, types.ts)

**Rationale:**
- Matches existing patterns in `features/visits/`, `features/patients/`, `features/pharmacy/`
- Keeps all consultation-related code co-located
- Easy to navigate and maintain
- Follows established architecture rules

**Alternatives Considered:**
- ❌ Flat structure in `src/components/` - violates architecture, hard to maintain
- ❌ Separate `src/consultation/` top-level folder - inconsistent with existing features

### Decision 2: Component Breakdown

**Choice:** Create 8 focused components:
- `IdleQueueCard.tsx` - Next patient display
- `ActivePatientHeader.tsx` - Patient info banner
- `PastVisitsAccordion.tsx` - Collapsible visit history
- `ClinicalNotesSection.tsx` - Notes textarea
- `PrescriptionBuilder.tsx` - Container for medicine search + items
- `MedicineAutocomplete.tsx` - Medicine search field
- `PrescriptionItemRow.tsx` - Individual prescription line
- `BillingSection.tsx` - Billing calculations
- `CompletionModal.tsx` - Success modal

**Rationale:**
- Each component has single responsibility
- Reusable components (PrescriptionItemRow for multiple items)
- Testable in isolation
- Matches granularity of existing components (e.g., `CreateVisitForm`, `VisitSummaryCard`)

**Alternatives Considered:**
- ❌ Monolithic ConsultsPage with all logic - too complex, hard to test
- ❌ Fewer components (e.g., combine Prescription + Billing) - violates SRP

### Decision 3: State Management Strategy

**Choice:** Local component state + custom hooks, NO Redux

**Rationale:**
- Consultation state is page-scoped, not cross-feature
- Existing pattern: Redux only for global state (logged-in user)
- Simpler to reason about and debug
- Matches `useVisit`, `usePatients`, `useQueue` patterns

**State Distribution:**
- `ConsultsPage`: orchestration state (currentStep, loading, error)
- `useConsultation`: main workflow hook (initiation/finalization cascades)
- `usePrescription`: prescription CRUD operations
- `useBilling`: billing calculations
- `useQueue`: queue operations (already exists, may enhance)

**Alternatives Considered:**
- ❌ Redux for consultation state - overkill, violates architecture
- ❌ Context API - unnecessary complexity for page-scoped state

### Decision 4: Medicine Search Implementation

**Choice:** Client-side filtering with `GET /medicines` (fetch all, filter locally)

**Rationale:**
- Backend search endpoint not available
- Medicine count < 5000 (acceptable for client-side filtering)
- MUI Autocomplete handles filtering efficiently
- Can swap to backend search later without UI changes

**Implementation:**
```tsx
const { medicines, loading } = useMedicines(); // fetches all on mount
<Autocomplete
  options={medicines}
  filterOptions={(options, { inputValue }) => 
    options.filter(m => m.name.toLowerCase().includes(inputValue.toLowerCase()))
  }
/>
```

**Alternatives Considered:**
- ❌ Wait for backend search - blocks feature delivery
- ❌ Debounced API calls to non-existent endpoint - will fail

**Future Migration:** When backend adds `GET /medicines?search=`, update `medicineService.getAll()` to accept search param and call API. No UI changes needed.

### Decision 5: Quantity Auto-Calculation Logic

**Choice:** Parse frequency text to infer times-per-day multiplier

**Mapping:**
- "After meals(3x/day)" / "Before meals(3x/day)" → 3x/day
- "Twice daily" → 2x/day
- "At bedtime" / custom text → 1x/day (default)

**Formula:** `qty = dosageUnits × timesPerDay × durationDays`

**Rationale:**
- Spec requires auto-calculation but frequency is free text
- Common medical terms have standard interpretations
- Default to 1x/day for safety (under-prescribe vs over-prescribe)
- Doctor can see calculated qty and adjust dosage/frequency if wrong

**Implementation:**
```tsx
const parseFrequency = (freq: string): number => {
  const lower = freq.toLowerCase();
  if (lower.includes('after meals') || lower.includes('before meals')) return 3;
  if (lower.includes('twice daily') || lower.includes('2 times')) return 2;
  return 1; // default
};

const calculateQty = (dosage: string, frequency: string, duration: number) => {
  const units = parseInt(dosage.match(/\d+/)?.[0] || '1');
  const timesPerDay = parseFrequency(frequency);
  return units * timesPerDay * duration;
};
```

**Alternatives Considered:**
- ❌ Separate numeric "Times per day" field - changes spec, more fields
- ❌ Structured dropdown only - loses flexibility, spec requires free text
- ❌ Manual qty entry - spec requires auto-calculation

### Decision 6: Stock Validation Behavior

**Choice:** Disable Confirm button when qty > available stock, show red warning

**Rationale:**
- Prevents invalid prescriptions from being saved
- Clear visual feedback (red text + disabled button)
- Spec clarification: "do not allow to confirm"

**Implementation:**
```tsx
const isStockSufficient = prescribedQty <= medicine.quantity;
<Button 
  disabled={!isStockSufficient}
  onClick={handleConfirm}
>
  Confirm
</Button>
{!isStockSufficient && (
  <Typography color="error">
    Stock unavailable. Current Available qty: {medicine.quantity}
  </Typography>
)}
```

**Alternatives Considered:**
- ❌ Allow confirmation with warning - violates clarified spec
- ❌ Auto-adjust qty to available stock - removes doctor control

### Decision 7: Edit/Delete Prescription Items

**Choice:** Show Edit/Delete buttons but disable with "Coming Soon" tooltip

**Rationale:**
- Backend APIs not yet available
- Shows intended functionality (better UX than hiding buttons)
- Easy to enable later (remove disabled prop, add onClick handler)
- Consistent with spec: "notice in service layer until the backend is developed"

**Implementation:**
```tsx
<Tooltip title="Coming Soon - Edit functionality pending backend API">
  <span>
    <IconButton disabled>
      <EditIcon />
    </IconButton>
  </span>
</Tooltip>
```

**Alternatives Considered:**
- ❌ Hide buttons completely - confusing UX, looks incomplete
- ❌ Implement with error handling - will fail, bad UX

**Future Migration:** When backend adds endpoints, update `prescriptionService` and remove `disabled` prop.

### Decision 8: Cascade Error Handling

**Choice:** Show step number + step name + backend error, provide Retry button

**Rationale:**
- Helps doctors understand what failed
- Retry from beginning (not from failed step) - simpler, safer
- Matches existing error handling pattern (snackbar via apiClient interceptor)

**Implementation:**
```tsx
const steps = [
  'Starting consultation',
  'Loading patient history', 
  'Creating prescription'
];

try {
  setCascadeStep(1);
  await queueService.start(queueId);
  
  setCascadeStep(2);
  const visits = await visitService.getAllByPatientId(patientId);
  
  setCascadeStep(3);
  const prescription = await prescriptionService.create({ visitId });
  
} catch (error) {
  showSnackbar(`Failed at step ${cascadeStep}: ${steps[cascadeStep - 1]}. ${error.message}`);
  // Show retry button
}
```

**Alternatives Considered:**
- ❌ Resume from failed step - complex state management, risky
- ❌ Silent retry - confusing, may loop indefinitely
- ❌ Generic error message - unhelpful for debugging

### Decision 9: Session Resume Strategy

**Choice:** Check for `IN_PROGRESS` queue entry on page load, auto-resume if < 90min

**Rationale:**
- Backend queue status is source of truth (no localStorage needed)
- 90-minute timeout balances usability vs stale data
- Auto-resume for recent sessions (< 90min) - seamless UX
- Confirmation for old sessions (> 90min) - safety check

**Implementation:**
```tsx
useEffect(() => {
  const checkInterruptedSession = async () => {
    const queue = await queueService.getByDoctorId(doctorId);
    const inProgress = queue.find(q => q.status === 'IN_PROGRESS');
    
    if (inProgress) {
      const duration = Date.now() - new Date(inProgress.inProgressAt).getTime();
      const minutes = duration / 1000 / 60;
      
      if (minutes <= 90) {
        await resumeConsultation(inProgress.id);
      } else {
        showResumeConfirmation(inProgress.id);
      }
    }
  };
  
  checkInterruptedSession();
}, []);
```

**Alternatives Considered:**
- ❌ localStorage for state - can get out of sync with backend
- ❌ Always require confirmation - annoying for quick refreshes
- ❌ No timeout - stale data risk

### Decision 10: Billing Calculation Timing

**Choice:** Live frontend recalculation when discounts change, backend sync during finalization

**Rationale:**
- Instant feedback for doctors (no API call delay)
- Backend recalculation during finalization ensures consistency
- Matches spec: "Multiplies calculation formulas locally on the frontend"

**Implementation:**
```tsx
const calculateTotal = () => {
  const doctorNet = doctorFee * (1 - doctorDiscount / 100);
  const medicineNet = medicineCost * (1 - pharmacyDiscount / 100);
  return (doctorNet + medicineNet).toFixed(2);
};

useEffect(() => {
  setTotal(calculateTotal());
}, [doctorDiscount, pharmacyDiscount, doctorFee, medicineCost]);
```

**Alternatives Considered:**
- ❌ API call on every discount change - slow, unnecessary load
- ❌ Only backend calculation - poor UX, no live feedback

## Risks / Trade-offs

### Risk 1: Client-Side Medicine Filtering Performance
**Risk:** If medicine count exceeds 5000, autocomplete may lag

**Mitigation:** 
- Monitor medicine count in production
- If > 5000, request backend search endpoint
- Implement virtualization for autocomplete dropdown if needed
- Current assumption (< 5000) validated with stakeholders

### Risk 2: Cascade Failures Leave Inconsistent State
**Risk:** If finalization cascade fails at step 3/5, notes and discounts are saved but prescription not locked

**Mitigation:**
- Retry button allows doctor to complete cascade
- Backend should be idempotent (re-running steps 1-2 should not duplicate data)
- Future: Implement backend transaction rollback for cascade failures
- Document manual cleanup procedure for support team

### Risk 3: Quantity Calculation Misinterpretation
**Risk:** Doctor enters "5ml" in dosage, system parses as "5" units, may under-prescribe

**Mitigation:**
- Show calculated quantity prominently (doctor can verify)
- If qty looks wrong, doctor adjusts dosage/frequency/duration
- Future: Add unit detection (ml, tablets, capsules) for smarter parsing
- Training: Educate doctors to verify calculated quantities

### Risk 4: Session Timeout Edge Cases
**Risk:** Doctor resumes at 89 minutes, works for 10 minutes, total 99 minutes - no timeout enforcement during active session

**Mitigation:**
- 90-minute timeout is for resume decision only, not active session limit
- Active sessions can run indefinitely (doctor may need extended time)
- If this becomes an issue, add idle timeout (e.g., 30 min no activity)

### Risk 5: Missing Edit/Delete APIs Block Workflow
**Risk:** Doctor makes mistake in prescription item, cannot fix it, must restart consultation

**Mitigation:**
- Short-term: Doctor can add corrected item, note the error in clinical notes
- Pharmacist can see notes and dispense correct item
- Prioritize backend edit/delete API development
- Add "Cancel Consultation" button to restart if needed

### Risk 6: Concurrent Consultation Attempts
**Risk:** Two doctors try to start consultation with same patient simultaneously

**Mitigation:**
- Backend queue status prevents this (first doctor sets IN_PROGRESS)
- Second doctor's start attempt should fail with 409 Conflict
- Frontend shows error: "Patient already in consultation with another doctor"
- Future: Add queue locking mechanism in backend

### Risk 7: Browser Compatibility
**Risk:** MUI Autocomplete or other components may not work in older browsers

**Mitigation:**
- Target modern browsers (Chrome, Firefox, Edge, Safari latest 2 versions)
- Test on hospital's standard browser configuration
- Polyfills included via Create React App
- Document minimum browser requirements

## Migration Plan

**Phase 1: Foundation (Week 1)**
1. Create folder structure: `features/consults/` with subdirectories
2. Define TypeScript interfaces in `types.ts`
3. Implement service layer: `consultationService`, `prescriptionService`, `billingService`
4. Implement hooks: `useConsultation`, `usePrescription`, `useBilling`
5. Test service/hook layer with mock data

**Phase 2: Core UI (Week 2)**
6. Build `IdleQueueCard` component
7. Build `ActivePatientHeader` component
8. Build `PastVisitsAccordion` component
9. Build `ClinicalNotesSection` component
10. Build `MedicineAutocomplete` component
11. Build `PrescriptionItemRow` component
12. Build `PrescriptionBuilder` container
13. Test components in isolation (Storybook or standalone pages)

**Phase 3: Billing & Workflows (Week 3)**
14. Build `BillingSection` component
15. Implement initiation cascade in `useConsultation`
16. Implement finalization cascade in `useConsultation`
17. Build `CompletionModal` component
18. Integrate all components in `ConsultsPage`
19. Test happy path end-to-end

**Phase 4: Polish & Edge Cases (Week 4)**
20. Implement session resume logic
21. Add error handling for all cascade steps
22. Add loading states and progress indicators
23. Add stock validation warnings
24. Test error scenarios (network failures, invalid data)
25. Add keyboard shortcuts (optional: Enter to confirm item, Esc to close modals)
26. Performance testing (medicine autocomplete, cascade speed)
27. User acceptance testing with doctors

**Rollback Strategy:**
- Feature is additive (no existing functionality modified)
- If critical bugs found, hide `/consults` route in `routes.tsx`
- Doctors continue using old workflow (separate screens)
- No data migration needed (backend unchanged)

**Deployment:**
- Deploy frontend build to production
- Monitor error logs for cascade failures
- Collect doctor feedback in first week
- Iterate on UX improvements based on feedback

## Open Questions

1. **Medicine Count Validation:** Need to confirm actual medicine count in production database. If > 5000, need backend search endpoint before launch.

2. **Doctor Fee Source:** Clarify where `doctorFee` comes from in bill calculation response. Is it from visit record, doctor profile, or configurable per consultation?

3. **Prescription Item Ordering:** Should prescription items be displayed in order added, or allow drag-and-drop reordering? (Assumption: order added, no reordering)

4. **Clinical Notes Character Limit:** Should there be a max length for clinical notes? (Assumption: no limit, backend validates)

5. **Multiple Prescriptions Per Visit:** Can a visit have multiple prescriptions, or always 1:1? (Assumption: 1:1 based on API design)

6. **Queue Concurrency:** What happens if receptionist removes patient from queue while doctor is consulting? (Need backend validation)

7. **Billing Discount Limits:** Are there business rules for maximum discount percentages (e.g., doctor discount ≤ 20%)? (Assumption: 0-100% allowed)

8. **Session Resume Data Freshness:** When resuming, should we re-fetch visit history in case new visits were added? (Assumption: yes, always fetch latest)

9. **Completion Modal Auto-Close:** Should modal auto-close after N seconds, or require manual close? (Assumption: manual close for confirmation)

10. **Keyboard Navigation:** Should prescription builder support full keyboard navigation (Tab, Enter, Arrow keys)? (Nice-to-have, not MVP)
