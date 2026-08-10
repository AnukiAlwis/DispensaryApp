## Purpose

Defines the catalog of permissions the system can enforce, the role concept that groups permissions together (system-wide or tenant-specific), and how tenant administrators manage custom roles for their own tenant.

## ADDED Requirements

### Requirement: Global permission catalog
The system SHALL maintain a single, tenant-independent catalog of permissions, each identified by a unique code (e.g. `PATIENT_EDIT`). Permissions are defined by the application, not created by tenants.

#### Scenario: Permission codes are consistent across tenants
- **WHEN** any tenant's role is configured with the permission code `PATIENT_EDIT`
- **THEN** it refers to the exact same capability as `PATIENT_EDIT` in any other tenant

### Requirement: System roles available to every tenant
The system SHALL provide a seeded set of system roles (e.g. `DOCTOR`, `NURSE`, `PHARMACIST`, `RECEPTIONIST`, `ADMIN`) that are available to every tenant without any tenant-side setup, each pre-mapped to a default set of permissions.

#### Scenario: New tenant has usable roles immediately
- **WHEN** a new tenant is created
- **THEN** all system roles are available for assigning to that tenant's users without any additional configuration

### Requirement: Tenant-custom roles
A tenant administrator SHALL be able to create additional roles scoped to their own tenant, and attach or remove permissions (from the global catalog) on those roles.

#### Scenario: Tenant admin creates a custom role
- **WHEN** a tenant administrator creates a role named "Senior Pharmacist" with a chosen set of permissions
- **THEN** the role is created and scoped to that administrator's tenant only

#### Scenario: Custom role invisible to other tenants
- **WHEN** tenant A creates a custom role
- **THEN** tenant B cannot see, assign, or modify that role

### Requirement: Only authorized users manage roles and permissions
Creating, editing, or deleting a tenant-custom role, or changing its permissions, SHALL require the acting user to hold a role-management permission.

#### Scenario: Unauthorized user attempts role management
- **WHEN** a user without role-management permission attempts to create or edit a role
- **THEN** the system rejects the request

### Requirement: System roles are not modifiable by tenants
Tenant administrators SHALL NOT be able to delete a system role or alter its default permission set.

#### Scenario: Attempt to edit a system role
- **WHEN** a tenant administrator attempts to change the permissions of a system role (e.g. `DOCTOR`)
- **THEN** the system rejects the change
