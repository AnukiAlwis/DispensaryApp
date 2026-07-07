# AI Start Guide — Doctor Dispensary Application

> Generated from a full review of `README.md`, `doc/TASK.md`, `doc/stories/MainStory.md`, `doc/API-Documentation.md`, and the source trees of `dispensapro/` (frontend) and `dispensary/` (backend).
> Use this document as the entry point for any new development session (human or AI).

---

## 1. What Is Currently Developed

The system is a **multi-tenant clinic/dispensary management app** with two apps in one monorepo:

- `@/d:\my\doctor-dispensary-application-2.1\dispensary` — Spring Boot 3.5.5 / Java 21 REST backend.
- `@/d:\my\doctor-dispensary-application-2.1\dispensapro` — React 19 + TypeScript + MUI v7 frontend.

### Backend — ~95% complete (functionally)

Located at `@/d:\my\doctor-dispensary-application-2.1\dispensary\src\main\java\com\anucode\dispensary`.

- **12 REST controllers** covering the full domain: `PatientController`, `VisitController`, `VisitNoteController`, `QueueController`, `PrescriptionController`, `MedicineController`, `DistributorController`, `SupplyController`, `DispenseController`, `BillController`, `UserController`, `TenantController`.
- **Entities, DTOs, repos, services** fully fleshed out for all of the above (`entities/`, `dtos/`, `repos/`, `services/` each have 15–31 files).
- **Multi-tenancy**: `config/TenantContext.java` + `filters/TenantFilter.java` implement per-request tenant isolation (tenant likely passed via header, resolved into a request-scoped context).
- **Database**: H2 in **file mode** (`./data/dispensary`, `MODE=MYSQL`), NOT in-memory as the root `README.md` incorrectly states. Schema auto-updates (`ddl-auto=update`), so data persists across restarts in `dispensary/data/`.
- **CORS**: configured via `config/CorsConfig.java`, allowed origin `http://localhost:3000` (frontend dev server).
- **Security**: `spring-boot-starter-security` is a dependency, but `config/SecurityConfig.java` currently **permits all requests** (`.anyRequest().permitAll()`), CSRF disabled. There is **no authentication/authorization enforced yet** — this is a placeholder pending Phase 5 (see §2).
- Business rules verified per `doc/TASK.md`: 1 queue entry per patient/doctor/day, 1 visit → 1 prescription → many items, auto bill creation, discount support (incl. 100% free service).
- Only one backend test file exists: `DispensaryApplicationTests.java` (context-load smoke test) — **no real unit/integration test coverage**.

### Frontend — ~40% complete

Located at `@/d:\my\doctor-dispensary-application-2.1\dispensapro\src`.

**Working end-to-end (UI + hooks/services wired to backend):**
- **Patients** (`features/patients`) — full CRUD, search, validation.
- **Medicines** (`features/pharmacy/pages/MedicineManagementPage.tsx`) — add/search/stock alerts.
- **Distributors** (`features/pharmacy/pages/DistributorsPage.tsx`) — full CRUD/search.
- **Visits** (`features/visits`) — listing by patient, today/old separation.
- Shared building blocks: `components/` (DataTable, DialogModal, Forms), `layouts/AppLayout.tsx` + `Sidebar.tsx` + `TopBar.tsx`/`TopSummaryBar.tsx`, `store.tsx` + `store/` (Redux Toolkit), `services/apiClient.tsx` (Axios wrapper).

**Stubbed / partial:**
- `features/Queues/` — has `hooks/` and `services/` + `types.ts`, but **no `pages/` or `components/` implementations** (empty dirs). Not routed.
- `features/consults/pages/ConsultsPage.tsx` — **167-byte placeholder page** only.
- `features/pharmacy/pages/SupplyManagementPage.tsx` — **131-byte empty placeholder**, though it is wired into `routes.tsx` at `/pharmacy/supply`.

**Not started at all:**
- Authentication (no `features/auth` folder exists).
- Prescription UI, Billing/Payment UI, Dispensing UI, Visit Notes UI, Queue UI, User Management UI, Reports.

**Routing** (`@/d:\my\doctor-dispensary-application-2.1\dispensapro\src\routes.tsx`): only `/patients`, `/visits`, `/consults`, `/pharmacy/medicine`, `/pharmacy/distributors`, `/pharmacy/supply` are registered. Root `/` redirects to `/patients`. No login route, no route guarding.

---

## 2. Where Development Stopped (Incomplete / In-Progress Work)

Per `doc/TASK.md` ("Current Implementation Status" + "Development Tasks"), the project stopped **right after finishing basic Patient/Medicine/Distributor/Visit-listing CRUD on the frontend**, before touching the clinical workflow screens. In priority order, the next unfinished features are:

1. **Queue Management UI** (`Task 1.1`) — hooks/services exist but zero UI. This is the officially declared "immediate priority" / starting point.
2. **Prescription Management Interface** (`Task 1.2`) — no code exists yet.
3. **Visit Notes Interface** (`Task 1.3`) — no code exists yet.
4. **Medicine Dispensing Interface** (`Task 1.4`) — no code exists yet.
5. **Billing Interface + Discount Management** (`Phase 2`) — no code exists yet.
6. **Supply Management completion** (`Phase 3`) — page is a stub, needs full form + stock batch UI.
7. **User Management + Reports** (`Phase 4`) — not started.
8. **Authentication (JWT, login, protected routes)** (`Phase 5`) — explicitly deferred; backend `SecurityConfig` permits all, no login page in frontend.

**Root-cause note:** the backend is essentially feature-complete for all these workflows (APIs already exist per `doc/API-Documentation.md`), so the incomplete part is purely frontend UI + wiring, not backend logic.

---

## 3. How to Start the Project & Confirm It Works

### Prerequisites
- Java 21 (pom.xml specifies `<java.version>21</java.version>` — note this differs from the root `README.md`, which says Java 17; trust the `pom.xml`).
- Node.js 18+
- Maven wrapper is bundled (`mvnw` / `mvnw.cmd`), no separate Maven install required.

### Step 1 — Start the backend
```powershell
cd dispensary
./mvnw.cmd spring-boot:run
```
- Runs on **http://localhost:8080**.
- H2 console: **http://localhost:8080/h2-console** (JDBC URL `jdbc:h2:file:./data/dispensary`, user `sa`, blank password).
- DB file persists in `@/d:\my\doctor-dispensary-application-2.1\dispensary\data`.
- Confirm it's working: hit any GET endpoint, e.g. `http://localhost:8080/api/patients` (check `doc/API-Documentation.md` for exact base path/prefix used by controllers) — should return `200 OK` with JSON (possibly empty array) instead of a connection error.

### Step 2 — Start the frontend
```powershell
cd dispensapro
npm install
npm start
```
- Runs on **http://localhost:3000**.
- Create `.env` in `dispensapro/` if not present:
  ```
  REACT_APP_API_BASE_URL=http://localhost:8080/api
  ```
- Confirm it's working: browser opens to `/patients`, the sidebar renders, and Patients list loads without network errors in devtools console (proves CORS + API wiring is correct).

### Step 3 — Sanity checks
- **Backend tests**: `cd dispensary && ./mvnw.cmd test` (only the Spring context-load test currently exists — should pass trivially).
- **Frontend tests**: `cd dispensapro && npm test` (only the default CRA `App.test.tsx` exists).
- **Multi-tenant check**: since `TenantFilter` enforces tenant context, verify what header/param it expects (read `@/d:\my\doctor-dispensary-application-2.1\dispensary\src\main\java\com\anucode\dispensary\filters\TenantFilter.java`) and confirm the frontend `apiClient.tsx` sends it — otherwise API calls may 400/403.

---

## 4. Where to Start Development / Development Plan

Follow `doc/TASK.md`'s existing roadmap — it is well-structured and still accurate. Recommended order:

### Immediate next step: Task 1.1 — Queue Management UI
- Build under `dispensapro/src/features/Queues/pages/` and `components/` (folders already scaffolded, empty):
  - `QueueManagementPage.tsx`, `QueueStatusBadge.tsx`, `QueueActionButtons.tsx`, `QueueCard.tsx`.
- Wire to existing `features/Queues/hooks` and `features/Queues/services`.
- Add route `queue` (or similar) to `@/d:\my\doctor-dispensary-application-2.1\dispensapro\src\routes.tsx` and a sidebar link in `Sidebar.tsx`.
- API endpoints already available per `doc/TASK.md`: `GET /queue?doctorId={id}`, `PATCH /queue/{id}/check-in|start|serve|no-show|remove`.

### Subsequent order (Phase 1 → Phase 4, as detailed in `doc/TASK.md`):
1. **Task 1.2** Prescription Management Interface.
2. **Task 1.3** Visit Notes Interface.
3. **Task 1.4** Medicine Dispensing Interface.
4. **Task 2.1 / 2.2** Billing Interface + Discount Management.
5. **Task 3.1** Complete Supply Management (replace the empty `SupplyManagementPage.tsx`).
6. **Task 4.1 / 4.2** User Management + Reports.
7. **Task 5.1** Authentication — deliberately last; add JWT login, `AuthProvider`, `ProtectedRoute`, and switch backend `SecurityConfig` from `permitAll()` to real role-based rules only once the UI flows are stable (avoids blocking manual testing during active feature dev).

### Practical guidance while building each feature
- Reuse existing shared components (`DataTable`, `DialogModal`, form patterns) from `dispensapro/src/components/` instead of rewriting.
- Keep the feature-first folder convention (`features/<name>/{pages,components,hooks,services}`).
- Cross-check exact request/response shapes in `@/d:\my\doctor-dispensary-application-2.1\doc\API-Documentation.md` before wiring a new service call — it documents all 48+ backend endpoints.
- After each feature, add it to `routes.tsx` and `Sidebar.tsx`, and update `doc/TASK.md` status markers (✅/🚧/❌) to keep the roadmap accurate.
- Add tests as you go — both frontend and backend currently have near-zero real test coverage, which is a project risk called out implicitly by the near-empty test suites.

---

## 5. Known Documentation Discrepancies (flagged during this review)

- Root `README.md` says backend uses Java 17 and H2 **in-memory** DB — actual `pom.xml` uses **Java 21**, and `application.properties` uses H2 **file-mode** persistent storage. Trust the code over `README.md` for these details, and consider updating `README.md`.
- `README.md` also lists auth (JWT + RBAC) as an implemented "Security Feature," but it is not enforced — `SecurityConfig` currently permits all requests. Treat auth as **not implemented**.
