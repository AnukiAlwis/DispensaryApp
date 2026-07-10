# Change Proposal: Consultation Story Frontend Development & API Integration

## Executive Summary

This proposal outlines the complete frontend implementation of the Doctor Consultation Workspace as specified in the consultation story document. The backend APIs are fully implemented and ready for integration. This change will transform the current placeholder consultation page into a comprehensive, production-ready clinical workspace.

## Scope Overview

### Current State
- Frontend: Placeholder `ConsultsPage.tsx` with basic text
- Backend: Complete API implementation for all consultation workflows
- Gap: No frontend implementation of the clinical workspace

### Target State
- Full consultation workspace with sequential workflow management
- Real-time prescription builder with stock validation
- Dynamic billing calculations with discount management
- Complete API integration with error handling
- Responsive Material-UI components following existing design patterns

## Implementation Plan

### Phase 1: Core Infrastructure (Priority: High)

#### 1.1 Component Architecture
```
src/features/consults/
├── components/
│   ├── QueueDisplay/
│   │   ├── IdleQueueDisplay.tsx
│   │   ├── NextPatientBanner.tsx
│   │   └── StartConsultingButton.tsx
│   ├── ConsultationWorkspace/
│   │   ├── PatientHeader.tsx
│   │   ├── PastVisitsAccordion.tsx
│   │   ├── ClinicalNotesSection.tsx
│   │   ├── PrescriptionBuilder.tsx
│   │   └── BillingSection.tsx
│   └── shared/
│       ├── PrescriptionItemRow.tsx
│       ├── StockWarning.tsx
│       └── ConfirmationModal.tsx
├── pages/
│   └── ConsultsPage.tsx (enhanced)
├── hooks/
│   ├── useQueueManagement.ts
│   ├── usePrescriptionBuilder.ts
│   └── useBillingCalculations.ts
├── services/
│   └── consultationApi.ts
└── types/
    └── consultation.types.ts
```

#### 1.2 State Management Strategy
```typescript
// Redux slice for consultation state
interface ConsultationState {
  currentPhase: 'idle' | 'loading' | 'active' | 'finalizing';
  activePatient: Patient | null;
  queueData: QueueEntry[];
  prescriptionItems: PrescriptionItem[];
  billingData: BillingData | null;
  error: string | null;
}
```

### Phase 2: Queue Management (Priority: High)

#### 2.1 Idle Queue Display
- **Component**: `IdleQueueDisplay.tsx`
- **Features**:
  - Fetch next patient via `GET /queue?doctorId={doctorId}`
  - Display patient summary card
  - Handle empty queue state
  - "Start Consulting" button with loading state

#### 2.2 Consultation Initiation
- **Sequence**: Implement exact API cascade from story
- **Error Handling**: Sequential failure handling with rollback
- **Loading States**: Step-by-step progress indicators

### Phase 3: Consultation Workspace (Priority: High)

#### 3.1 Patient Header Component
- **Display**: Active patient info with queue number
- **Data**: Patient demographics + last visit date
- **Styling**: MUI ribbon design as specified

#### 3.2 Past Visits Accordion
- **Component**: Collapsible data table
- **Data Source**: `GET /visits?patientId={id}`
- **Sorting**: Most recent first (chronological)
- **Read-only**: Display only format

#### 3.3 Clinical Notes Section
- **Component**: Large multi-line text input
- **Validation**: Allows empty submissions
- **Auto-save**: Optional draft saving capability

### Phase 4: Prescription Builder (Priority: High)

#### 4.1 Medicine Search & Selection
- **API**: `GET /medicines` with autocomplete
- **UI**: MUI Autocomplete component
- **Stock Integration**: Real-time quantity display

#### 4.2 Prescription Item Management
- **Component**: `PrescriptionItemRow.tsx`
- **Features**:
  - Dosage, frequency, duration inputs
  - Auto-calculation of prescribed quantity
  - Stock validation with warning display
  - Edit/delete/confirm actions

#### 4.3 Stock Validation Logic
```typescript
// Real-time stock checking
const validateStock = (prescribedQty: number, availableQty: number) => {
  if (prescribedQty > availableQty) {
    return {
      isValid: false,
      message: `Stock unavailable. Current Available qty: ${availableQty}`
    };
  }
  return { isValid: true };
};
```

### Phase 5: Billing Integration (Priority: Medium)

#### 5.1 Pre-Calculation State
- **Display**: Guiding text placeholder
- **Trigger**: "Confirm Prescription & Calculate Bill" button
- **State Management**: Hide billing section until calculation

#### 5.2 Post-Calculation Interface
- **API**: `POST /bills/{billId}/calculate`
- **Components**:
  - Doctor fee display (read-only)
  - Medicine cost display
  - Discount percentage inputs (doctor/pharmacy)
  - Total amount calculation (live updates)

#### 5.3 State Reset Logic
- **Trigger**: Prescription item changes
- **Action**: Hide billing section, enable calculate button
- **Validation**: Prevent outdated data submission

### Phase 6: Finalization Workflow (Priority: Medium)

#### 6.1 Completion Cascade
Implement exact API sequence from consultation story:
```typescript
const completeConsultation = async () => {
  try {
    // 1. Save clinical notes
    await api.post(`/visits/${visitId}/notes`, { note: clinicalNotes });
    
    // 2. Update discounts
    await api.put(`/bills/${billId}/discounts`, discountData);
    
    // 3. Recalculate bill
    await api.post(`/bills/${billId}/calculate`);
    
    // 4. Lock prescription
    await api.put(`/prescriptions/${prescriptionId}/status`, { status: "ISSUED" });
    
    // 5. Complete queue
    await api.patch(`/queue/${queueId}/serve`);
    
    // Show success modal
    showSuccessModal();
    
    // Reset to idle state
    resetToIdle();
  } catch (error) {
    handleCompletionError(error);
  }
};
```

#### 6.2 Success Modal
- **Component**: Reuse existing modal infrastructure
- **Content**: Queue completion message
- **Action**: Close and reset to idle state

### Phase 7: Error Handling & Resilience (Priority: Medium)

#### 7.1 Network Error Handling
- **Strategy**: Global error interceptor
- **Display**: MUI Alert Snackbar (bottom-left)
- **Recovery**: Retry mechanisms where appropriate

#### 7.2 State Recovery
- **Validation**: Ensure data consistency
- **Rollback**: Revert partial state on failures
- **User Guidance**: Clear error messages and next steps

## Technical Specifications

### API Integration Mapping

| Story Requirement | Backend Endpoint | Frontend Implementation |
|-------------------|-----------------|------------------------|
| Queue fetch | `GET /queue?doctorId={id}` | `useQueueManagement` hook |
| Start consultation | `PATCH /queue/{id}/start` | Consultation initiation cascade |
| Patient visits | `GET /visits?patientId={id}` | `PastVisitsAccordion` component |
| Create prescription | `POST /prescriptions` | Workspace initialization |
| Medicine search | `GET /medicines` | Autocomplete component |
| Add prescription item | `POST /prescriptions/{id}/items` | `PrescriptionBuilder` |
| Calculate bill | `POST /bills/{billId}/calculate` | Billing section |
| Update discounts | `PUT /bills/{billId}/discounts` | Billing interface |
| Save notes | `POST /visits/{visitId}/notes` | Finalization cascade |
| Issue prescription | `PUT /prescriptions/{id}/status` | Finalization cascade |
| Complete queue | `PATCH /queue/{queueId}/serve` | Finalization cascade |

### Component Dependencies

```
ConsultsPage (Container)
├── QueueDisplay (Conditional)
│   └── IdleQueueDisplay
├── ConsultationWorkspace (Conditional)
│   ├── PatientHeader
│   ├── PastVisitsAccordion
│   ├── ClinicalNotesSection
│   ├── PrescriptionBuilder
│   │   ├── MedicineSearch
│   │   └── PrescriptionItemRow[]
│   └── BillingSection
└── CompletionModal (Conditional)
```

### State Management Flow

```
Idle State
├── Load queue data
├── Display next patient
└── Wait for "Start Consulting"

Loading State
├── Execute API cascade
├── Show progress indicators
└── Handle errors

Active State
├── Display workspace
├── Manage prescription items
├── Calculate billing
└── Wait for completion

Finalizing State
├── Execute completion cascade
├── Show loading states
└── Handle success/failure

Success State
├── Show completion modal
├── Reset all state
└── Return to idle
```

## Implementation Tasks

### High Priority Tasks
1. **Setup component structure and routing**
2. **Implement queue display and management**
3. **Build consultation workspace layout**
4. **Create prescription builder with stock validation**
5. **Integrate billing calculation workflow**

### Medium Priority Tasks
1. **Implement finalization cascade**
2. **Add comprehensive error handling**
3. **Create success modal and state reset**
4. **Add loading states and progress indicators**

### Low Priority Tasks
1. **Optimize performance and caching**
2. **Add accessibility features**
3. **Implement unit tests**
4. **Add browser compatibility testing**

## Risk Assessment

### Technical Risks
- **API Sequence Complexity**: High - Sequential cascade requires careful error handling
- **State Management**: Medium - Complex state transitions need robust implementation
- **Stock Validation**: Low - Backend provides necessary data structures

### Mitigation Strategies
- Implement comprehensive error handling with rollback capabilities
- Use Redux middleware for complex state transitions
- Add extensive logging for debugging API sequences

## Success Criteria

### Functional Requirements
- [ ] Complete consultation workflow from queue to completion
- [ ] Real-time stock validation during prescription building
- [ ] Dynamic billing calculations with discount management
- [ ] Error handling for all API failure scenarios
- [ ] Responsive design matching existing application patterns

### Non-Functional Requirements
- [ ] Performance: < 2 second load times for all components
- [ ] Accessibility: WCAG 2.1 AA compliance
- [ ] Browser Support: Chrome, Firefox, Safari, Edge
- [ ] Code Quality: TypeScript strict mode, 90%+ test coverage

## Timeline Estimate

### Phase 1-2 (Infrastructure & Queue): 3-4 days
### Phase 3-4 (Workspace & Prescription): 5-6 days
### Phase 5-6 (Billing & Finalization): 4-5 days
### Phase 7 (Error Handling & Polish): 2-3 days

**Total Estimated Duration: 14-18 days**

## Dependencies

### External Dependencies
- Existing backend APIs (fully implemented)
- Material-UI component library
- Redux Toolkit for state management

### Internal Dependencies
- Existing authentication system
- Current routing structure
- Shared component library

## Conclusion

This proposal provides a comprehensive roadmap for implementing the consultation story frontend. The backend APIs are ready, and the detailed specification in the consultation story document provides clear implementation guidance. The phased approach ensures manageable development cycles while delivering a complete, production-ready clinical workspace.

The implementation will transform the current placeholder into a sophisticated healthcare application that streamlines the doctor consultation workflow, improves patient care efficiency, and provides a solid foundation for future enhancements.
