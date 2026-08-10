## Why

Authentication (login, JWT, refresh) is implemented, but the system has no real authorization: `SecurityConfig` only requires a request to be authenticated (`anyRequest().authenticated()`), and the JWT's single `role` claim is never checked anywhere. Any logged-in user, regardless of role, can call any endpoint. The `User.role` field is also a hardcoded single-value enum, so a user can only ever hold one role and there is no concept of permissions at all. Frontend has no gating either — `role` is display-only text.

We need real permission-based authorization: multiple roles per user, roles composed of permissions, a seeded system role catalog plus optional tenant-custom roles, and enforcement on both backend (source of truth) and frontend (UX gating using the same permission set).

## What Changes

- **BREAKING**: Replace `User.role` (single enum column) with a many-to-many `UserRole` assignment. Existing single-role values are migrated into equivalent seeded system roles.
- Introduce `Permission` as a global, code-defined catalog of fine-grained capabilities (e.g. `PATIENT_EDIT`, `PRESCRIPTION_DISPENSE`).
- Introduce `Role` as a DB entity (replacing the enum): `tenant_id = NULL` marks a seeded **system role** (available to every tenant); `tenant_id = <tenant>` marks a **tenant-custom role** created by that tenant's admin.
- Introduce `RolePermission` join mapping roles to permissions, and `UserRole` join mapping users to one or more roles.
- A user's effective permission set is the union of permissions across all of their assigned roles, computed server-side.
- JWT access tokens carry a denormalized `permissions` claim (list of permission codes) in addition to existing `sub`/`tenantId` claims, recomputed on every login/refresh so revocation lag is bounded by the existing 10-minute access token expiry.
- **BREAKING**: `JwtAuthenticationFilter` grants one `SimpleGrantedAuthority` per permission code (no `ROLE_` prefix) instead of a single `ROLE_<role>` authority.
- `SecurityConfig` enables Spring method security; controller/service methods add `@PreAuthorize("hasAuthority('...')")` checks at the point of action.
- `GET /api/auth/me` (and login/refresh responses) return `roles: string[]` (display) and `permissions: string[]` (gating) for the current user.
- New admin-only endpoints for tenant-scoped custom role management (create/edit a custom role, attach/detach permissions, assign/unassign roles to users) — gated behind a `ROLE_MANAGE` permission.
- Frontend: `userSlice` stores `roles`/`permissions`; a `useHasPermission` hook and `<Can permission="...">` component gate menu items, buttons, and routes; `ProtectedRoute` accepts an optional `requiredPermission` prop.

## Capabilities

### New Capabilities
- `role-permission-management`: Defines the permission catalog, role entity (system + tenant-custom), role-permission mapping, and admin operations for managing tenant-custom roles and permission assignments.
- `user-role-assignment`: Defines how one or more roles are assigned to a user, how effective permissions are derived (union across roles), and how that assignment surfaces via the JWT and `/api/auth/me`.
- `permission-enforcement`: Defines how the backend enforces permissions on protected operations (method-level checks) and how the frontend consumes the same permission set to show/hide features.

### Modified Capabilities
- None. `role-based-authorization` was named in the `authentication` change's proposal but never archived into `openspec/specs/` (no implementation beyond a single-role JWT claim exists), so there is no existing spec to delta against. This change's `permission-enforcement` capability supersedes that intent from scratch.

## Impact

- **Backend entities**: `User.java` (remove `role` field), new `Role.java`, `Permission.java`, `RolePermission.java` (or `@ManyToMany`), `UserRole.java` (or `@ManyToMany`).
- **Backend services**: `JwtTokenService` (add `permissions` claim), `UserServiceImpl`, new `RoleService`/`PermissionService` for role/permission CRUD and effective-permission computation.
- **Backend filters/config**: `JwtAuthenticationFilter` (authority derivation), `SecurityConfig` (`@EnableMethodSecurity`), controllers across `patients`, `consults`, `dispensing`, `pharmacy`, `Queues`, `visits`, `users` features add `@PreAuthorize` checks.
- **Backend data**: `DataInitializer` reseeds system roles/permissions and migrates existing users; new tables `role`, `permission`, `role_permission`, `user_role`; `app_user.role` column dropped.
- **Frontend**: `authApiService.ts`/`UserDto` (add `roles`, `permissions`), `userSlice.ts`, `ProtectedRoute.tsx`, `TopBar.tsx`, new `useHasPermission` hook / `Can` component, feature components across `src/features/*` add permission-gated rendering.
- **Breaking changes**: existing `User.role` enum column and single-authority JWT claim are removed; any code reading `user.role` as a single value must migrate to `roles`/`permissions` arrays.
