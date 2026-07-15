# Story 12.1 - Prescription Dispensing Workflow (UI/UX Specification)

## Overview

This story extends the existing **Prescription Dispensing** functionality by introducing a guided dispensing workflow for pharmacists.

The objective is to:

- Force pharmacists to complete one dispensing process before starting another.
- Reduce mistakes during medicine preparation.
- Keep the dispensing workflow simple and efficient.
- Automatically transition into billing once medicines are prepared.
- Automatically move to the next waiting prescription after completion.

---

# Primary Screen - Prescription Dispensing

The Prescription Dispensing page consists of two main sections.

## Section 1 - Currently Serving

A highlighted card displaying the prescription currently being processed.

The card displays:

- Patient Name
- Phone Number
- Doctor
- Issued Date & Time
- Waiting Time

### Action Button

Initially the action button is:

**💊 Start Preparing**

If preparation was started previously but not completed, the button changes to:

**Continue Dispense**

Selecting **Continue Dispense** resumes the workflow from the exact point where the pharmacist left.

---

## Section 2 - Prescriptions UP NEXT

A table showing all prescriptions that are waiting to be dispensed.

Columns:

- Patient Name
- Phone Number
- Doctor
- Issued Date & Time
- Actions

Actions:

- View Prescription
- Dispense Now

### View Prescription

Opens a **read-only** popup containing the prescription details.

No editing is allowed.

### Dispense Now

Allows the pharmacist to manually choose another prescription.

However, once preparation has started for a patient, **all Dispense Now buttons become disabled** until the current dispensing workflow has been completed.

This enforces the rule:

> One pharmacist can actively prepare only one prescription at a time.

---

# Medicine Preparation Modal

Selecting **Start Preparing** opens the Medicine Preparation modal.

## Medicine Ordering

The medicine table is automatically sorted by the backend before sending the response.

Sorting order:

1. Frequency (highest to lowest)

- 3x/day
- 2x/day
- 1x/day

2. Quantity (highest to lowest)

No visual grouping is required.

Only the ordering should reflect the above priority.

---

## Table Columns

| Medicine | Strength | Dose | Frequency | Quantity | Status |
|----------|----------|------|-----------|----------|--------|

Each medicine row contains a clickable status button.

---

## Preparation Status Cycle

Each click cycles through the following states.

```
NOT_STARTED
        ↓
STARTED
        ↓
READY_TO_DISPENSE
        ↓
NOT_STARTED
```

Button styles:

| Status | Button Text | Color |
|---------|-------------|-------|
| NOT_STARTED | Not Started | Grey |
| STARTED | Started | Yellow / Orange |
| READY_TO_DISPENSE | Ready to Dispense | Green |

---

## Dispense Button

The modal contains a **DISPENSE** button.

Default state:

Disabled

The button becomes enabled only when **every medicine item** has reached the status:

```
READY_TO_DISPENSE
```

Selecting **DISPENSE** navigates to the Billing section.

---

# Billing Modal

The Billing screen consists of three sections.

---

## Section 1 - Patient Details

Displays:

- Patient Information
- Visit Information
- Doctor Notes

Doctor notes are read-only.

---

## Section 2 - Printable Bill

Displays a printable bill layout.

Each medicine row displays:

- Medicine Name
- Strength
- Dose
- Frequency
- Price

The bottom of the bill displays:

- Doctor Fee
- Medicine Total
- Discount
- Grand Total

The layout should resemble a printable invoice.

---

## Section 3 - Receive Payment

Displays:

- Total Amount Due
- Amount Received (editable)
- Calculated Change

Example:

```
Total Due

Rs. 2,350

Amount Received

Rs. 3,000

Change

Rs. 650
```

Buttons:

- Confirm Payment

The system automatically calculates the balance/change.

---

# Billing Modal Footer

Buttons:

- BACK (White)
- PRINT (Orange)
- DONE (Primary Blue)

---

## BACK

Returns to the Medicine Preparation modal.

---

## PRINT

Prints the bill/receipt.

---

## DONE

Completes the dispensing workflow.

Actions performed:

- Close modal.
- Clear current preparation state.
- Automatically load the next oldest waiting prescription into the **Currently Serving** card.
- Re-enable all **Dispense Now** buttons.

The pharmacist is now available to begin dispensing the next patient.

---

# Business Rules

## Current Serving

The Currently Serving card always displays the oldest prescription that:

- belongs to today
- has status = ISSUED
- has not yet been dispensed

---

## Single Active Dispensing

Only one dispensing workflow can exist at a time.

Once preparation has started:

- Dispense Now buttons become disabled.
- Pharmacist must complete the workflow before starting another patient.

---

## Continue Dispense

If the preparation modal is closed accidentally:

- preparation progress is preserved in sessionStorage
- the Currently Serving card displays:

```
Continue Dispense
```

instead of

```
Start Preparing
```

Selecting it resumes the workflow.

This preparation progress is **not persisted in the backend**.

Preparation progress survives:
- Page navigation (e.g., switching between reception and dispensing tasks)
- Browser refresh

Preparation progress is cleared when:
- The browser tab is closed
- The browser is closed
- The dispensing workflow is completed (DONE is selected)

---

## View Prescription

Read-only.

No editing.

No dispensing.

No billing.

---

## Preparation State

Preparation state exists only in the frontend.

It is intentionally **not stored** in the backend.

---

## Automatic Next Patient

After completing payment and selecting **DONE**:

1. Current patient is removed from Currently Serving.
2. Next oldest ISSUED prescription automatically becomes the new Currently Serving patient.

No manual selection is required.

---

# Stock Management

## Stock Batches

Stock batches are records of medicine received from distributors.

They serve as:
- Historical records of supply transactions
- Reference for inventory tracking
- Audit trail for medicine sourcing

Stock batches have **no direct relationship** to prescriptions or dispensing.

## Medicine Quantity

Each medicine has a single flat `quantity` field representing current available stock.

When dispensing:
- The system decrements `Medicine.quantity` directly
- No batch-level allocation or tracking occurs
- If insufficient quantity is available, dispensing is blocked with an error

Example error:

```
Only 21 tablets available.

Required: 30 tablets.

Dispensing cannot continue.
```

The pharmacist must resolve the inventory issue before dispensing can continue.

---

# UX Goals

- One patient at a time.
- Minimal clicks.
- Fast preparation.
- Easy cashier workflow.
- Printable invoice.
- Automatic queue progression.
- Reduced dispensing mistakes.
- Clean modern pharmacy workflow.

-----------------


# Prescription Dispensing - Business Rules

## Version
1.0

---

# Purpose

This document defines the business rules governing the Prescription Dispensing workflow.

These rules ensure pharmacists follow a controlled, predictable, and safe dispensing process while maintaining a simple user experience.

---

# BR-001 - Current Serving Prescription

The system shall always identify one prescription as the **Current Serving** prescription.

Selection rules:

- Prescription Status must be **ISSUED**
- Prescription must belong to the current business day
- Prescription must not already be dispensed
- Oldest issued prescription has the highest priority

The Current Serving card is automatically populated by the system.

---

# BR-002 - One Active Dispensing Session

Only **one active dispensing session** may exist per tenant at any given time.

Once medicine preparation begins:

- no other prescription can be started
- the pharmacist must either complete the workflow or continue the existing one

This prevents dispensing multiple prescriptions simultaneously across all users in the tenant.

---

# BR-003 - Dispense Now Availability

The **Dispense Now** action is available only when there is **no active dispensing session**.

When preparation begins:

- every Dispense Now button becomes disabled

After the dispensing workflow is completed:

- all Dispense Now buttons become enabled again

---

# BR-004 - Manual Patient Selection

The pharmacist may manually choose a patient by selecting **Dispense Now**.

This action replaces the automatically selected Current Serving prescription.

However, manual selection is permitted only before preparation has started.

Once preparation begins, patient switching is not allowed.

---

# BR-005 - Start Preparing

If no preparation has been started for the Current Serving prescription:

The primary action shall be

```
💊 Start Preparing
```

Selecting this action opens the Medicine Preparation workflow.

---

# BR-006 - Continue Dispense

If medicine preparation was started but not completed:

The primary action shall become

```
Continue Dispense
```

Selecting this action resumes the dispensing workflow from the previous point.

---

# BR-007 - Preparation Progress

Preparation progress shall remain available during the active browser session.

If the preparation modal is closed accidentally:

- progress is preserved in sessionStorage
- reopening Continue Dispense resumes the workflow

Preparation progress survives:
- Page navigation within the application
- Browser refresh

Preparation progress is cleared when:
- The browser tab is closed
- The browser is closed
- The dispensing workflow is completed (DONE is selected)

---

# BR-008 - Preparation Persistence

Medicine preparation status shall **NOT** be persisted in the backend.

The preparation workflow exists purely as a frontend user experience using sessionStorage.

This allows pharmacists to navigate between different pages (e.g., reception tasks) and resume dispensing without losing progress, while keeping the backend clean and avoiding temporary database records.

---

# BR-009 - Medicine Ordering

The backend shall return medicine items already sorted.

Sorting Priority:

1. Frequency (Highest → Lowest)

- 3x/day
- 2x/day
- 1x/day

2. Quantity (Highest → Lowest)

No visual grouping is required.

Only ordering matters.

---

# BR-010 - Preparation Status

Each medicine has a temporary preparation status.

Allowed values:

- NOT_STARTED
- STARTED
- READY_TO_DISPENSE

These values are UI-only states.

---

# BR-011 - Preparation Status Cycle

Each click on the status button cycles through the following order.

```
NOT_STARTED

↓

STARTED

↓

READY_TO_DISPENSE

↓

NOT_STARTED
```

The pharmacist may move both forward and backward simply by continuing to click.

---

# BR-012 - Dispense Button Enablement

The DISPENSE button is disabled by default.

The button becomes enabled only when:

Every medicine item has reached

```
READY_TO_DISPENSE
```

Any medicine returning to another status immediately disables the DISPENSE button.

---

# BR-013 - Billing Transition

Selecting DISPENSE transitions the workflow into Billing.

No additional validation screens are required.

---

# BR-014 - Billing Information

The billing screen shall display:

- Patient Details
- Visit Details
- Doctor Notes
- Printable Bill
- Payment Section

Doctor Notes are read-only.

---

# BR-015 - Printable Bill

The printable bill shall display:

- Doctor Fee
- Prescribed Medicines
- Strength
- Dose
- Frequency
- Price
- Discount
- Grand Total

The layout should resemble a printable invoice.

---

# BR-016 - Payment Calculation

The pharmacist enters:

Amount Received

The system automatically calculates:

```
Change

=

Amount Received

-

Grand Total
```

The pharmacist does not manually calculate change.

---

# BR-017 - Payment Completion

The pharmacist confirms payment from the Billing screen.

Successful payment enables completion of the dispensing workflow.

---

# BR-018 - Done Action

Selecting DONE performs the following actions:

- closes the billing modal
- clears the frontend preparation state
- completes the dispensing workflow
- enables all Dispense Now buttons
- automatically loads the next waiting prescription into Current Serving

---

# BR-019 - Automatic Queue Progression

After successful completion of dispensing:

The next oldest ISSUED prescription automatically becomes the new Current Serving prescription.

No manual refresh is required.

---

# BR-020 - View Prescription

View Prescription opens a read-only popup.

The pharmacist may:

- review medicines
- review doctor instructions

The pharmacist may not:

- edit
- prepare
- dispense
- modify billing

---


# BR-025 - Frontend Session Scope

The preparation workflow exists only during the active browser session.

It is intentionally independent of backend persistence.

This allows the dispensing workflow to remain lightweight while avoiding unnecessary temporary database records.

---

# BR-026 - Primary UX Principles

The dispensing workflow is designed around the following principles:

- One patient at a time
- Minimal pharmacist decision-making
- Fast medicine preparation
- Reduced dispensing errors
- Automatic queue progression
- Simple payment experience
- Printable billing
- Consistent workflow from preparation to payment
- Session-resilient preparation (survives page navigation)