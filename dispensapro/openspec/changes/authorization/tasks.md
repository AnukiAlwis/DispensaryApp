## 1. Database

- [ ] 1.1 Create `permission` table (`id`, `code` unique, `description`)
- [ ] 1.2 Create `role` table (`id`, `tenant_id` nullable FK -> `tenant`, `name`, `is_system`, `created_at`)
- [ ] 1.3 Create `role_permission` join table (`role_id`, `permission_id`)
- [ ] 1.4 Create `user_role` join table (`user_id`, `role_id`)
- [ ] 1.5 Add unique constraint on `role(tenant_id, name)` so role names don't collide within a tenant (system roles: unique `name` where `tenant_id IS NULL`)
- [ ] 1.6 Write migration script/data seed to insert system permissions (initial catalog for `patients`, `consults`, `dispensing`, `pharmacy`, `Queues`, `visits`, `users`, plus `ROLE_MANAGE`)
- [ ] 1.7 Write migration script/data seed to insert system roles (`DOCTOR`, `NURSE`, `RECEPTIONIST`, `PHARMACIST`, `ADMIN`) with `tenant_id = NULL`
- [ ] 1.8 Write migration script to populate `role_permission` for each system role's default permission set (`ADMIN` includes `ROLE_MANAGE`)
- [ ] 1.9 Write migration/backfill script: for every existing `app_user` row, insert a `user_role` row linking to the matching system role based on current `role` enum value
- [ ] 1.10 Verify backfill correctness (row counts match, no user left without a role) before proceeding
- [ ] 1.11 Drop `role` column from `app_user` table (only after backend no longer reads it)

## 2. Backend - Entities & Repositories

- [ ] 2.1 Create `Permission` entity + `PermissionRepository`
- [ ] 2.2 Create `Role` entity (with `tenant` nullable relation, `isSystem` flag) + `RoleRepository`
- [ ] 2.3 Model `RolePermission` (`@ManyToMany` on `Role`/`Permission` or explicit join entity) 
- [ ] 2.4 Model `UserRole` (`@ManyToMany` on `User`/`Role` or explicit join entity)
- [ ] 2.5 Remove `role` field and `Role` enum from `User` entity
- [ ] 2.6 Add repository method(s) to fetch a user's effective permission codes (union across assigned roles, de-duplicated)

## 3. Backend - Services

- [ ] 3.1 Create `PermissionService` (list catalog, lookup by code)
- [ ] 3.2 Create `RoleService`: create/edit/delete tenant-custom role, attach/detach permissions, reject edits to system roles
- [ ] 3.3 Add user-role assignment methods to `UserService`: assign/unassign role to user, validate custom role's `tenant_id` matches user's tenant, prevent removing a user's last role
- [ ] 3.4 Add effective-permission computation method used by both JWT issuance and `/api/auth/me`
- [ ] 3.5 Update `JwtTokenService.generateAccessToken` to compute and embed a `permissions` claim (array of codes) alongside existing `sub`/`tenantId` claims
- [ ] 3.6 Update `AuthServiceImpl` refresh flow to recompute `permissions` claim on token refresh
- [ ] 3.7 Update `DataInitializer` to seed permissions/system roles/role_permission mappings and to create test users via `UserRole` instead of the old `role` field

## 4. Backend - Security & Enforcement

- [ ] 4.1 Update `JwtAuthenticationFilter` to build one `SimpleGrantedAuthority` per permission code from the `permissions` claim (drop `ROLE_<role>` single-authority logic)
- [ ] 4.2 Enable `@EnableMethodSecurity` in `SecurityConfig`
- [ ] 4.3 Define the initial permission code constants (shared enum/constants class) per feature area
- [ ] 4.4 Add `@PreAuthorize` checks to `patients` feature endpoints (view/edit)
- [ ] 4.5 Add `@PreAuthorize` checks to `consults` feature endpoints
- [ ] 4.6 Add `@PreAuthorize` checks to `dispensing` feature endpoints (e.g. `PRESCRIPTION_DISPENSE`)
- [ ] 4.7 Add `@PreAuthorize` checks to `pharmacy` feature endpoints
- [ ] 4.8 Add `@PreAuthorize` checks to `Queues` feature endpoints
- [ ] 4.9 Add `@PreAuthorize` checks to `visits` feature endpoints
- [ ] 4.10 Add `@PreAuthorize` checks to `users` feature endpoints (existing user management)
- [ ] 4.11 Ensure 401 (unauthenticated) vs 403 (authenticated, missing permission) responses are distinguishable and handled by the existing exception handling / `JwtAuthenticationEntryPoint`

## 5. Backend - Role/Permission Management API

- [ ] 5.1 Create `RoleController` with endpoints: list roles (system + tenant-custom), create custom role, update custom role, delete custom role
- [ ] 5.2 Add endpoints to attach/detach permissions on a custom role
- [ ] 5.3 Add endpoints to assign/unassign a role to/from a user
- [ ] 5.4 Gate all endpoints in this section behind `ROLE_MANAGE` permission via `@PreAuthorize`
- [ ] 5.5 Add DTOs for role/permission responses (`RoleDto`, `PermissionDto`)

## 6. Backend - Auth Response Changes

- [ ] 6.1 Update `UserDto`/`UserResponseDto` to replace single `role` field with `roles: string[]`
- [ ] 6.2 Add `permissions: string[]` to the `/api/auth/me` response and to login/refresh response payloads
- [ ] 6.3 Update `AuthServiceImpl`/`UserServiceImpl` mapping logic accordingly

## 7. Frontend - Types & State

- [ ] 7.1 Update `UserRole` type / add `Permission` type in `types/enums.tsx` (or new `types/authorization.ts`) to reflect string-array roles/permissions
- [ ] 7.2 Update `UserDto` in `authApiService.ts` to include `roles: string[]` and `permissions: string[]`
- [ ] 7.3 Update `userSlice.ts` to store `roles` and `permissions` instead of a single `role`
- [ ] 7.4 Update `apiClient.tsx` refresh-interceptor mapping (where it rebuilds user details) to use `roles`/`permissions`

## 8. Frontend - Gating Primitives

- [ ] 8.1 Create `useHasPermission(permission: string)` hook reading from Redux `userSlice`
- [ ] 8.2 Create `<Can permission="...">` wrapper component for conditional rendering
- [ ] 8.3 Update `ProtectedRoute.tsx` to accept an optional `requiredPermission` prop and redirect/show access-denied when missing

## 9. Frontend - Feature Integration

- [ ] 9.1 Update `TopBar.tsx` to display roles (list) instead of a single role string
- [ ] 9.2 Gate navigation/menu entries per feature area (`patients`, `consults`, `dispensing`, `pharmacy`, `Queues`, `visits`, `users`) using `useHasPermission`/`Can`
- [ ] 9.3 Gate action buttons within feature components (e.g. edit/dispense/manage-users buttons) using the same permission codes enforced on the backend
- [ ] 9.4 Build a minimal role-management UI (list roles, create/edit tenant-custom role, assign/unassign roles to users) under the `users` feature, visible only to users with `ROLE_MANAGE`

## 10. Testing & Verification

- [ ] 10.1 Backend unit tests: effective-permission union computation (overlapping roles, zero-role rejection)
- [ ] 10.2 Backend unit tests: custom role tenant-scoping validation (reject cross-tenant assignment, reject system role edits)
- [ ] 10.3 Backend integration tests: `@PreAuthorize`-protected endpoints return 401 when unauthenticated and 403 when authenticated without permission
- [ ] 10.4 Backend migration test: backfill produces exactly one `user_role` per pre-existing user matching their old `role` value
- [ ] 10.5 Frontend tests: `useHasPermission`/`Can` render correctly for present/absent permissions
- [ ] 10.6 Frontend tests: `ProtectedRoute` redirects when `requiredPermission` is missing
- [ ] 10.7 Manual end-to-end pass per system role (login as each seeded role, confirm expected menu items/actions are visible and backend calls succeed/fail as expected)
