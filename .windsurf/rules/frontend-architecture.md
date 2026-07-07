---
trigger: glob
description: Architecture, folder structure, and coding conventions for the dispensapro React frontend
globs: dispensapro/**/*.{ts,tsx,css}
---

# DispensaPro Frontend Rules

Stack: React 19 + TypeScript, MUI v7 (`@mui/material`, `@mui/icons-material`, `@emotion/*`), Redux Toolkit + `react-redux`, `react-router-dom` v7, `axios`, `react-hot-toast`, CRA (`react-scripts`).

## Folder Structure (feature-based / vertical slice)

```
src/
  features/<feature>/
    components/   # feature-scoped UI (forms, cards, etc.)
    hooks/        # feature-scoped React hooks (data fetching/state)
    pages/        # route-level page components
    services/     # API calls for this feature (axios wrappers)
    types.ts      # feature-scoped TypeScript interfaces
  components/     # shared, cross-feature UI primitives (Button, Input, DataTable, DialogModal, ElevatedCard)
  layouts/        # app shell (AppLayout, Sidebar, TopBar, TopSummaryBar)
  services/       # shared services (apiClient.tsx - axios instance)
  store/          # Redux slices (e.g. userSlice.ts)
  store.tsx       # Redux store configuration + RootState/AppDispatch types
  hooks/          # app-wide hooks (useAuth)
  utils/          # small pure helpers (formatDate, showSnackbar)
  types/          # app-wide types/enums
  routes.tsx      # centralized react-router route definitions
```

- **New features** go under `src/features/<featureName>/` following the same 5-part structure (`components`, `hooks`, `pages`, `services`, `types.ts`). Do not scatter feature code into `src/components` or `src/utils`.
- **Shared/reusable UI** (used by 2+ features) belongs in `src/components/`, not duplicated per feature.
- Feature folders are named after the domain noun in singular/plural as already established (e.g. `patients`, `visits`, `pharmacy`, `Queues`, `users`, `consults`) — match existing casing in that folder, don't rename.

## Naming Conventions

- **Components**: PascalCase file + default export, e.g. `PatientForm.tsx`, `DataTable.tsx`.
- **Hooks**: camelCase prefixed with `use`, one file per hook or closely related hook group, e.g. `usePatients.ts`, `useCreateVisit` inside `useVisit.ts`.
- **Services**: camelCase object named `<feature>Service`, e.g. `patientService`, exported as a plain object of async functions (`getAll`, `getById`, `create`, `update`, `delete`).
- **Types**: PascalCase interfaces in a feature's `types.ts`, imported via relative path `../types`.

## Data Fetching Pattern

- All HTTP calls go through the shared `apiClient` (`src/services/apiClient.tsx`), never call `axios` directly in components/hooks.
- Each feature's `services/<feature>Service.ts` wraps `apiClient` calls and returns typed data (`res.data`), one method per REST operation (`getAll`, `getById`, `create`, `update`, `delete`).
- Each feature's `hooks/use<Feature>.ts` wraps the service: owns `useState` for data/loading/selected-item, exposes CRUD action functions, and triggers an initial fetch via `useEffect`. Pages call these hooks — pages never call services directly.
- Errors: rely on `apiClient`'s response interceptor which calls `showSnackbar` automatically; only add local `try/catch` when you need to update local state (e.g. close a modal) or suppress the global snackbar via `x-suppress-snackbar` header.

## Component / Page Pattern

- **Pages** (`pages/<Feature>Page.tsx`) are the composition root for a route: pull data via the feature hook, manage local UI state (`open`, `editing<Item>`, `search`), render `ElevatedCard` + `DataTable` + `DialogModal`, and define `columns`/`customActions` for `DataTable` inline.
- **Forms** live in `components/<Feature>Form.tsx`: accept `initialValues`, `onSubmit`, and any needed foreign keys as props; keep their own local `useState` for form fields; call `onSubmit(values)` on submit (parent page handles create vs edit branching and refetching).
- Use MUI components directly (`Box`, `TextField`, `Button`, `Typography`, `MenuItem`, `CircularProgress`) with MUI's `sx` prop for styling — avoid new global CSS files unless replicating a layout-level pattern like `Sidebar.css`/`TopSummaryBar.css`.
- Prefer the shared `src/components/Button.tsx`, `Input.tsx`, `DataTable.tsx`, `DialogModal.tsx`, `ElevatedCard.tsx` over ad hoc MUI usage when an equivalent shared component exists.
- `formik` and `yup` are project dependencies for forms with schema validation — prefer them over manual `useState`-based forms in **new** complex forms; simple forms may continue the existing controlled-input pattern to stay consistent with `PatientForm`/`CreateVisitForm`.

## State Management

- **Redux Toolkit** (`store.tsx` + `store/<name>Slice.ts`) is only for genuinely global/cross-feature state (e.g. logged-in user in `userSlice`). Register new slices in `store.tsx`'s `reducer` map.
- Local/page/feature state stays in component `useState`/feature hooks — do not lift feature-local state into Redux.
- Access Redux state with `useSelector((state: RootState) => ...)`, typed via `RootState` from `../../../store` (path depends on depth).

## Routing

- All routes are declared centrally in `src/routes.tsx` using `createBrowserRouter`, nested under the `AppLayout` element.
- New pages: import the page component at the top of `routes.tsx` and add a `{ path, element }` entry under the `AppLayout` children array. Do not create routers/route definitions elsewhere.

## Imports

- Use relative imports consistent with existing depth (e.g. `../../../services/apiClient`, `../../../components/ElevatedCard`); no path aliases are configured.
- Group imports: external libraries first, then internal absolute-ish relative imports (components, hooks, types) — match ordering seen in existing files (MUI/react imports, then local imports).

## Misc

- Multi-tenant header `X-Tenant-ID` and future auth token attachment are centralized in `apiClient.tsx`'s request interceptor — never set these headers ad hoc in individual service calls.
- Use `dayjs` for date manipulation and `src/utils/formatDate.tsx` for display formatting instead of native `Date` formatting.
- Use `showSnackbar` from `src/utils/showSnackbar.tsx` for toast notifications instead of importing `react-hot-toast` directly in feature code.
