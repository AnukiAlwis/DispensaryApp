# Doctor Dispensary Application - Main User Stories

## System Overview

The Doctor Dispensary Application is a comprehensive clinical management system designed to streamline daily operations for doctors, nurses, and pharmacy staff while providing administrators with basic financial visibility. The system supports multi-tenant architecture, ensuring data isolation between different medical facilities.

## Core User Personas

### 1. Receptionist
**Role**: Front desk management and patient coordination
**Permissions**: Create patients, create visits, manage queue check-ins, mark no-shows

### 2. Nurse  
**Role**: Patient care coordination and clinical support
**Permissions**: Create visits, add clinical notes, check-in patients, assist queue management

### 3. Doctor
**Role**: Medical consultation and prescription management
**Permissions**: Start serving patients, create prescriptions, apply discounts, add clinical notes

### 4. Pharmacist
**Role**: Medicine dispensing and inventory management
**Permissions**: Dispense medicines, manage inventory, process payments, refresh bills

### 5. Administrator
**Role**: System oversight and financial reporting
**Permissions**: View reports, manage users, basic financial oversight

---

## Complete User Stories

### Patient Management Stories

#### Story 1: Patient Registration
**As a** Receptionist  
**I want to** create new patient records with basic information  
**So that** I can register patients for visits and maintain accurate patient database

**Acceptance Criteria:**
- Receptionist can create patient with first name, last name, date of birth, gender, contact, and address
- System validates phone number format (Sri Lankan: +94XXXXXXXXX or 0XXXXXXXXX)
- System automatically generates unique patient ID
- Receptionist can search existing patients by name or contact
- Receptionist can update patient information when needed
- System tracks who created each patient record

**Implementation Status:** ✅ **COMPLETED** (Frontend + Backend)

---

#### Story 2: Patient Information Access
**As a** Nurse/Doctor  
**I want to** search and view patient details including visit history  
**So that** I can provide appropriate care based on patient medical history

**Acceptance Criteria:**
- Can search patients by name or contact number
- Can view complete patient profile with demographics
- Can see patient's visit history
- Can access patient's prescription history
- Information is displayed in an organized, readable format

**Implementation Status:** ✅ **COMPLETED** (Frontend + Backend)

---

### Visit & Queue Management Stories

#### Story 3: Visit Creation and Queue Entry
**As a** Receptionist/Nurse  
**I want to** create new visits and queue entries simultaneously  
**So that** patients are properly scheduled and tracked in the consultation queue

**Acceptance Criteria:**
- System creates both visit record and queue entry when visit is created
- Queue entry automatically gets queue number for the day
- System enforces one queue entry per patient per doctor per day
- Queue entry starts with BOOKED status
- Visit record starts with OPEN status
- Bill is automatically created when visit starts

**Implementation Status:** 🚧 **PARTIALLY COMPLETED** (Backend ✅, Frontend 🚧)

---

#### Story 4: Patient Check-in Process
**As a** Nurse/Receptionist  
**I want to** mark patients as checked-in when they arrive at the premises  
**So that** doctors know who is waiting for consultation

**Acceptance Criteria:**
- Can change queue status from BOOKED to CHECKED_IN_WAITING
- System records check-in timestamp
- Can see list of checked-in patients for each doctor
- Interface shows clear queue order and status
- Can handle multiple patients checking in

**Implementation Status:** ❌ **NOT IMPLEMENTED** (Frontend missing, Backend ✅)

---

#### Story 5: Doctor Consultation Management
**As a** Doctor  
**I want to** see my queue and mark patients as in-progress when I start serving them  
**So that** I can manage my consultation flow efficiently

**Acceptance Criteria:**
- Can view my personal queue with patient details
- Can change queue status from CHECKED_IN_WAITING to IN_PROGRESS
- System records consultation start time
- Can see which patient is currently being served
- Queue order is clearly displayed

**Implementation Status:** ❌ **NOT IMPLEMENTED** (Frontend missing, Backend ✅)

---

#### Story 6: Consultation Completion
**As a** Doctor  
**I want to** mark patients as served when I complete their consultation  
**So that** the next patient can be called and billing can be finalized

**Acceptance Criteria:**
- Can change queue status from IN_PROGRESS to SERVED
- System records consultation completion time
- Visit status changes from OPEN to CLOSED
- Billing process can be finalized
- Next patient in queue is automatically highlighted

**Implementation Status:** ❌ **NOT IMPLEMENTED** (Frontend missing, Backend ✅)

---

#### Story 7: No-show Management
**As a** Receptionist  
**I want to** mark patients as no-show at the end of the day for accurate records  
**So that** clinic statistics are accurate and resources can be reallocated

**Acceptance Criteria:**
- Can change queue status to NO_SHOW
- Visit status changes to CANCELLED
- Bill status changes to VOID
- System records no-show timestamp
- Can process multiple no-shows at end of day

**Implementation Status:** ❌ **NOT IMPLEMENTED** (Frontend missing, Backend ✅)

---

### Clinical Documentation Stories

#### Story 8: Clinical Note Taking
**As a** Doctor/Nurse  
**I want to** add clinical notes during patient visits  
**So that** patient care is properly documented for future reference

**Acceptance Criteria:**
- Can add notes to active visit
- Notes include timestamp and author information
- Can view notes history for each visit
- Notes support rich text formatting
- Notes are searchable within patient record

**Implementation Status:** ❌ **NOT IMPLEMENTED** (Frontend missing, Backend ✅)

---

### Prescription Management Stories

#### Story 9: Prescription Creation
**As a** Doctor  
**I want to** create prescriptions with multiple medicine items  
**So that** patients receive proper treatment for their conditions

**Acceptance Criteria:**
- Can create prescription for active visit
- Can add multiple medicine items with dosage, frequency, duration
- Can add specific instructions for each medicine
- System checks medicine availability in inventory
- Prescription starts with STARTED status

**Implementation Status:** ❌ **NOT IMPLEMENTED** (Frontend missing, Backend ✅)

---

#### Story 10: Discount Application
**As a** Doctor  
**I want to** apply percentage discounts including 100% for free services  
**So that** patients receive appropriate pricing based on their circumstances

**Acceptance Criteria:**
- Can apply doctor discount (percentage)
- Can apply pharmacy discount (percentage)
- System supports 100% discount for free services
- Real-time calculation of discounted amounts
- Discount approval workflow for high-value discounts

**Implementation Status:** ❌ **NOT IMPLEMENTED** (Frontend missing, Backend ✅)

---

#### Story 11: Prescription Issuance
**As a** Doctor  
**I want to** finalize and issue prescriptions to pharmacy  
**So that** pharmacists can prepare medicines for dispensing

**Acceptance Criteria:**
- Can change prescription status from STARTED to ISSUED
- All required fields must be completed before issuance
- System notifies pharmacy of new issued prescription
- Cannot modify prescription after issuance
- Bill automatically updates with prescription details

**Implementation Status:** ❌ **NOT IMPLEMENTED** (Frontend missing, Backend ✅)

---

#### Story 12: Prescription Dispensing
**As a** Pharmacist  
**I want to** view issued prescriptions and dispense medicines  
**So that** patients receive their prescribed medications

**Acceptance Criteria:**
- Can view list of issued prescriptions
- Can select specific medicine batches for dispensing
- System validates expiry dates before dispensing
- Stock quantities automatically updated
- Prescription status changes to DISPENSED
- Bill updates with final dispensing details

**Implementation Status:** ❌ **NOT IMPLEMENTED** (Frontend missing, Backend ✅)

---

### Pharmacy Inventory Stories

#### Story 13: Medicine Management
**As a** Pharmacist  
**I want to** add new medicines to inventory with pricing and reorder levels  
**So that** medicines can be prescribed and stock levels are maintained

**Acceptance Criteria:**
- Can add medicine with name, form, strength, unit, price, reorder level
- System warns when stock reaches reorder level
- Can update medicine information
- Can search medicines by various criteria
- Can view current stock levels

**Implementation Status:** ✅ **COMPLETED** (Frontend + Backend)

---

#### Story 14: Stock Management
**As a** Pharmacist  
**I want to** receive stock from distributors with batch tracking  
**So that** medicine quality is maintained and traceability is ensured

**Acceptance Criteria:**
- Can create supply records from distributors
- Can add multiple stock batches per supply
- Each batch has batch number and expiry date
- System tracks quantities by batch
- Can view supply history

**Implementation Status:** 🚧 **PARTIALLY COMPLETED** (Backend ✅, Frontend 🚧)

---

#### Story 15: Low Stock Alerts
**As a** Pharmacist  
**I want to** see low stock alerts and reorder medicines in time  
**So that** medicine shortages are avoided and patient care is not disrupted

**Acceptance Criteria:**
- System automatically alerts when stock ≤ reorder level
- Can view list of medicines needing reorder
- Can create supply orders for low stock items
- Alerts are visible on pharmacy dashboard
- Historical stock tracking available

**Implementation Status:** 🚧 **PARTIALLY COMPLETED** (Backend ✅, Frontend 🚧)

---

#### Story 16: Distributor Management
**As a** Pharmacist  
**I want to** manage distributor information and contact details  
**So that** supply chain is organized and communication is efficient

**Acceptance Criteria:**
- Can add/update distributor information
- Can view distributor contact details
- Can track supply history by distributor
- Can search distributors by name or contact

**Implementation Status:** ✅ **COMPLETED** (Frontend + Backend)

---

### Billing & Financial Stories

#### Story 17: Automatic Bill Creation
**As a** System  
**I want to** automatically create bills when visits start  
**So that** financial tracking begins immediately and no revenue is missed

**Acceptance Criteria:**
- Bill automatically created when visit status changes to OPEN
- Initial bill includes doctor fee
- Bill status starts as DUE
- Bill is linked to patient and visit
- System tracks bill creation timestamp

**Implementation Status:** ❌ **NOT IMPLEMENTED** (Frontend missing, Backend ✅)

---

#### Story 18: Real-time Bill Updates
**As a** Pharmacist  
**I want to** see real-time bill updates as prescriptions are added and dispensed  
**So that** pricing is accurate and up-to-date

**Acceptance Criteria:**
- Bill automatically updates when prescription items are added
- Bill updates when discounts are applied
- Bill updates when medicines are dispensed
- Can see breakdown of doctor fees vs medicine costs
- Manual refresh button available if needed

**Implementation Status:** ❌ **NOT IMPLEMENTED** (Frontend missing, Backend ✅)

---

#### Story 19: Payment Processing
**As a** Pharmacist  
**I want to** process payments and mark bills as paid  
**So that** financial records are complete and accurate

**Acceptance Criteria:**
- Can process payments with multiple payment methods
- Can mark bills as PAID
- Can apply partial payments
- Can generate receipts
- Can void bills for cancelled visits

**Implementation Status:** ❌ **NOT IMPLEMENTED** (Frontend missing, Backend ✅)

---

### Administrative Stories

#### Story 20: User Management
**As an** Administrator  
**I want to** manage user accounts and assign appropriate roles  
**So that** access control is maintained and security is ensured

**Acceptance Criteria:**
- Can create user accounts with username, email, role
- Can assign roles (Doctor, Nurse, Pharmacist, Admin, Receptionist)
- Can update user information
- Can deactivate user accounts
- Can view user activity logs

**Implementation Status:** ❌ **NOT IMPLEMENTED** (Frontend missing, Backend ✅)

---

#### Story 21: Financial Reporting
**As an** Administrator  
**I want to** view basic financial summaries and reports  
**So that** I can monitor clinic performance and make informed decisions

**Acceptance Criteria:**
- Can view daily income summaries
- Can see free services statistics
- Can view medicine dispensing reports
- Can filter reports by date range
- Can export reports to PDF/Excel

**Implementation Status:** ❌ **NOT IMPLEMENTED** (Planned for future)

---

## Complete Status Change Workflows

### 1. Queue Entry Status Flow

```
BOOKED (Initial)
    ↓ (Receptionist/Nurse checks in patient)
CHECKED_IN_WAITING
    ↓ (Doctor starts consultation)
IN_PROGRESS
    ↓ (Doctor completes consultation)
SERVED
    ↓ (End of day if patient didn't arrive)
NO_SHOW
    ↓ (Manual removal)
REMOVED
```

**Status Change Triggers:**
- **BOOKED → CHECKED_IN_WAITING**: Nurse/Receptionist marks patient arrival
- **CHECKED_IN_WAITING → IN_PROGRESS**: Doctor starts consultation
- **IN_PROGRESS → SERVED**: Doctor completes consultation
- **Any status → NO_SHOW**: Receptionist marks as no-show (usually end of day)
- **Any status → REMOVED**: Manual removal from queue

**Who Can Change Status:**
- **CHECKED_IN_WAITING**: Nurse, Receptionist
- **IN_PROGRESS**: Doctor
- **SERVED**: Doctor
- **NO_SHOW**: Receptionist
- **REMOVED**: Receptionist, Admin

**Timestamps Recorded:**
- `createdAt`: When queue entry is created
- `checkedInAt`: When status changes to CHECKED_IN_WAITING
- `inProgressAt`: When status changes to IN_PROGRESS
- `servedAt`: When status changes to SERVED

---

### 2. Visit Status Flow

```
OPEN (Initial)
    ↓ (Consultation completed and payment processed)
CLOSED
    ↓ (Patient cancelled or no-show)
CANCELLED
```

**Status Change Triggers:**
- **OPEN**: Created when visit is registered
- **CLOSED**: When queue status changes to SERVED and bill is PAID
- **CANCELLED**: When queue status changes to NO_SHOW or manual cancellation

**Business Rules:**
- Visit cannot be CLOSED if bill is not PAID
- Visit can be CANCELLED anytime before payment
- All visit notes must be completed before closing

---

### 3. Prescription Status Flow

```
STARTED (Initial)
    ↓ (Doctor finalizes prescription details)
ISSUED
    ↓ (Pharmacist completes dispensing)
DISPENSED
    ↓ (Prescription cancelled)
CANCELLED
```

**Status Change Triggers:**
- **STARTED**: Created when doctor begins prescription
- **ISSUED**: Doctor confirms all details and issues to pharmacy
- **DISPENSED**: Pharmacist completes all medicine dispensing
- **CANCELLED**: Prescription cancelled before dispensing

**Business Rules:**
- Cannot add items after ISSUED status
- Cannot modify after ISSUED status
- Cannot dispense before ISSUED status
- All items must be dispensed for DISPENSED status

---

### 4. Bill Status Flow

```
DUE (Initial)
    ↓ (Payment processed)
PAID
    ↓ (Visit cancelled or bill voided)
VOID
```

**Status Change Triggers:**
- **DUE**: Created automatically when visit starts
- **PAID**: When payment is processed
- **VOID**: When visit is cancelled or bill is manually voided

**Business Rules:**
- Bill automatically updates on prescription changes
- Discounts can be applied while DUE
- Cannot modify PAID bills
- VOID bills cannot be reactivated

---

### 5. Medicine Stock Flow

```
STOCK ADDED (Supply received)
    ↓ (Medicine dispensed)
STOCK REDUCED
    ↓ (Reorder level reached)
LOW STOCK ALERT
    ↓ (New supply received)
STOCK REPLENISHED
```

**Stock Change Triggers:**
- **STOCK ADDED**: When new supply batches are added
- **STOCK REDUCED**: When medicines are dispensed
- **LOW STOCK ALERT**: When quantity ≤ reorder level
- **STOCK REPLENISHED**: When new stock is added

**Batch Management:**
- Each dispensing reduces specific batch quantity
- FIFO (First In, First Out) principle for batch selection
- Expiry date validation before dispensing
- Batch tracking for recall purposes

---

## Integration Points and Data Flow

### Complete Patient Journey

```
1. Patient Registration
   ↓
2. Visit Creation + Queue Entry + Bill Creation (Automatic)
   ↓
3. Patient Check-in (Queue: BOOKED → CHECKED_IN_WAITING)
   ↓
4. Consultation Start (Queue: CHECKED_IN_WAITING → IN_PROGRESS)
   ↓
5. Clinical Notes Added
   ↓
6. Prescription Created (Status: STARTED)
   ↓
7. Prescription Items Added
   ↓
8. Discount Applied (if any)
   ↓
9. Prescription Issued (Status: ISSUED)
   ↓
10. Consultation Complete (Queue: IN_PROGRESS → SERVED)
    ↓
11. Medicine Dispensing (Prescription: ISSUED → DISPENSED)
    ↓
12. Bill Finalization
    ↓
13. Payment Processing (Bill: DUE → PAID)
    ↓
14. Visit Closure (Visit: OPEN → CLOSED)
```

### System Integration Requirements

1. **Visit-Queue-Bill Integration**: All three created simultaneously
2. **Prescription-Bill Integration**: Real-time bill updates on prescription changes
3. **Dispensing-Inventory Integration**: Automatic stock updates
4. **Queue-Visit Integration**: Queue status changes affect visit status
5. **Payment-Visit Integration**: Visit closure only after payment

---

## Technical Implementation Notes

### Multi-Tenant Architecture
- All entities are tenant-isolated
- Tenant context is required for all operations
- Data segregation enforced at database level

### Role-Based Access Control
- Different user roles have specific permissions
- UI components adapt based on user role
- API endpoints enforce role-based access

### Audit Trail
- All entities track creation and modification timestamps
- User tracking for who created/modified records
- Status changes are logged with timestamps

### Data Validation
- Phone number format validation (Sri Lankan standards)
- Required field validation
- Business rule validation (e.g., stock availability)

### Performance Considerations
- Pagination for large datasets
- Search functionality with debouncing
- Optimized database queries
- Caching for frequently accessed data

---

## Future Enhancements (Beyond Current Scope)

### Authentication System
- JWT-based authentication
- Role-based route protection
- Session management
- Password security policies

### Advanced Reporting
- Custom report builder
- Advanced analytics dashboard
- Predictive analytics for inventory
- Financial forecasting

### Integration Capabilities
- Laboratory system integration
- Imaging system integration
- External pharmacy integration
- Insurance billing integration

### Mobile Application
- Native mobile app for doctors
- Patient portal for appointment booking
- Mobile dispensing verification
- Push notifications for queue updates

---

*Document Version: 1.0*  
*Last Updated: May 4, 2026*  
*Author: Development Team*