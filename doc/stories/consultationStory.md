We have now resolved the visual layout rules, mapped the state changes to your exact parameters, and closed all behavioral logic gaps.

Here is the complete, comprehensive, production-ready specification for the **Doctor Consultation Workspace**. This document is optimized for AI developer agents to implement your frontend screens perfectly without making assumptions.

---

# User Story: Unified Doctor Consultation Workspace (Frontend Specification)

## Story Overview

**As a** Doctor

**I want to** operate within a single, distraction-free, top-to-bottom clinical workspace

**So that** I can review patient history, capture clinical findings, construct valid prescriptions with dynamic stock checks, manage billing recalculations, and automatically transition to the next patient in line.

---

## 1. System States & Initialization Workflows

### Phase 1: The Idle Queue Display (Default State)

* **Trigger**: App boot or completion of a prior consultation.
* **UI Layout**: The entire interactive consultation container is unmounted/hidden. The screen displays a centralized Material UI (MUI) card context layout containing:
* **Next Patient Banner**: Displays read-only text fields summarizing the next patient in line: `First Name`, `Last Name`, `Age`, `Gender`, and `Queue Number`.
* **"Start Consulting" Button**: A primary, high-visibility MUI Action Button.


* **Data Sequence**:
1. The frontend executes a `GET /queue?doctorId={doctorId}` call.


2. The engine reads index `0` of the returned array payload (filtering for entries with status `WAITING` or `CHECKED_IN`).


3. If the queue array is empty, the button is disabled, and the banner reads *"No patients currently waiting in queue"*.



---

### Phase 2: Consultation Initiation Cascade

Clicking the **"Start Consulting"** button kicks off an asynchronous sequence. Each step must succeed before rendering the workspace:

```
[Click: Start Consulting]
         │
         ▼
 1. PATCH /queue/{id}/start ──────────────────► [Transitions Queue Status to IN_PROGRESS]
         │ (On 200 OK)
         ▼
 2. GET /visits?patientId={id} ───────────────► [Fetches Historical Patient Records]
         │ (On 200 OK)
         ▼
 3. POST /prescriptions ──────────────────────► [Instantiates Active Prescription Envelope]
         │ (On 200 OK)
         ▼
[Unmount Idle Screen & Render Workspace Layout]

```

---

## 2. Component Layout & Interaction Rules

### Block 1: Active Patient Header Block

* **Visual Elements**: Displays a permanent top ribbon showing the currently active patient data: *"You are currently consulting: [First Name] [Last Name], [Age], Last Visit Date: [Date]"* alongside a prominent circular badge tracking the current `Queue Number`.

### Block 2: Past Visits Accordion Component

* **Behavior**: Default state is **CLOSED** (collapsed) to optimize vertical display layout.
* **Expanded Content**: Maps a read-only MUI Data Table tracking past visit items returned by `GET /visits`.


* **Sorting**: Hardcoded chronological formatting displaying the **most recent visit first**.

### Block 3: Clinical Notes Documentation Space

* **Behavior**: A large multi-line text input field allowing the doctor to capture signs, symptoms, and diagnostic observations.
* **Validation Rule**: **Can send empty notes section.** If the field remains blank, the frontend passes an empty string `""` to the database during finalization.

### Block 4: Inline Prescription Builder Matrix

A clean interface containing a search bar followed by a matrix of prescription line rows.

* **Medicine Autocomplete Field**: Connected to `GET /medicines`. Selecting a record injects a new draft row below it.


* **Interactive Row Form Controls**:
1. **Medicine Name & Strength**: Read-only text indicator string.
2. **Dosage**: Input text field (e.g., `"1 tablet"`).


3. **Frequency**: An editable Creatable MUI Combobox field. It contains two default quick-select tokens: `"After meals"` and `"Before meals"`, but allows the doctor to input custom free-text strings.
4. **Duration Days**: A numeric integer input box (e.g., `5`).


5. **Qty Prescribed (Auto-Calculating Element)**: Frontend logic automatically multiplies units inferred from dosage $\times$ frequency calculations $\times$ duration days count.


* **Live Safety Check**: If `Qty Prescribed` exceeds the static remaining quantity field returned by the backend medicine object, display an inline warning label in bright red: **`"Stock unavailable. Current Available qty: [X]"`**
* **Row Command Buttons**:
* **Confirm Button (Checkmark Icon)**: Commits the item row to the server database by calling `POST /prescriptions/{id}/items`.


* **Edit Button (Pencil Icon)**: Re-enables input row fields to modify dosage details. *(Note: Backend endpoints for editing prescription items must be developed to support this action).*
* **Delete Button (Trashcan Icon)**: Removes the row from view. If the item was already committed, it calls a deletion endpoint. *(Note: Backend endpoints for deleting prescription items must be developed to support this action).*


* **State Override Interactivity**: Adding, editing, or deleting any prescription row forces the **Billing & Discounts Section to completely hide**, and **re-enables the "Confirm Prescription & Calculate Bill" button** to prevent outdated data submission.

---

### Block 5: Financial Calculation & Adjustments Interface

#### State A: Pre-Calculation Layout

* The billing metrics data table remains hidden.
* **Guiding Text Block**: Displays a clean MUI typography component stating exactly: **`"Please add prescription items and click 'Confirm Prescription & Calculate Bill' to review billing & discounts section"`**

#### State B: Post-Calculation Layout

Clicking **"Confirm Prescription & Calculate Bill"** fires a `POST /bills/{billId}/calculate` request. Upon success, the guiding text unmounts, revealing the full billing matrix:

| Element | Input Properties | Display Evaluation Type |
| --- | --- | --- |
| **Doctor Fee** | Non-editable text box | Displays static raw base fee value (e.g., `1500.00`)

 |
| **Doctor Discount %** | Numeric input range (`0` to `100`) | Multiplies calculation formulas locally on the frontend |
| **Medicine Cost** | Non-editable text box | Displays aggregate sum returned from `/calculate` API

 |
| **Pharmacy Discount %** | Numeric input range (`0` to `100`) | Multiplies calculation formulas locally on the frontend |
| **Total Bill Amount (LKR)** | Read-Only Calculated Output | Updates locally dynamically using live frontend estimates |

* **Button Lock Logic**: Once clicked, the **"Confirm Prescription & Calculate Bill"** button enters a `disabled` state. It will only reactivate if a prescription line item is added, changed, or deleted.

---

## 3. The Finalization Cascade ("Complete Consultation & Send Prescription")

When the primary completion button is pressed, the frontend executes the following sequential network requests using client-side async state handling:

```
[Click: Complete Consultation & Send Prescription]
                         │
                         ▼
   1. POST /visits/{visitId}/notes  ─────────────► [Saves raw string data from text area]
                         │
                         ▼
   2. PUT /bills/{billId}/discounts ─────────────► [Pushes final doctor/pharmacy percentages]
                         │
                         ▼
   3. POST /bills/{billId}/calculate  ───────────► [Forces server-side transaction balance sync]
                         │
                         ▼
   4. PUT /prescriptions/{id}/status ────────────► [Locks changes by setting status: "ISSUED"]
                         │
                         ▼
   5. PATCH /queue/{queueId}/serve ──────────────► [Sets queue status to COMPLETED]
                         │
                         ▼
[Trigger Post-Consultation Success Modal]

```

---

## 4. Global Resilience Rules (Error Handling & Modals)

### Unified Network Error Handling

* **Architecture Standard**: If any API response returns a validation failure (`400`), resource missing error (`404`), or database failure (`500`), the network interceptor block must immediately capture the message string.


* **Display Component**: Render the exact error message dynamically inside a float-positioned **MUI Alert Snackbar** component positioned at the bottom-left area of the active viewport layout.

### Post-Consultation Completion Modal Banner

Upon a successful cascade completion, display an inescapable modal overlay (reuse existing modal component) across the workspace:

* **Header**: `"Consultation Finished"`
* **Body Text**: `"Queue number <<X>> finished serving. Prescription sent to pharmacist."`
* **Action Button**: `"CLOSE"`
* **Teardown Routine**: Clicking the close action button completely resets all local state values, unmounts the active session panel container, and returns the workspace loop smoothly back to **Phase 1 (The Idle Queue display Screen)** to handle the next patient in sequence.