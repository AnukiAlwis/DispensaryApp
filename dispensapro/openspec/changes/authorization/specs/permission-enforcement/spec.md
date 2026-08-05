## Purpose

Defines how the backend enforces permission checks on protected operations, and how the frontend uses the same permission data to control what users see and can interact with.

## ADDED Requirements

### Requirement: Backend enforces permissions as the source of truth
The backend SHALL reject any request to perform a protected operation if the authenticated user's effective permissions do not include the permission required for that operation, regardless of what the frontend displays.

#### Scenario: Direct API call without required permission
- **WHEN** a user without `PRESCRIPTION_DISPENSE` permission calls the dispense-prescription operation directly (bypassing the UI)
- **THEN** the backend rejects the request

#### Scenario: Direct API call with required permission
- **WHEN** a user with `PRESCRIPTION_DISPENSE` permission calls the dispense-prescription operation
- **THEN** the backend allows the request to proceed (subject to other business rules)

### Requirement: Unauthenticated and unauthorized requests are distinguishable
The system SHALL return a distinct response for "not authenticated" versus "authenticated but missing permission" so clients can react appropriately (e.g. redirect to login vs. show an access-denied message).

#### Scenario: No credentials supplied
- **WHEN** a request to a protected operation has no valid authentication
- **THEN** the system responds indicating authentication is required

#### Scenario: Valid credentials but missing permission
- **WHEN** an authenticated user without the required permission calls a protected operation
- **THEN** the system responds indicating the action is forbidden, distinct from an authentication failure

### Requirement: Frontend hides or disables actions the user cannot perform
The frontend SHALL use the current user's effective permissions to hide or disable navigation entries, buttons, and actions the user is not permitted to perform.

#### Scenario: Menu item hidden for missing permission
- **WHEN** a user without `USER_MANAGE` permission views the application navigation
- **THEN** the user-management menu entry is not shown

#### Scenario: Menu item shown for granted permission
- **WHEN** a user with `USER_MANAGE` permission views the application navigation
- **THEN** the user-management menu entry is shown

### Requirement: Frontend gating is a UX convenience, not a security boundary
Hiding a feature on the frontend SHALL NOT be relied upon as the only protection for that feature; the corresponding backend operation SHALL independently enforce the same permission.

#### Scenario: Bypassing hidden UI
- **WHEN** a user without the required permission crafts a direct API request to an operation whose UI entry point is hidden from them
- **THEN** the backend still rejects the request

### Requirement: Protected routes require specific permissions
The frontend SHALL support restricting navigation to a route until the current user holds a specified permission, redirecting or showing an access-denied view otherwise.

#### Scenario: Navigating to a restricted route without permission
- **WHEN** a user without the route's required permission navigates directly to its URL
- **THEN** the user is redirected away or shown an access-denied view instead of the route's content
