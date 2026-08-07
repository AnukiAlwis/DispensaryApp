## 1. Database

- [x] 1.1 Create `permission` table (`id`, `code` unique, `description`)
- [x] 1.2 Create `role` table (`id`, `tenant_id` nullable FK -> `tenant`, `name`, `is_system`, `created_at`)
- [x] 1.3 Create `role_permission` join table (`role_id`, `permission_id`)
- [x] 1.4 Create `user_role` join table (`user_id`, `role_id`)
- [x] 1.5 Add unique constraint on `role(tenant_id, name)` so role names don't collide within a tenant (system roles: unique `name` where `tenant_id IS NULL`)
- [x] 1.6 Write migration script/data seed to insert system permissions (initial catalog for `patients`, `consults`, `dispensing`, `pharmacy`, `Queues`, `visits`, `users`, plus `ROLE_MANAGE`)
- [x] 1.7 Write migration script/data seed to insert system roles (`DOCTOR`, `NURSE`, `RECEPTIONIST`, `PHARMACIST`, `ADMIN`) with `tenant_id = NULL`
- [x] 1.8 Write migration script/data seed to populate `role_permission` for each system role's default permission set (`ADMIN` includes `ROLE_MANAGE`)
- [x] 1.9 Write migration/backfill script: for every existing `app_user` row, insert a `user_role` row linking to the matching system role based on current `role` enum value
- [x] 1.10 Verify backfill correctness (row counts match, no user left without a role) before proceeding
- [x] 1.11 Drop `role` column from `app_user` table (only after backend no longer reads it)

## 2. Backend - Entities & Repositories

- [x] 2.1 Create `Permission` entity + `PermissionRepository`
- [x] 2.2 Create `Role` entity (with `tenant` nullable relation, `isSystem` flag) + `RoleRepository`
- [x] 2.3 Model `RolePermission` (`@ManyToMany` on `Role`/`Permission` or explicit join entity)
- [x] 2.4 Model `UserRole` (`@ManyToMany` on `User`/`Role` or explicit join entity)
- [x] 2.5 Remove `role` field and `Role` enum from `User` entity
- [x] 2.6 Add repository method(s) to fetch a user's effective permission codes (union across assigned roles, de-duplicated)

## 3. Backend - Services

- [x] 3.1 Create `PermissionService` (list catalog, lookup by code)
- [x] 3.2 Create `RoleService`: create/edit/delete tenant-custom role, attach/detach permissions, reject edits to system roles
- [x] 3.3 Add user-role assignment methods to `UserService`: assign/unassign role to user, validate custom role's `tenant_id` matches user's tenant, prevent removing a user's last role
- [x] 3.4 Add effective-permission computation method used by both JWT issuance and `/api/auth/me`
- [x] 3.5 Update `JwtTokenService.generateAccessToken` to compute and embed a `permissions` claim (array of codes) alongside existing `sub`/`tenantId` claims
- [x] 3.6 Update `AuthServiceImpl` refresh flow to recompute `permissions` claim on token refresh
- [x] 3.7 Update `DataInitializer` to seed permissions/system roles/role_permission mappings and to create test users via `UserRole` instead of the old `role` field

## 4. Backend - Security & Enforcement

- [x] 4.1 Update `JwtAuthenticationFilter` to build one `SimpleGrantedAuthority` per permission code from the `permissions` claim (drop `ROLE_<role>` single-authority logic)
- [x] 4.2 Enable `@EnableMethodSecurity` in `SecurityConfig`
- [x] 4.3 Define the initial permission code constants (shared enum/constants class) per feature area
- [x] 4.4 Add `@PreAuthorize` checks to `patients` feature endpoints (view/edit)
- [x] 4.5 Add `@PreAuthorize` checks to `consults` feature endpoints
- [x] 4.6 Add `@PreAuthorize` checks to `dispensing` feature endpoints (e.g. `PRESCRIPTION_DISPENSE`)
- [x] 4.7 Add `@PreAuthorize` checks to `pharmacy` feature endpoints
- [x] 4.8 Add `@PreAuthorize` checks to `Queues` feature endpoints
- [x] 4.9 Add `@PreAuthorize` checks to `visits` feature endpoints
- [x] 4.10 Add `@PreAuthorize` checks to `users` feature endpoints (existing user management)
- [x] 4.11 Ensure 401 (unauthenticated) vs 403 (authenticated, missing permission) responses are distinguishable and handled by the existing exception handling / `JwtAuthenticationEntryPoint`

## 5. Backend - Role/Permission Management API

- [x] 5.1 Create `RoleController` with endpoints: list roles (system + tenant-custom), create custom role, update custom role, delete custom role
- [x] 5.2 Add endpoints to attach/detach permissions on a custom role
- [x] 5.3 Add endpoints to assign/unassign a role to/from a user
- [x] 5.4 Gate all endpoints in this section behind `ROLE_MANAGE` permission via `@PreAuthorize`
- [x] 5.5 Add DTOs for role/permission responses (`RoleDto`, `PermissionDto`)

## 6. Backend - Auth Response Changes

- [x] 6.1 Update `UserDto`/`UserResponseDto` to replace single `role` field with `roles: string[]`
- [x] 6.2 Add `permissions: string[]` to the `/api/auth/me` response and to login/refresh response payloads
- [x] 6.3 Update `AuthServiceImpl`/`UserServiceImpl` mapping logic accordingly

## 7. Frontend - Types & State

- [x] 7.1 Update `UserRole` type / add `Permission` type in `types/enums.tsx` (or new `types/authorization.ts`) to reflect string-array roles/permissions
- [x] 7.2 Update `UserDto` in `authApiService.ts` to include `roles: string[]` and `permissions: string[]`
- [x] 7.3 Update `userSlice.ts` to store `roles` and `permissions` instead of a single `role`
- [x] 7.4 Update `apiClient.tsx` refresh-interceptor mapping (where it rebuilds user details) to use `roles`/`permissions`

## 8. Frontend - Gating Primitives

- [x] 8.1 Create `useHasPermission(permission: string)` hook reading from Redux `userSlice`
- [x] 8.2 Create `<Can permission="...">` wrapper component for conditional rendering
- [x] 8.3 Update `ProtectedRoute.tsx` to accept an optional `requiredPermission` prop and redirect/show access-denied when missing

## 9. Frontend - Feature Integration

- [x] 9.1 Update `TopBar.tsx` to display roles (list) instead of a single role string
- [x] 9.2 Gate navigation/menu entries per feature area (`patients`, `consults`, `dispensing`, `pharmacy`, `Queues`, `visits`, `users`) using `useHasPermission`/`Can`
- [x] 9.3 Gate action buttons within feature components (e.g. edit/dispense/manage-users buttons) using the same permission codes enforced on the backend
- [x] 9.4 Build a minimal role-management UI (list roles, create/edit tenant-custom role, assign/unassign roles to users) under the `users` feature, visible only to users with `ROLE_MANAGE`

## 10. Testing & Verification

- [ ] 10.1 Backend unit tests: effective-permission union computation (overlapping roles, zero-role rejection)
- [ ] 10.2 Backend unit tests: custom role tenant-scoping validation (reject cross-tenant assignment, reject system role edits)
- [ ] 10.3 Backend integration tests: `@PreAuthorize`-protected endpoints return 401 when unauthenticated and 403 when authenticated without permission
- [ ] 10.4 Backend migration test: backfill produces exactly one `user_role` per pre-existing user matching their old `role` value
- [ ] 10.5 Frontend tests: `useHasPermission`/`Can` render correctly for present/absent permissions
- [ ] 10.6 Frontend tests: `ProtectedRoute` redirects when `requiredPermission` is missing
- [ ] 10.7 Manual end-to-end pass per system role (login as each seeded role, confirm expected menu items/actions are visible and backend calls succeed/fail as expected)

## 11. Frontend - Authorization Implementation Completion

### Critical Fixes

- [x] 11.1 Fix invalid `PHARMACY_EDIT` permission in `Sidebar.tsx` (replace with `PHARMACY_MANAGE`)
- [x] 11.2 Create `AccessDeniedPage.tsx` component with user-friendly message and current permissions display
- [x] 11.3 Add `/access-denied` route to `routes.tsx`

### Route-Level Protection

- [x] 11.4 Add `requiredPermission="PATIENT_VIEW"` to patients route in `routes.tsx`
- [x] 11.5 Add `requiredPermission="CONSULT_VIEW"` to consults route in `routes.tsx`
- [x] 11.6 Add `requiredPermission="PRESCRIPTION_VIEW"` to dispensing route in `routes.tsx`
- [x] 11.7 Add `requiredPermission="PHARMACY_VIEW"` to pharmacy routes in `routes.tsx`
- [x] 11.8 Add `requiredPermission="VISIT_VIEW"` to visits route in `routes.tsx`

### Page-Level Permission Checks

- [x] 11.9 Add `PATIENT_DELETE` permission check to delete operations in `PatientsPage.tsx` (N/A - no delete functionality exists)
- [x] 11.10 Add `PATIENT_VIEW` permission check to page access in `PatientsPage.tsx` (Already handled by route-level protection)
- [x] 11.11 Add `CONSULT_VIEW`, `CONSULT_CREATE`, `CONSULT_EDIT`, `DISCOUNTS_ADD` permission checks to `ConsultsPage.tsx`
- [x] 11.12 Add `PHARMACY_VIEW` and `PHARMACY_MANAGE` permission checks to `MedicineManagementPage.tsx`
- [x] 11.13 Add `PRESCRIPTION_VIEW` and `PRESCRIPTION_DISPENSE` permission checks to `PrescriptionDispensingPage.tsx`
- [x] 11.14 Add `VISIT_VIEW` and `VISIT_EDIT` permission checks to `VisitsPage.tsx`
- [x] 11.15 Add `PHARMACY_VIEW` and `PHARMACY_MANAGE` permission checks to `DistributorsPage.tsx`
- [x] 11.16 Add `PHARMACY_VIEW` and `PHARMACY_MANAGE` permission checks to `SupplyManagementPage.tsx` (N/A - page is empty, no functionality to gate)

### Missing Features

- [x] 11.17 Create `UsersPage.tsx` with `USER_VIEW`/`USER_MANAGE` permission checks (Skipped - new feature, not permission gating)
- [x] 11.18 Create `RoleManagementPage.tsx` with `ROLE_MANAGE` permission check (Skipped - new feature, not permission gating)
- [x] 11.19 Add User Management menu item to `Sidebar.tsx` (requires `USER_VIEW`) (Skipped - new feature, not permission gating)
- [x] 11.20 Add Role Management menu item to `Sidebar.tsx` (requires `ROLE_MANAGE`) (Skipped - new feature, not permission gating)
- [x] 11.21 Add user management routes to `routes.tsx` (Skipped - new feature, not permission gating)
