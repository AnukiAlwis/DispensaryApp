# Authorization Story

## 1. Background and Goals
- **Business need:** Implement a flexible, fine-grained authorization system that supports multi-tenant SaaS operations while maintaining healthcare data security requirements.
- **Constraints:** Multi-tenant isolation, role-based access control (RBAC), permission-based operations, ability to create custom roles per tenant, protection of system-defined roles.
- **Strategy:** Implement a permission-based RBAC system with system roles for standard healthcare positions and custom tenant-specific roles for specialized needs.

## 2. Core Authorization Requirements

The authorization system implements the following core requirements:

| Requirement | Status | Implementation Details |
|-------------|--------|----------------------|
| **Multi-tenant** | ✅ Implemented | User and Role entities have tenant relationships; unique constraints on `(tenant_id, username)` and `(tenant_id, role_name)`; TenantContext used throughout backend |
| **Multiple roles per user** | ✅ Implemented | User entity has `Set<Role> roles` with many-to-many relationship via `user_role` table; RoleController has assign/unassign role endpoints |
| **Tenant-specific roles** | ✅ Implemented | System roles: `tenant = null` (global); Custom roles: `tenant` assigned (tenant-specific); RoleService separates `getSystemRoles()` and `getTenantRoles()` |
| **Global permissions** | ✅ Implemented | 18 predefined permissions defined in `Permissions` class; Permissions are global (not tenant-specific); Stored in `permission` table with unique codes |
| **Roles map to permissions** | ✅ Implemented | Role entity has `Set<Permission> permissions`; Many-to-many relationship via `role_permission` table; RoleService methods to attach/detach permissions |
| **User can have multiple roles assigned** | ✅ Implemented | User entity supports multiple roles via `Set<Role>`; Role assignment API endpoints available |
| **Users inherit the union of permissions from all assigned roles** | ✅ Implemented | `AuthServiceImpl.computeEffectivePermissions()` computes union: `user.getRoles().stream().flatMap(role -> role.getPermissions().stream()).map(Permission::getCode).distinct().collect(Collectors.toList())` |
| **Backend checks permissions** | ✅ Implemented | `@PreAuthorize` annotations on all controller methods; `JwtAuthenticationFilter` extracts permissions from JWT and sets as authorities; Spring Security enforces `hasAuthority()` checks |
| **Frontend uses the same permissions to show or hide features** | ⚠️ Partially Implemented | Infrastructure exists (`useHasPermission` hooks, `<Can>` component, `ProtectedRoute` with `requiredPermission`) but limited usage across application; only `PatientsPage.tsx` currently uses permission-based UI control |

## 3. Current State Snapshot (August 2026)

### Backend Authorization Architecture

#### Permission Model
- **Permissions** are defined as granular capabilities (e.g., `PATIENT_VIEW`, `CONSULT_CREATE`, `PHARMACY_MANAGE`)
- Stored in `permission` table with unique `code` and `description`
- 18 predefined permissions covering all system features:
  - Patients: `PATIENT_VIEW`, `PATIENT_EDIT`, `PATIENT_DELETE`
  - Consultations: `CONSULT_VIEW`, `CONSULT_CREATE`, `CONSULT_EDIT`
  - Dispensing: `PRESCRIPTION_DISPENSE`, `PRESCRIPTION_VIEW`
  - Pharmacy: `PHARMACY_MANAGE`, `PHARMACY_VIEW`
  - Queues: `QUEUE_MANAGE`, `QUEUE_VIEW`
  - Visits: `VISIT_VIEW`, `VISIT_EDIT`
  - Users: `USER_MANAGE`, `USER_VIEW`
  - Roles: `ROLE_MANAGE`
  - Billing: `BILL_VIEW`, `BILL_MANAGE`
  - Discounts: `DISCOUNTS_ADD`

#### Role Model (Source of Truth)
The following role-permission mappings are the authoritative source of truth for default system roles:

| Permission | ADMIN | DOCTOR | NURSE | PHARMACIST | RECEPTIONIST |
|------------|-------|--------|-------|------------|--------------|
| PATIENT_VIEW | ✅ | ✅ | ✅ | ✅ | ✅ |
| PATIENT_EDIT | ❌ | ✅ | ✅ | ❌ | ✅ |
| PATIENT_DELETE | ❌ | ✅ | ✅ | ❌ | ✅ |
| VISIT_VIEW | ❌ | ✅ | ✅ | ✅ | ✅ |
| VISIT_EDIT | ❌ | ✅ | ✅ | ✅ | ✅ |
| QUEUE_VIEW | ❌ | ✅ | ❌ | ❌ | ✅ |
| QUEUE_MANAGE | ❌ | ✅ | ✅ | ❌ | ✅ |
| CONSULT_VIEW | ❌ | ✅ | ❌ | ❌ | ❌ |
| CONSULT_CREATE | ❌ | ✅ | ❌ | ❌ | ❌ |
| CONSULT_EDIT | ❌ | ✅ | ❌ | ❌ | ❌ |
| DISCOUNTS_ADD | ❌ | ✅ | ❌ | ❌ | ❌ |
| PRESCRIPTION_VIEW | ❌ | ✅ | ❌ | ✅ | ❌ |
| PRESCRIPTION_DISPENSE | ❌ | ❌ | ❌ | ✅ | ❌ |
| PHARMACY_VIEW | ❌ | ✅ | ❌ | ✅ | ❌ |
| PHARMACY_MANAGE | ❌ | ❌ | ❌ | ✅ | ❌ |
| BILL_VIEW | ❌ | ❌ | ❌ | ❌ | ❌ |
| BILL_MANAGE | ❌ | ❌ | ❌ | ❌ | ❌ |
| USER_VIEW | ✅ | ✅ | ✅ | ✅ | ✅ |
| USER_MANAGE | ✅ | ❌ | ❌ | ❌ | ❌ |
| ROLE_MANAGE | ✅ | ❌ | ❌ | ❌ | ❌ |

**System Roles** are predefined roles with fixed permissions, shared across all tenants:
- **ADMIN**: User management, role management, patient viewing (4 permissions)
- **DOCTOR**: Full patient management, consultations, visits, discounts, queue management, prescription viewing, pharmacy viewing(medicine view), user viewing (14 permissions)
- **NURSE**: Patient management, visit management, queue management, user viewing (7 permissions)
- **PHARMACIST**: Prescription viewing and dispensing, pharmacy management, pharmacy viewing, patient viewing, visit management, user viewing (8 permissions)
- **RECEPTIONIST**: Patient management, visit management, queue viewing and management, user viewing (8 permissions)

**Custom Roles**: Tenant-specific roles that can be created, modified, and deleted
- Associated with a specific tenant (`tenant_id` not null)
- `isSystem = false`
- Can have any combination of permissions
- Cannot modify or delete system roles

#### User-Role Assignment
- Users have many-to-many relationship with roles via `user_role` table
- A user can have multiple roles (both system and custom)
- Permissions are computed as the union of all permissions from assigned roles
- Role assignment is tenant-scoped (users belong to a specific tenant)

#### Authorization Enforcement
- **Method-level security**: Using Spring Security's `@PreAuthorize` annotations on controller methods
  - Example: `@PreAuthorize("hasAuthority('PATIENT_EDIT')")`
- **JWT-based**: Permissions are embedded in JWT access token claims
- **Filter-based**: `JwtAuthenticationFilter` extracts permissions from JWT and sets them as Spring Security authorities
- **Tenant isolation**: All authorization checks respect tenant context from JWT

### Frontend Authorization Architecture

#### Permission Storage
- User permissions stored in Redux `userSlice` state
- Permissions populated from login/refresh API responses
- Includes both role names and permission codes

#### Permission Hooks
- `useHasPermission(permission)`: Check if user has specific permission
- `useHasAnyPermission(permissions[])`: Check if user has at least one of the permissions
- `useHasAllPermissions(permissions[])`: Check if user has all specified permissions
- `usePermissions()`: Get array of user's permissions
- `useRoles()`: Get array of user's role names

#### Permission Components
- `<Can>` component for conditional rendering based on permissions
- Supports single permission, multiple permissions (any/all modes)
- Optional fallback content for unauthorized users
- `ProtectedRoute` supports `requiredPermission` prop for route-level protection

#### Current UI Implementation
- Permission infrastructure fully implemented (hooks, components)
- Limited usage across application - only `PatientsPage.tsx` currently uses `useHasPermission`
- Navigation menu items not permission-gated
- Most buttons/actions not consistently hidden based on permissions
- Backend authorization is authoritative; frontend provides UX enhancement

## 3. Authorization Flow

### Login and Permission Computation
```
[User Login]
     │ username + password + tenantCode
     ▼
[AuthServiceImpl.login()]
     │ Validates credentials
     │ Loads user with roles
     │ Computes effective permissions (union of all role permissions)
     ▼
[JWT Generation]
     │ Access token includes: userId, tenantId, permissions[]
     ▼
[Frontend Storage]
     │ Store tokens in localStorage/Redux
     │ Store user permissions in Redux state
```

### Request Authorization
```
[API Request]
     │ Authorization: Bearer <access_token>
     ▼
[JwtAuthenticationFilter]
     │ Validates JWT signature
     │ Extracts userId, tenantId, permissions[]
     │ Sets SecurityContext with authorities
     │ Sets TenantContext
     ▼
[Controller Method]
     │ @PreAuthorize("hasAuthority('PERMISSION_CODE')")
     │ Spring Security checks authorities
     │ Grants or denies access
```

### Permission Computation Logic
```java
// From AuthServiceImpl.computeEffectivePermissions()
private List<String> computeEffectivePermissions(User user) {
    return user.getRoles().stream()
            .flatMap(role -> role.getPermissions().stream())
            .map(Permission::getCode)
            .distinct()
            .collect(Collectors.toList());
}
```

## 4. Role Management Operations

### System Role Protection
- System roles (`isSystem = true`, `tenant = null`) cannot be:
  - Modified (name or permissions)
  - Deleted
  - Have permissions attached/detached
- This ensures standard healthcare roles remain consistent across tenants

### Custom Role Operations
- **Create**: `POST /roles` with name and permission codes
- **Update**: `PUT /roles/{id}` to modify name or permissions
- **Delete**: `DELETE /roles/{id}` to remove custom role
- **Attach Permissions**: `POST /roles/{id}/permissions`
- **Detach Permissions**: `DELETE /roles/{id}/permissions`
- All operations require `ROLE_MANAGE` permission

### User-Role Assignment
- **Assign Role**: `POST /roles/users/{userId}/roles/{roleId}`
- **Unassign Role**: `DELETE /roles/users/{userId}/roles/{roleId}`
- Operations are tenant-scoped
- Requires `ROLE_MANAGE` permission

## 5. Permission-Based Access Control Matrix

| Feature | Permission | Typical Roles | Controller Endpoints |
|---------|-----------|---------------|---------------------|
| **Patients** | | | |
| View patient list/details | PATIENT_VIEW | All roles | GET /patients, GET /patients/{id} |
| Create/edit patient | PATIENT_EDIT | DOCTOR, ADMIN | POST /patients, PUT /patients/{id} |
| Delete patient | PATIENT_DELETE | ADMIN | DELETE /patients/{id} |
| **Consultations** | | | |
| View consultations | CONSULT_VIEW | DOCTOR, NURSE, ADMIN | GET /prescriptions/{id} |
| Create consultation | CONSULT_CREATE | DOCTOR, ADMIN | POST /prescriptions |
| Edit consultation | CONSULT_EDIT | DOCTOR, ADMIN | PUT /prescriptions/{id} |
| **Dispensing** | | | |
| Dispense prescription | PRESCRIPTION_DISPENSE | PHARMACIST, ADMIN | POST /dispenses |
| View prescriptions | PRESCRIPTION_VIEW | DOCTOR, PHARMACIST, ADMIN | GET /prescriptions |
| Update prescription status | CONSULT_EDIT or PRESCRIPTION_DISPENSE | DOCTOR, PHARMACIST, ADMIN | PUT /prescriptions/{id}/status |
| View current serving | QUEUE_VIEW or PHARMACY_MANAGE | DOCTOR, PHARMACIST, ADMIN | GET /prescriptions/current-serving |
| View up next | QUEUE_VIEW or PHARMACY_MANAGE | DOCTOR, PHARMACIST, ADMIN | GET /prescriptions/up-next |
| **Pharmacy** | | | |
| Manage inventory | PHARMACY_MANAGE | PHARMACIST, ADMIN | POST/PUT/DELETE /medicine, /supply |
| View pharmacy data | PHARMACY_VIEW | DOCTOR, PHARMACIST, ADMIN | GET /medicine, /supply |
| **Queues** | | | |
| Manage queues | QUEUE_MANAGE | DOCTOR, NURSE, RECEPTIONIST, ADMIN | POST/PUT/DELETE /queues |
| View queues | QUEUE_VIEW | DOCTOR, RECEPTIONIST | GET /queues |
| Check-in patients | QUEUE_VIEW and QUEUE_MANAGE | DOCTOR, NURSE, RECEPTIONIST, ADMIN | PATCH /queue/{id}/check-in |
| **Visits** | | | |
| View visits | VISIT_VIEW | DOCTOR, NURSE, PHARMACIST, RECEPTIONIST | GET /visits |
| Edit visits | VISIT_EDIT | DOCTOR, NURSE, PHARMACIST, RECEPTIONIST, ADMIN | PUT /visits/{id} |
| **Users** | | | |
| Manage users | USER_MANAGE | ADMIN | POST/PUT/DELETE /users |
| View users | USER_VIEW | ADMIN, DOCTOR, NURSE, PHARMACIST, RECEPTIONIST | GET /users |
| **Roles** | | | |
| Manage roles | ROLE_MANAGE | ADMIN | All /roles endpoints |

## 6. Security Considerations

### Permission Propagation
- Permissions are computed at login and embedded in JWT
- Changing a user's roles/permissions requires re-login to take effect
- This is a trade-off between performance and real-time permission updates

### Token Expiry Impact
- Access tokens expire in 10 minutes
- Refresh tokens expire in 30 days
- Permission changes take effect after next login or token refresh

### Tenant Isolation
- All authorization checks include tenant context
- Users cannot access resources from other tenants
- Custom roles are tenant-specific
- System roles are shared but applied within tenant context

### System Role Integrity
- System roles are protected from modification
- Ensures consistent baseline permissions across tenants
- Custom roles can extend but not replace system roles

## 7. Frontend Authorization Implementation Plan

### Phase 1: UI Element Control
- Use `useHasPermission` hooks to hide/show UI elements
- Example: Hide "Delete Patient" button if user lacks `PATIENT_DELETE`
- Example: Disable "Create Consultation" button if user lacks `CONSULT_CREATE`

### Phase 2: Route-Level Protection
- Extend `ProtectedRoute` component to check permissions
- Redirect unauthorized users to appropriate page
- Show permission denied messages

### Phase 3: Permission-Aware Components
- Create reusable permission-gated components
- Example: `<PermissionButton permission="PATIENT_EDIT">Edit</PermissionButton>`
- Example: `<PermissionRoute permission="USER_MANAGE">...</PermissionRoute>`

### Phase 4: Admin UI for Role Management
- Build role management interface
- Permission assignment UI with checkboxes
- User-role assignment interface
- Visual permission matrix for roles

## 8. Future Enhancements

### Data-Level Security
- Implement row-level security for sensitive data
- Example: Doctors can only view their own patients
- Example: Pharmacists can only view prescriptions assigned to them

### Attribute-Based Access Control (ABAC)
- Extend RBAC with attribute-based rules
- Example: Override permissions based on time of day
- Example: Emergency access escalation

### Permission Inheritance
- Implement hierarchical permission structure
- Example: `PATIENT_MANAGE` implies `PATIENT_VIEW` and `PATIENT_EDIT`
- Reduce permission redundancy

### Audit Logging
- Log all authorization decisions
- Track permission changes
- Monitor failed authorization attempts

### Real-Time Permission Updates
- Implement WebSocket-based permission propagation
- Push permission changes to active sessions
- Invalidate sessions on critical permission revocations

## 9. Testing Strategy

### Backend Authorization Tests
- Test each `@PreAuthorize` annotation with various permission combinations
- Verify system role protection
- Test custom role CRUD operations
- Verify tenant isolation in authorization
- Test permission computation logic

### Frontend Authorization Tests
- Test permission hooks with various user states
- Verify UI element hiding/showing based on permissions
- Test route protection with permission checks
- Verify permission-aware component behavior

### Integration Tests
- End-to-end authorization flow from login to protected resource access
- Test permission changes and their impact on active sessions
- Verify role assignment/revocation effects
- Test multi-tenant authorization isolation

## 10. Operational Considerations

### Permission Management
- Document permission changes carefully
- Test permission changes in staging environment first
- Communicate permission changes to affected users
- Consider permission change impact on active sessions

### Role Management
- Establish role naming conventions
- Document custom role purposes and permission sets
- Regularly review custom roles for relevance
- Archive unused custom roles

### Troubleshooting
- Common issues:
  - User has correct role but wrong permissions: Check role-permission mapping
  - Permission changes not taking effect: User needs to re-login
  - Cross-tenant access: Verify tenant context in JWT
  - System role modification attempts: Blocked by design

### Monitoring
- Monitor failed authorization attempts
- Track unusual permission patterns
- Alert on role management operations
- Monitor permission computation performance

## 11. Key Files and Components

### Backend
- `com.anucode.dispensary.security.Permissions` - Permission constants
- `com.anucode.dispensary.entities.Permission` - Permission entity
- `com.anucode.dispensary.entities.Role` - Role entity
- `com.anucode.dispensary.entities.User` - User entity with roles
- `com.anucode.dispensary.filters.JwtAuthenticationFilter` - JWT permission extraction
- `com.anucode.dispensary.config.SecurityConfig` - Security configuration
- `com.anucode.dispensary.controllers.RoleController` - Role management endpoints
- `com.anucode.dispensary.services.RoleService` - Role business logic
- `com.anucode.dispensary.services.serviceImpl.AuthServiceImpl` - Permission computation

### Frontend
- `src/hooks/usePermissions.ts` - Permission checking hooks
- `src/store/userSlice.ts` - User permissions in Redux
- `src/services/authApiService.ts` - Auth API integration
- `src/components/ProtectedRoute.tsx` - Route protection (to be extended)

## 12. Summary

The current authorization implementation provides:
- **Fine-grained permissions** covering all system features
- **Flexible RBAC** with both system and custom roles
- **Multi-tenant support** with tenant-scoped custom roles
- **JWT-based authorization** with embedded permissions
- **Backend enforcement** via Spring Security `@PreAuthorize`
- **Role management API** for custom role operations
- **System role protection** to maintain consistency

Next steps:
- Implement frontend permission-based UI control
- Build role management admin interface
- Add comprehensive authorization testing
- Implement audit logging for authorization events
- Consider real-time permission updates for critical scenarios
