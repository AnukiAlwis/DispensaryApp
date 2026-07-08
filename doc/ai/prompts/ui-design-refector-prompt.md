You are working inside an existing React 19 + TypeScript + MUI v7 clinic/pharmacy admin application.

## Objective
Redesign the current UI of the patient and visit workflows to match a modern, clean, professional healthcare admin dashboard style, using the attached reference image as the visual direction.

The redesign must upgrade the UI/UX while preserving the existing application behavior, routing, data flow, API calls, business logic, and domain workflows.

---

# Primary UI Reference
Use the attached UI mockup image as the main design direction for:
- spacing
- layout hierarchy
- card styling
- modern table layout
- dialogs/modals
- patient list page
- visits page
- patient check-in flow
- add patient form

Do not attempt a pixel-perfect clone if the current code structure needs adaptation. Instead, create a production-quality implementation strongly inspired by the provided reference image.

Important Note : DO NOT change Top summary bar (Today's Summary bar) according to the reference image. keep it as it is.
---

# Tech / implementation constraints
- Frontend stack: React 19 + TypeScript + MUI v7
- Keep the app fully in MUI; do not introduce Tailwind, Chakra, Bootstrap, Ant, or any other UI framework
- Prefer reusable MUI-based components instead of large page-local JSX blocks
- start refactoring from already available reusable components
- Preserve all existing business logic and workflows
- Preserve current routes, query params, page behavior, and API integrations unless a UI-specific refactor requires moving code without changing behavior
- Preserve accessibility and keyboard usability
- Do not break existing forms, validation, submit handlers, or mutation flows
- Do not remove existing functionality

---

# Important non-functional rules
1. Do NOT change backend contracts or payload shapes unless absolutely required for UI-only reasons, and if so, document it clearly.
2. Do NOT rename domain models casually.
3. Do NOT break navigation between Patients -> Visits -> Check-In -> Visit actions.
4. Keep the codebase maintainable: create reusable components and avoid giant files.
5. Prefer composition over duplication.
6. Use TypeScript types properly.
7. Keep visual consistency across pages.
8. Do not introduce fake placeholder data in production components unless the current UI already uses mock data.
9. If some existing components are too messy, refactor them carefully while preserving behavior.

---

# Scope of redesign
Refactor the UI for the following areas:

## 1. App shell polish
Improve the shared app shell styling where relevant:
- sidebar visual hierarchy
- active navigation state
- top app bar spacing / alignment
- page content spacing
- surface/background consistency

Do not redesign unrelated modules deeply unless needed for consistency.

---

## 2. Patients list page
Redesign the Patients page to feel like a professional clinic admin screen.

### Requirements
- Keep the page functionality intact
- Add a proper page header area:
  - title
  - subtitle/description
  - primary Add Patient action
- Do not touch the “Today’s Summary” / KPI area 
- Redesign the patient list container into a cleaner card/surface
- Add a proper table toolbar area with:
  - search
  - filters if applicable
  - action alignment
- Improve patient row presentation
- Improve action buttons/icons styling
- Improve table spacing, row height, header hierarchy, hover states

### Desired visual structure
- Page header
- KPI cards row
- Table toolbar
- Patient table card

---

## 3. Add Patient dialog / modal
Redesign the Add Patient modal into a polished production-quality form dialog.

### Requirements
- Keep existing create-patient behavior intact
- Use a clean dialog layout with:
  - dialog title
  - optional short subtitle/description
  - grouped form sections
  - proper footer actions
- Group fields into meaningful sections such as:
  - Basic Information
  - Contact Information
- Use a responsive layout:
  - 2-column layout on desktop where appropriate
  - stacked layout on smaller screens
- Improve spacing, labels, footer button layout, and visual hierarchy
- Replace generic “Submit” wording with something clearer if appropriate, while preserving behavior

---

## 4. Visits page
Redesign the patient visits page to look like a patient-focused workspace.

### Requirements
- Preserve current visit data and interactions
- Add a cleaner patient header summary area showing key patient details
- DO NOT touch the “Today’s Visits” section
- Improve the visit history section
- Use cards/sections to separate “today” vs “history”
- Improve action buttons and status presentation
- If the current page has sparse one-row tables for today’s visit, consider a more compact visit summary card presentation while preserving data and actions

---

## 5. Patient Check-In dialog / modal
Redesign the patient check-in workflow modal to feel like a guided professional workflow.

### Requirements
- Keep current check-in behavior intact
- Preserve patient search / selection behavior
- Redesign the modal into a cleaner flow:
  - search/select patient
  - show selected patient + visit preview/details
  - show queue/check-in state clearly
  - clear primary action area
- Improve the “already checked in” state
- Improve the success/queue assignment presentation
- If possible, keep the success state within the same modal flow instead of making it feel like a disconnected raw popup, unless the existing architecture strongly requires a separate modal

---

## 6. Queue assigned / check-in success UI
Improve the success UI after check-in.

### Requirements
- Make it feel intentional and polished
- Highlight queue number clearly
- Show patient / doctor / status / checked-in time in a compact success card
- Use good visual hierarchy and semantic color usage

---

# Design system direction
Create or refine a small reusable design system inside the codebase so the redesigned pages share the same visual language.

## Add or improve reusable components where appropriate
Examples:
- PageHeader
- MetricCard
- SectionCard
- StatusChip
- PatientIdentityCell
- DataTableToolbar
- FormDialog layout helpers
- QueueBadge / QueueCard
- VisitSummaryCard

Do not create abstraction for its own sake; only create reusable pieces that improve maintainability.

---

# Visual design guidance
Target a clean healthcare admin product style:
- calm, modern, trustworthy, efficient
- soft gray page background
- white cards/surfaces
- subtle borders
- restrained shadows
- rounded corners
- strong spacing rhythm
- consistent typography hierarchy
- clear status chips
- compact but breathable data tables
- polished dialogs

### Preferred visual characteristics
- MUI Card / Paper surfaces with subtle shadows and borders
- 12–20px radii depending on component type
- modern form fields with consistent height and spacing
- better button alignment and hierarchy
- professional table header styling
- improved modal width, padding, and footer layout
- semantic chips for statuses like OPEN / BOOKED / ARRIVED & WAITING / ACTIVE / INACTIVE

---

# Theme work
Inspect the current MUI theme setup. If the app does not already have a strong shared theme, improve it.

## Theme goals
- establish a clean palette for primary / background / text / border / success / warning
- standardize border radius
- standardize card styling
- standardize button styling
- standardize text field styling
- standardize table styling
- standardize dialog styling

Keep the theme maintainable and avoid over-engineering.

---

# Refactor strategy
Before making changes:
1. Inspect the current relevant pages and components for:
   - Patients page
   - Add Patient dialog
   - Visits page
   - Check-In dialog / related modals
   - shared layout components
   - theme files
2. Identify which files are currently responsible for these UIs
3. Create a concise implementation plan
4. Then apply the redesign

---

# Output expectations
I want you to actually modify the code, not just describe ideas.

## Please do the following in order:
1. Identify the relevant files and summarize what you found
2. Propose the redesign/refactor plan
3. Implement the redesign in code
4. Show a concise summary of files changed
5. Explain any assumptions or places where current code structure limited the redesign

---

# Important guardrails
- Preserve functionality first, improve UI second
- Do not remove working business logic
- Do not silently change data behavior
- If you need to split a large component into smaller files, do it carefully
- Keep imports clean and avoid dead code
- Make the resulting UI look close in quality and layout language to the attached reference image

Now inspect the current codebase and begin the redesign implementation.