## Purpose

Defines how one or more roles are assigned to a user, how a user's effective set of permissions is derived from those roles, and how that information is exposed to clients.

## ADDED Requirements

### Requirement: Multiple roles per user
A user SHALL be assignable to one or more roles simultaneously (system roles, tenant-custom roles, or a mix).

#### Scenario: User assigned two roles
- **WHEN** an administrator assigns both `NURSE` and a custom "Inventory Manager" role to a user
- **THEN** the user holds both roles at the same time

### Requirement: Role assignment stays within the user's tenant
A user SHALL only be assignable to system roles or to custom roles belonging to the user's own tenant.

#### Scenario: Attempt to assign another tenant's custom role
- **WHEN** an administrator attempts to assign a custom role belonging to tenant B to a user in tenant A
- **THEN** the system rejects the assignment

### Requirement: Effective permissions are the union of assigned roles
A user's effective permission set SHALL be the union of the permissions granted by every role currently assigned to that user, with no duplication.

#### Scenario: Overlapping permissions across roles
- **WHEN** a user holds two roles that both grant permission `PATIENT_VIEW`, and one additionally grants `PATIENT_EDIT`
- **THEN** the user's effective permissions include both `PATIENT_VIEW` and `PATIENT_EDIT` exactly once each

### Requirement: A user must have at least one role
The system SHALL prevent a user from having zero assigned roles.

#### Scenario: Attempt to remove a user's last role
- **WHEN** an administrator attempts to unassign a user's only remaining role
- **THEN** the system rejects the removal

### Requirement: Current user's roles and permissions are retrievable
The system SHALL expose the authenticated user's assigned role names and effective permission codes to the client.

#### Scenario: Fetching current user profile
- **WHEN** an authenticated user requests their own profile
- **THEN** the response includes the list of role names assigned to them and the list of effective permission codes

### Requirement: Role and permission changes take effect within a bounded time
When a user's role assignment or a role's permissions change, the system SHALL ensure the user's effective permissions reflect that change within a bounded, documented time window, even if the user does not explicitly log out.

#### Scenario: Permission revoked mid-session
- **WHEN** an administrator removes a permission from a role held by an active user
- **THEN** that user loses the ability to perform actions requiring that permission no later than their next token refresh
