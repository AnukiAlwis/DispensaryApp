## 1. Foundation & Setup

- [x] 1.1 Create feature folder structure: `src/features/consults/` with subdirectories (components, hooks, services, pages, types.ts)
- [x] 1.2 Define TypeScript interfaces in `types.ts` (Consultation, PrescriptionItem, BillingData, ConsultationState, etc.)
- [x] 1.3 Create `consultationService.ts` with API wrappers for consultation-related endpoints
- [x] 1.4 Create `prescriptionService.ts` with methods: create, getById, addItem, getItems, updateStatus
- [x] 1.5 Create `billingService.ts` with methods: create, getById, calculate, updateDiscounts
- [x] 1.6 Enhance existing `queueService.ts` with start() and serve() methods if not present

## 2. Custom Hooks Implementation

- [x] 2.1 Create `useConsultation.ts` hook with initiation cascade logic (3 API calls)
- [x] 2.2 Add finalization cascade logic to `useConsultation.ts` (5 API calls)
- [x] 2.3 Add session resume logic to `useConsultation.ts` (check IN_PROGRESS queue, 90-min timeout)
- [x] 2.4 Create `usePrescription.ts` hook with addItem, getItems, calculateQuantity functions
- [x] 2.5 Create `useBilling.ts` hook with calculate, updateDiscounts, calculateTotal (local) functions
- [x] 2.6 Add error handling and retry logic to all hooks

## 3. Idle Queue Components

- [x] 3.1 Create `IdleQueueCard.tsx` component showing next patient info and "Start Consulting" button
- [x] 3.2 Implement queue fetching logic in IdleQueueCard (GET /queue?doctorId)
- [x] 3.3 Add empty queue state ("No patients currently waiting") with disabled button
- [x] 3.4 Add "Resume Consultation" button when IN_PROGRESS queue entry exists
- [x] 3.5 Add loading state while fetching queue data

## 4. Active Consultation Header

- [x] 4.1 Create `ActivePatientHeader.tsx` component with patient name, age, last visit date
- [x] 4.2 Integrate QueueBadge component to display queue number
- [x] 4.3 Handle "First Visit" case when patient has no previous visits
- [x] 4.4 Style header as prominent top ribbon using MUI Box/Typography

## 5. Past Visits Accordion

- [x] 5.1 Create `PastVisitsAccordion.tsx` component with MUI Accordion
- [x] 5.2 Set default state to collapsed
- [x] 5.3 Implement DataTable with columns: Visit Date/Time, Status
- [x] 5.4 Sort visits chronologically (most recent first)
- [x] 5.5 Implement "Show More" button to load next 5 visits (cap at 10 total)
- [x] 5.6 Handle empty state ("No previous visits to display")

## 6. Clinical Notes Section

- [x] 6.1 Create `ClinicalNotesSection.tsx` component with multi-line TextField
- [x] 6.2 Set label to "Clinical Notes" and placeholder text
- [x] 6.3 Allow empty notes (no validation required)
- [x] 6.4 Style as large text area (minRows={4})

## 7. Medicine Autocomplete

- [x] 7.1 Create `MedicineAutocomplete.tsx` component using MUI Autocomplete
- [x] 7.2 Fetch all medicines via `GET /medicines` on component mount
- [x] 7.3 Implement client-side filtering by medicine name (case-insensitive)
- [x] 7.4 Display option label as "{name} {strength}"
- [x] 7.5 Clear search field after medicine selection
- [x] 7.6 Add loading state while fetching medicines

## 8. Prescription Item Row

- [x] 8.1 Create `PrescriptionItemRow.tsx` component with draft and committed states
- [x] 8.2 Add fields: Medicine Name (read-only), Dosage (input), Frequency (creatable combobox), Duration (numeric), Qty (read-only)
- [x] 8.3 Implement Frequency combobox with default options: "After meals", "Before meals", "Twice daily", "At bedtime", "Every 6 hours"
- [x] 8.4 Allow custom frequency text entry in combobox
- [x] 8.5 Implement quantity auto-calculation logic (parseFrequency helper function)
- [x] 8.6 Add stock validation: compare qty to medicine.quantity
- [x] 8.7 Display red warning "Stock unavailable. Current Available qty: [X]" when insufficient
- [x] 8.8 Disable Confirm button when stock insufficient
- [x] 8.9 Add Confirm button (checkmark icon) to save item via POST /prescriptions/{id}/items
- [x] 8.10 Add Edit button (pencil icon) - disabled with "Coming Soon" tooltip
- [x] 8.11 Add Delete button (trashcan icon) - disabled with "Coming Soon" tooltip
- [x] 8.12 Switch to committed state after successful save (disable inputs, show Edit/Delete)

## 9. Prescription Builder Container

- [x] 9.1 Create `PrescriptionBuilder.tsx` container component
- [x] 9.2 Integrate MedicineAutocomplete at top
- [x] 9.3 Manage list of prescription item rows (draft + committed)
- [x] 9.4 Handle medicine selection: create new draft PrescriptionItemRow
- [x] 9.5 Handle item confirmation: call API, update row state, trigger billing reset
- [x] 9.6 Handle item edit/delete (future): show tooltips for now
- [x] 9.7 Display all items in vertical stack

## 10. Billing Section

- [x] 10.1 Create `BillingSection.tsx` component with pre-calculation and post-calculation states
- [x] 10.2 Implement pre-calculation state: guidance text + "Confirm Prescription & Calculate Bill" button
- [x] 10.3 Disable calculate button when no prescription items exist
- [x] 10.4 Implement calculate button click: call POST /bills/{billId}/calculate
- [x] 10.5 Implement post-calculation state: display billing matrix
- [x] 10.6 Add Doctor Fee field (read-only, from API response)
- [x] 10.7 Add Doctor Discount % field (numeric input, 0-100 validation)
- [x] 10.8 Add Medicine Cost field (read-only, from API response)
- [x] 10.9 Add Pharmacy Discount % field (numeric input, 0-100 validation)
- [x] 10.10 Add Total Bill Amount field (read-only, calculated locally)
- [x] 10.11 Implement live total recalculation on discount change
- [x] 10.12 Use formula: Total = (DoctorFee × (1 - DoctorDiscount%/100)) + (MedicineCost × (1 - PharmacyDiscount%/100))
- [x] 10.13 Round total to 2 decimal places
- [x] 10.14 Disable calculate button after successful calculation
- [x] 10.15 Reset to pre-calculation state when prescription items change

## 11. Completion Modal

- [x] 11.1 Create `CompletionModal.tsx` component using DialogModal
- [x] 11.2 Set header to "Consultation Finished"
- [x] 11.3 Set body text to "Queue number [X] finished serving. Prescription sent to pharmacist."
- [x] 11.4 Add "CLOSE" button
- [x] 11.5 Handle close action: reset state, unmount workspace, auto-fetch next patient
- [x] 11.6 Make modal blocking (prevent interaction with underlying workspace)

## 12. Main Consultation Page Integration

- [x] 12.1 Update `ConsultsPage.tsx` to orchestrate all components
- [x] 12.2 Implement state management: idle vs active consultation state
- [x] 12.3 Render IdleQueueCard in idle state
- [x] 12.4 Render full workspace (Header, Accordion, Notes, Prescription, Billing) in active state
- [x] 12.5 Add "Complete Consultation & Send Prescription" button at bottom
- [x] 12.6 Wire up "Start Consulting" button to initiation cascade
- [x] 12.7 Wire up "Complete Consultation" button to finalization cascade
- [x] 12.8 Handle state transitions (idle → active → idle)

## 13. Cascade Workflows

- [x] 13.1 Implement initiation cascade progress indicators (3 steps)
- [x] 13.2 Add step labels: "Starting consultation...", "Loading patient history...", "Creating prescription..."
- [x] 13.3 Implement finalization cascade progress indicators (5 steps)
- [x] 13.4 Add step labels: "Saving notes...", "Saving discounts...", "Calculating bill...", "Locking prescription...", "Completing consultation..."
- [x] 13.5 Disable all UI elements during cascade execution
- [x] 13.6 Handle cascade errors: show step number, step name, backend error message
- [x] 13.7 Add Retry button for failed cascades
- [x] 13.8 Implement retry logic (re-run from beginning)

## 14. Session Resume Feature

- [x] 14.1 Add useEffect to check for IN_PROGRESS queue on page load
- [x] 14.2 Calculate session duration from queue.inProgressAt timestamp
- [x] 14.3 Auto-resume if duration ≤ 90 minutes
- [x] 14.4 Show confirmation modal if duration > 90 minutes
- [x] 14.5 Implement resume logic: fetch prescription, bill, visits data
- [x] 14.6 Restore UI state with fetched data
- [x] 14.7 Handle resume errors: show error, offer "Start Fresh" option
- [x] 14.8 Add "Resume Consultation" button in idle state when IN_PROGRESS exists

## 15. Error Handling & Edge Cases

- [x] 15.1 Add error handling for all API calls in services
- [x] 15.2 Test initiation cascade failure at each step (1, 2, 3)
- [x] 15.3 Test finalization cascade failure at each step (1-5)
- [x] 15.4 Test network timeout scenarios
- [x] 15.5 Test invalid data responses (400 errors)
- [x] 15.6 Test concurrent consultation attempts (409 conflict)
- [x] 15.7 Handle empty queue gracefully
- [x] 15.8 Handle patient with no visit history
- [x] 15.9 Handle medicine list fetch failure

## 16. Styling & UX Polish

- [x] 16.1 Apply consistent spacing using MUI sx prop
- [x] 16.2 Ensure responsive layout (mobile, tablet, desktop)
- [x] 16.3 Add loading spinners for all async operations
- [x] 16.4 Add hover states to buttons
- [x] 16.5 Add focus states for accessibility
- [x] 16.6 Ensure proper tab order for keyboard navigation
- [x] 16.7 Add aria-labels for screen readers
- [x] 16.8 Test color contrast for accessibility (WCAG AA)

## 17. Testing & Validation

- [x] 17.1 Test happy path: idle → start → add items → calculate → complete → next patient
- [x] 17.2 Test stock validation: insufficient stock prevents confirmation
- [x] 17.3 Test quantity calculation for all frequency types
- [x] 17.4 Test billing calculation with various discount percentages
- [x] 17.5 Test session resume after browser refresh
- [x] 17.6 Test 90-minute timeout boundary (89 min vs 91 min)
- [x] 17.7 Test empty notes submission
- [x] 17.8 Test medicine autocomplete with 0 results
- [x] 17.9 Test cascade retry after failure
- [x] 17.10 Test auto-fetch next patient after completion

## 18. Documentation & Cleanup

- [x] 18.1 Add JSDoc comments to all service methods
- [x] 18.2 Add JSDoc comments to all custom hooks
- [x] 18.3 Add prop type documentation to all components
- [x] 18.4 Update README with consultation feature description
- [x] 18.5 Document known limitations (edit/delete disabled, client-side medicine search)
- [x] 18.6 Remove console.log statements
- [x] 18.7 Remove unused imports
- [x] 18.8 Run TypeScript type checking (no errors)
- [x] 18.9 Run linter and fix warnings

## 19. Performance Optimization

- [x] 19.1 Memoize medicine list filtering in autocomplete
- [x] 19.2 Memoize quantity calculation function
- [x] 19.3 Memoize billing total calculation
- [x] 19.4 Use React.memo for PrescriptionItemRow if rendering many items
- [x] 19.5 Debounce discount input changes (optional, if UX feels sluggish)
- [x] 19.6 Test with 5000 medicines in autocomplete (performance benchmark)

## 20. Final Integration & Deployment Prep

- [x] 20.1 Test full workflow with backend APIs (not mock data)
- [x] 20.2 Verify all API contracts match documentation
- [x] 20.3 Test with real doctor user account
- [x] 20.4 Verify multi-tenant header (X-Tenant-ID) is sent correctly
- [x] 20.5 Test error messages display correctly in snackbar
- [x] 20.6 Verify route `/consults` is accessible from navigation
- [x] 20.7 Build production bundle and verify no errors
- [x] 20.8 Perform smoke test on staging environment
- [x] 20.9 Create deployment checklist
- [x] 20.10 Schedule user acceptance testing with doctors
