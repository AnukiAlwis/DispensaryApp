## Context

See `proposal.md` - Why. Relevant current-state constraints:

- `User` has a single FK to `Tenant` (one tenant per user, enforced by a unique constraint on `tenant_id + username`). This does not change.
- `User.role` is a single-value Java enum (`DOCTOR`, `NURSE`, `RECEPTIONIST`, `PHARMACIST`, `ADMIN`), stored as a string column.
- JWT access tokens are RS256, 10-minute expiry, carrying `sub` (userId), `tenantId`, and `role` claims (`JwtTokenService`). Refresh tokens are opaque, tracked server-side (per the `authentication` change's `RefreshSession`).
- `JwtAuthenticationFilter` builds exactly one `SimpleGrantedAuthority("ROLE_" + role)` per request from the token claim.
- `SecurityConfig` has no method security enabled and no per-endpoint authorization rules beyond `anyRequest().authenticated()`.
- `TenantContext` (thread-local) already carries `tenantId` and `currentUserId` per request.

## Goals / Non-Goals

**Goals:**
- Replace the single-role enum with a role/permission model supporting multiple roles per user.
- Support a seeded, non-editable system role catalog plus optional tenant-scoped custom roles.
- Enforce permissions on the backend as the source of truth; mirror the same data on the frontend for UX gating.
- Keep the existing single-tenant-per-user model and existing JWT/refresh token mechanics intact (extend, don't replace).

**Non-Goals:**
- No multi-tenant user membership (a user still belongs to exactly one tenant).
- No platform-level super-admin tier above tenants.
- No attribute-based or row-level access control beyond what tenant scoping already provides (e.g. no "can only edit patients they created" rules in this change).
- No UI redesign beyond adding permission gating to existing components.

## Decisions

### 1. Role and Permission become DB entities, not enums
`Role` (`id`, `tenant_id` nullable, `name`, `is_system`) and `Permission` (`id`, `code`, `description`) replace `User.Role`. `RolePermission` and `UserRole` are join tables (`@ManyToMany` with explicit or implicit join entities).

**Why**: Tenant-custom roles require a queryable, mutable role catalog. An enum can't be extended per tenant at runtime.
**Alternative considered**: Keep the enum for system roles and bolt on a separate "custom role" concept only for tenants. Rejected — two parallel role concepts (enum + table) would complicate permission-union logic and every consumer of "what roles does this user have" for no real benefit, since system roles fit naturally as `Role` rows with `tenant_id = NULL`.

### 2. Custom role's tenant_id must match the assigning user's tenant
Enforced in the service layer (not just a DB constraint) when creating a `UserRole`: if `role.tenant_id` is not null, it must equal `user.tenant_id`.

**Why**: Prevents cross-tenant role assignment while keeping `UserRole` simple (no redundant `tenant_id` column needed on the join table itself, since it's always derivable from either side).

### 3. Permissions are denormalized into the JWT access token
At login and at refresh, the backend computes the user's effective permission set (union across assigned roles) and embeds it as a `permissions` claim (array of permission codes). `JwtAuthenticationFilter` converts each into a `SimpleGrantedAuthority` (no `ROLE_` prefix, since these are permissions, not roles).

**Why**: Access tokens already expire every 10 minutes, so staleness after a permission change is bounded and short. Avoids adding a permission-lookup cache/DB round trip on every request.
**Alternative considered**: Look up permissions from DB (with a cache) on every request. Rejected for now — adds infra (cache invalidation) for a marginal freshness improvement over an already-short 10-minute window. Revisit if access token TTL is lengthened later.
**Trade-off accepted**: A user whose role/permissions are revoked keeps old access until their token expires or they explicitly log out. Documented in the `user-role-assignment` spec as the "bounded time" requirement.

### 4. Enforcement via Spring method security (`@PreAuthorize`), not URL matchers
`SecurityConfig` enables `@EnableMethodSecurity`. Each protected controller/service method gets `@PreAuthorize("hasAuthority('X')")` at the point of action.

**Why**: `SecurityConfig`'s `anyRequest().authenticated()` is coarse and many endpoints need different permissions for different HTTP methods/actions on the same path (e.g. view vs. edit a patient). Method-level annotations keep the permission requirement next to the business logic they protect, which is easier to audit per feature.
**Alternative considered**: Centralize all rules as URL pattern matchers in `SecurityConfig`. Rejected — becomes an unreadable, hard-to-maintain list as the permission catalog grows across `patients`, `consults`, `dispensing`, `pharmacy`, `Queues`, `visits`, `users`.

### 5. Role/permission management is itself permission-gated
Managing tenant-custom roles (create/edit/delete, attach/detach permissions, assign/unassign roles to users) requires a dedicated `ROLE_MANAGE` permission, granted by default only to the seeded `ADMIN` system role.

**Why**: Prevents privilege escalation by any role other than the tenant's own admin; keeps the bootstrap story simple (every tenant already gets an `ADMIN` user via existing seeding/onboarding).

### 6. Migration of existing single-role data
`DataInitializer` (and/or a one-time migration step) seeds the system `Role`/`Permission`/`RolePermission` rows, then for every existing `app_user` row creates one `UserRole` linking to the `Role` matching their current enum value, before the `role` column is dropped.

**Why**: Preserves existing users' access exactly as-is at cutover; no manual re-assignment needed for the initial rollout.

## Risks / Trade-offs

- **[Risk] Revoked permissions remain valid until token expiry (≤10 min) or logout.** → Mitigation: documented as an accepted, bounded-time behavior (see Decision 3 and the `user-role-assignment` spec); can be tightened later with server-side permission lookups if a shorter revocation window becomes a requirement.
- **[Risk] Broad `@PreAuthorize` rollout is easy to miss on some endpoints, leaving gaps.** → Mitigation: `tasks.md` breaks this out feature-by-feature (patients, consults, dispensing, pharmacy, queues, visits, users) so each area is reviewed explicitly instead of relying on a blanket rule.
- **[Risk] Migrating `app_user.role` → `UserRole` in place is a breaking schema change.** → Mitigation: migration seeds roles and backfills `UserRole` before dropping the `role` column, executed as ordered steps (see Migration Plan).
- **[Risk] Frontend permission gating drifts out of sync with backend checks over time.** → Mitigation: permission codes are treated as the single shared vocabulary between backend `@PreAuthorize` annotations and frontend `useHasPermission` checks; backend remains authoritative per the `permission-enforcement` spec regardless of frontend state.

## Migration Plan

1. Add new tables (`permission`, `role`, `role_permission`, `user_role`) alongside the existing `app_user.role` column (additive, non-breaking).
2. Seed system permissions and system roles (with their default `role_permission` mappings) via `DataInitializer` or a migration script.
3. Backfill `user_role` for every existing `app_user` row based on their current `role` enum value.
4. Deploy backend changes that read from `UserRole`/effective permissions (JWT claim, `@PreAuthorize`) while the old `role` column still exists but is no longer read.
5. Verify effective permissions match prior single-role behavior for existing users (each system role's permission set should preserve current implicit access).
6. Drop the `app_user.role` column and the `User.Role` enum.
7. Roll out frontend changes consuming `roles`/`permissions` from `/api/auth/me`.

Rollback: steps 1-3 are additive and safe to leave in place if rollback is needed before step 6; rolling back after step 6 (column drop) requires restoring the column from the `user_role` backfill data (inverse mapping is deterministic only if each user still has exactly one role at rollback time).

## Open Questions

- Exact initial permission catalog per feature area (`patients`, `consults`, `dispensing`, `pharmacy`, `Queues`, `visits`, `users`) — to be finalized during task breakdown/implementation per feature, not blocking the overall design.
