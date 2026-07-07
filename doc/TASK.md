# Doctor Dispensary Application - Development Tasks

## Project Overview

This document outlines the complete development roadmap for the Doctor Dispensary Application. The system enables doctors, nurses, and pharmacy staff to work efficiently while providing admins with basic financial visibility.

**Goal**: Streamline daily clinical operations with proper patient management, visit tracking, prescription workflow, pharmacy inventory, billing, and queue management.

## Business Requirements Summary

### Core Workflows
1. **Patient Management** - Create/view/update patient records
2. **Visit Management** - Doctor/nurse record visits with notes
3. **Prescription Workflow** - Doctor issues → pharmacy dispenses
4. **Pharmacy Inventory** - Stock management from distributors
5. **Billing & Discounts** - Automatic billing with doctor-approved discounts
6. **Scheduling & Queue** - Appointment tracking and "now serving" status
7. **Reports** - Daily meds dispensed, low stock alerts, income summary

### User Roles & Permissions
- **Doctor**: Start serving patients, prescribe medicines, apply discounts
- **Nurse**: Create visits, add clinical notes, check-in patients
- **Pharmacist**: Dispense medicines, manage inventory, process payments
- **Admin**: View reports, manage users, basic financial oversight

## Current Implementation Status

### Backend (Spring Boot) - ✅ 95% Complete

**Fully Implemented Features:**
- ✅ Complete REST API with 48+ endpoints
- ✅ Multi-tenant architecture with tenant isolation
- ✅ All entities with proper relationships
- ✅ Patient management (CRUD + search)
- ✅ Visit management with status tracking
- ✅ Queue management with unique constraint (1 patient/doctor/day)
- ✅ Prescription workflow (1 visit → 1 prescription → multiple items)
- ✅ Medicine inventory with reorder levels
- ✅ Distributor management
- ✅ Supply management with stock batches
- ✅ Billing system with automatic creation and discount support
- ✅ Dispensing system with batch tracking
- ✅ User management with role-based access
- ✅ Visit notes system
- ✅ Proper validation and error handling

**Business Logic Verified:**
- ✅ Queue constraint prevents duplicate entries per patient/doctor/day
- ✅ Visit-Prescription one-to-one relationship
- ✅ Prescription-Items one-to-many relationship
- ✅ Automatic bill creation on visit start
- ✅ 100% discount support for free services
- ✅ Proper status flows for all entities

### Frontend (React/TypeScript) - 🚧 40% Complete

**✅ Fully Implemented:**
- Modern React 19 + TypeScript + Material-UI setup
- Redux Toolkit for state management
- Responsive layout with sidebar navigation
- Patient management (CRUD, search, form validation)
- Medicine inventory management (add, search, stock alerts)
- Distributor management (CRUD, search)
- Visit listing by patient with today/old separation
- Basic queue hooks and services
- Reusable components (DataTable, DialogModal, Forms)

**🚧 Partially Implemented:**
- Queue management (hooks exist, no UI components)
- Consult management (placeholder page only)
- Supply management (empty component placeholder)

**❌ Not Implemented:**
- Authentication system (planned for Phase 2)
- Prescription management interface
- Billing and payment interface
- Medicine dispensing interface
- Visit notes interface
- Queue management UI
- User management interface
- Reports and analytics

## Development Tasks

### Phase 1: Core Clinical Workflow (Priority: High)

#### Task 1.1: Queue Management UI
**Estimated: 3-4 days**
**Status: ❌ Not Started**

**Objectives:**
- Create queue management page with doctor-specific queue view
- Implement queue status transitions
- Add role-based queue actions
- Real-time queue updates

**Components to Create:**
- `src/features/Queues/pages/QueueManagementPage.tsx`
- `src/features/Queues/components/QueueStatusBadge.tsx`
- `src/features/Queues/components/QueueActionButtons.tsx`
- `src/features/Queues/components/QueueCard.tsx`

**Implementation Details:**
- Display queue entries by doctor with queue numbers
- Status badges: BOOKED, CHECKED_IN_WAITING, IN_PROGRESS, SERVED, NO_SHOW
- Action buttons based on user role:
  - Nurse: Check-in patients
  - Doctor: Start serving, mark as served
  - Receptionist: Mark no-show, remove from queue
- Auto-refresh queue status every 30 seconds
- Patient information display with visit details

**API Integration:**
- GET `/queue?doctorId={id}` - Get doctor's queue
- PATCH `/queue/{id}/check-in` - Check-in patient
- PATCH `/queue/{id}/start` - Start consultation
- PATCH `/queue/{id}/serve` - Complete consultation
- PATCH `/queue/{id}/no-show` - Mark no-show
- PATCH `/queue/{id}/remove` - Remove from queue

---

#### Task 1.2: Prescription Management Interface
**Estimated: 4-5 days**
**Status: ❌ Not Started**

**Objectives:**
- Create prescription form with medicine selection
- Add prescription items with proper dosage information
- Implement discount application
- Manage prescription status transitions

**Components to Create:**
- `src/features/prescriptions/pages/PrescriptionPage.tsx`
- `src/features/prescriptions/components/PrescriptionForm.tsx`
- `src/features/prescriptions/components/PrescriptionItemForm.tsx`
- `src/features/prescriptions/components/PrescriptionStatusBadge.tsx`
- `src/features/prescriptions/components/DiscountApplication.tsx`

**Implementation Details:**
- Medicine selection with search and availability check
- Prescription items form: dosage, frequency, duration, instructions
- Discount application: percentage input with real-time calculation
- Status management: STARTED → ISSUED → DISPENSED
- Integration with visit management
- Prescription history view

**API Integration:**
- POST `/prescriptions` - Create prescription
- GET `/prescriptions/{id}` - Get prescription details
- POST `/prescriptions/{id}/items` - Add prescription item
- GET `/prescriptions/{id}/items` - Get prescription items
- PUT `/prescriptions/{id}/status` - Update prescription status

---

#### Task 1.3: Visit Notes Interface
**Estimated: 2-3 days**
**Status: ❌ Not Started**

**Objectives:**
- Create visit notes form for clinical documentation
- Display notes history for each visit
- Role-based note creation

**Components to Create:**
- `src/features/visits/components/VisitNotesForm.tsx`
- `src/features/visits/components/VisitNotesList.tsx`
- `src/features/visits/pages/VisitNotesPage.tsx`

**Implementation Details:**
- Rich text editor for clinical notes
- Notes history with timestamps and author information
- Role-based creation permissions (doctor, nurse)
- Integration with existing visit management
- Notes search and filtering

**API Integration:**
- POST `/visits/{visitId}/notes` - Add visit note
- GET `/visits/{visitId}/notes` - Get visit notes

---

#### Task 1.4: Medicine Dispensing Interface
**Estimated: 3-4 days**
**Status: ❌ Not Started**

**Objectives:**
- Create dispensing interface for pharmacists
- Batch selection with expiry validation
- Stock quantity updates

**Components to Create:**
- `src/features/pharmacy/pages/DispensingPage.tsx`
- `src/features/pharmacy/components/DispensingForm.tsx`
- `src/features/pharmacy/components/BatchSelector.tsx`
- `src/features/pharmacy/components/ExpiryWarning.tsx`

**Implementation Details:**
- Prescription-based dispensing workflow
- Batch selection with expiry date validation
- Automatic stock quantity updates
- Dispensing history tracking
- Integration with prescription status updates

**API Integration:**
- POST `/dispense` - Record medicine dispensing
- GET `/dispense/{id}` - Get dispense details
- GET `/medicines` - Get available medicines with stock

---

### Phase 2: Billing & Financial Management (Priority: High)

#### Task 2.1: Billing Interface
**Estimated: 4-5 days**
**Status: ❌ Not Started**

**Objectives:**
- Automatic bill creation on visit start
- Real-time bill updates
- Payment processing interface

**Components to Create:**
- `src/features/billing/pages/BillingPage.tsx`
- `src/features/billing/components/BillDetails.tsx`
- `src/features/billing/components/PaymentForm.tsx`
- `src/features/billing/components/BillStatusBadge.tsx`
- `src/features/billing/components/BillRefreshButton.tsx`

**Implementation Details:**
- Automatic bill creation when visit starts
- Real-time updates on prescription changes
- Manual bill refresh functionality
- Payment processing with multiple payment methods
- Bill status management: DUE → PAID → VOID
- Financial summaries and reports

**API Integration:**
- POST `/bills` - Create bill (automatic)
- GET `/bills/{id}` - Get bill details
- POST `/bills/{id}/calculate` - Calculate bill totals
- PUT `/bills/{id}/discounts` - Update discounts
- PUT `/bills/{id}/status` - Update bill status
- GET `/bills` - List bills by patient

---

#### Task 2.2: Discount Management
**Estimated: 2 days**
**Status: ❌ Not Started**

**Objectives:**
- Doctor discount application interface
- Percentage-based discount calculation

**Components to Create:**
- `src/features/billing/components/DiscountForm.tsx`
- `src/features/billing/components/DiscountSummary.tsx`

**Implementation Details:**
- Percentage-based discount input
- Real-time discount calculation
- Support for 100% discount (free services)
- Discount approval workflow
- Discount history tracking

---

### Phase 3: Supply Chain Management (Priority: Medium)

#### Task 3.1: Complete Supply Management
**Estimated: 3-4 days**
**Status: 🚧 Partially Started (empty component exists)**

**Objectives:**
- Complete supply management interface
- Stock batch management
- Low stock alert system

**Components to Complete:**
- `src/features/pharmacy/pages/SupplyManagementPage.tsx` (currently empty)
- `src/features/pharmacy/components/SupplyForm.tsx`
- `src/features/pharmacy/components/StockBatchForm.tsx`
- `src/features/pharmacy/components/LowStockAlerts.tsx`

**Implementation Details:**
- Supply creation with distributor linking
- Stock batch management with expiry tracking
- Supply history and reporting
- Automatic low stock alerts based on reorder levels
- Batch tracking for medicine dispensing

**API Integration:**
- POST `/supplies` - Create supply
- POST `/supplies/{supplyId}/stock-batches` - Add stock batches
- GET `/supplies/{id}` - Get supply details
- GET `/supplies` - List supplies

---

### Phase 4: User Management & Admin (Priority: Medium)

#### Task 4.1: User Management Interface
**Estimated: 3-4 days**
**Status: ❌ Not Started**

**Objectives:**
- User CRUD operations
- Role assignment and management

**Components to Create:**
- `src/features/users/pages/UserManagementPage.tsx`
- `src/features/users/components/UserForm.tsx`
- `src/features/users/components/RoleAssignment.tsx`

**Implementation Details:**
- User creation and editing
- Role-based permission management
- User activity tracking
- Multi-tenant user management
- Password management

**API Integration:**
- POST `/users` - Create user
- GET `/users/{id}` - Get user details
- PUT `/users/{id}` - Update user
- GET `/users` - List users with role filtering

---

#### Task 4.2: Basic Reports
**Estimated: 2-3 days**
**Status: ❌ Not Started**

**Objectives:**
- Daily medicine dispensing report
- Basic financial summaries

**Components to Create:**
- `src/features/reports/pages/ReportsPage.tsx`
- `src/features/reports/components/DispensingReport.tsx`
- `src/features/reports/components/FinancialSummary.tsx`

**Implementation Details:**
- Daily medicine dispensing statistics
- Income and free services summary
- User activity reports
- Export functionality (PDF/Excel)
- Date range filtering

---

### Phase 5: Authentication (Future - Not Current Scope)

#### Task 5.1: Authentication System
**Estimated: 5-7 days**
**Status: ❌ Not Started (Phase 2)**

**Objectives:**
- Login/logout functionality
- JWT token management
- Role-based access control

**Components to Create:**
- `src/features/auth/pages/LoginPage.tsx`
- `src/features/auth/components/AuthProvider.tsx`
- `src/features/auth/components/ProtectedRoute.tsx`

**Implementation Details:**
- JWT-based authentication
- Role-based route protection
- Session management
- Token refresh mechanism

---

## Integration Requirements

### Critical Integration Points

1. **Visit Creation Flow**
   - Frontend calls both POST `/visits` and POST `/queue` simultaneously
   - Automatic bill creation via POST `/bills`
   - Update visit status based on queue actions

2. **Prescription-Billing Integration**
   - Real-time bill updates on prescription item addition
   - Discount application updates bill totals immediately
   - Prescription status changes trigger bill recalculation

3. **Dispensing-Inventory Integration**
   - Stock quantity updates on medicine dispensing
   - Batch selection updates available stock
   - Low stock alerts triggered by dispensing

4. **Queue-Visit Status Synchronization**
   - Queue status changes update visit status
   - "SERVED" queue status should close visit
   - "NO_SHOW" queue status should cancel visit

### Data Flow Requirements

```
Patient Registration → Visit Creation → Queue Entry → Bill Creation
     ↓
Check-in → In Progress → Notes → Prescription → Issue → Dispense → Payment
     ↓
Visit Closed → Bill Paid/VOID
```

## Technical Implementation Details

### Frontend Architecture Guidelines

1. **Feature-First Structure**: Maintain existing folder organization
2. **Component Reusability**: Leverage existing DataTable, DialogModal, Forms
3. **State Management**: Use Redux Toolkit for global state
4. **API Integration**: Follow existing service patterns
5. **Error Handling**: Implement proper loading states and error messages

### Backend Integration Guidelines

1. **API Client**: Use existing axios configuration
2. **DTO Patterns**: Maintain existing request/response structures
3. **Error Handling**: Proper HTTP status code handling
4. **Optimistic Updates**: Implement where appropriate for better UX

### Performance Considerations

1. **Pagination**: Implement for large datasets
2. **Debouncing**: Add for search functionality
3. **Lazy Loading**: Consider for inventory items
4. **Caching**: Implement for frequently accessed data

## Testing Strategy

### Frontend Testing
- Unit tests for utility functions
- Component testing for forms and interactions
- Integration testing for API calls
- End-to-end testing for critical workflows

### Backend Testing
- Service layer unit tests
- Integration tests for API endpoints
- Business logic validation tests
- Multi-tenant isolation tests

## Success Criteria

### Functional Requirements
- ✅ All user stories implemented
- ✅ Complete workflow integration
- ✅ Accurate financial calculations
- ✅ Proper status transitions
- ✅ Real-time updates where needed

### Performance Requirements
- Page load times < 3 seconds
- API response times < 500ms
- Zero critical bugs in production
- 99% uptime for core features

### User Experience Requirements
- Intuitive navigation
- Minimal clicks for common tasks
- Clear status indicators
- Responsive design
- Error-free workflows

## Risk Assessment & Mitigation

### High-Risk Areas
1. **Prescription-Dispensing-Billing Integration**
   - Risk: Complex state management
   - Mitigation: Comprehensive testing, clear state diagrams

2. **Real-time Queue Updates**
   - Risk: Status synchronization issues
   - Mitigation: Proper error handling, refresh mechanisms

3. **Financial Calculations**
   - Risk: Incorrect billing
   - Mitigation: Double calculations, audit trails

### Medium-Risk Areas
1. **Inventory Management**
   - Risk: Stock tracking errors
   - Mitigation: Batch tracking, reconciliation

2. **Multi-tenant Data Isolation**
   - Risk: Data leakage
   - Mitigation: Proper tenant context validation

## Next Steps

1. **Immediate Priority**: Start with Queue Management UI (Task 1.1)
2. **Parallel Development**: Prescription Management (Task 1.2) can start after queue basics
3. **Integration Focus**: Ensure proper API integration for each component
4. **Testing**: Implement testing alongside development
5. **Documentation**: Update API documentation as new features are added

## Notes for Development Team

1. **Follow existing patterns** in the codebase for consistency
2. **Use existing components** before creating new ones
3. **Maintain the established folder structure**
4. **Implement proper error handling** from the start
5. **Consider mobile responsiveness** in all new components
6. **Add proper TypeScript types** for all new interfaces
7. **Write meaningful commit messages** for better tracking
8. **Test critical workflows** before marking tasks complete

---

*Last Updated: May 4, 2026*
*Document Version: 1.0*
