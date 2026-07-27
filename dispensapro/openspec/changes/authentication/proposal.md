## Why

The current system uses header-based impersonation (X-Tenant-ID and X-User-ID) for authentication, which is insecure—anyone who knows or guesses a tenant/user UUID can impersonate that identity by crafting headers. There is no real authentication, no credential verification, no token validation, and no protection against anonymous access, token replay, or cross-tenant snooping. The system needs a proper authentication and authorization stack that can evolve toward Keycloak without rework, while maintaining multi-tenant SaaS requirements and healthcare data sensitivity constraints.

## What Changes

### Backend Changes
- Add `tenantCode` column to `Tenant` table for subdomain-based tenant derivation
- Add `passwordHash`, `isActive`, `mustResetPassword` fields to `User` entity
- Create `RefreshSession` entity/table for token management (id, userId, tenantId, deviceId, tokenHash, expiry, revoked)
- Implement `TenantService` for tenant lookup by code
- Implement `AuthService` for login, refresh, logout logic
- Implement `JwtTokenService` for JWT generation/validation (RS256)
- Implement `RefreshSessionService` for refresh token management
- Create `AuthController` with endpoints: `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`
- Update `TenantFilter` to extract subdomain from request host, lookup tenant by code, set TenantContext (remove X-Tenant-ID dependency)
- Update `SecurityConfig` to add JWT authentication filter, configure authorization rules, disable CSRF
- Remove X-User-ID header parsing from `TenantFilter` authentication logic
- Update `TenantContext.getCurrentUser()` to remove hardcoded user fallback
- Update `CorsConfig` to remove X-User-ID from allowed headers, add Authorization to allowed headers

### Frontend Changes
- Remove X-User-ID header from `apiClient.tsx` interceptor
- Keep X-Tenant-ID header for developer visibility only (not used for auth)
- Add Authorization header with Bearer token to all API requests
- Implement 401 interceptor to call refresh endpoint and retry original request
- Create `LoginPage.tsx` component with username/password fields
- Create `authSlice.ts` Redux slice for auth state (user profile, roles, accessToken, refreshToken, isAuthenticated)
- Update `useAuth.tsx` hook to check auth state and redirect to login if not authenticated
- Update `routes.tsx` to include public login route and protect other routes
- Implement tenantCode extraction: hardcoded HMA001 for localhost, extracted from subdomain for production
- Implement logout functionality (call /api/auth/logout, clear tokens, redirect to login)

### Database Changes
- Add `tenantCode` column to `tenant` table (unique, indexed)
- Add `passwordHash`, `isActive`, `mustResetPassword` columns to `app_user` table
- Create `refresh_sessions` table with appropriate schema

## Capabilities

### New Capabilities
- `user-authentication`: JWT-based authentication with Bearer tokens, supporting login, refresh, and logout flows
- `tenant-subdomain-routing`: Subdomain-based tenant identification for multi-tenant SaaS
- `refresh-token-management`: Revocable refresh tokens with rotation and device tracking
- `role-based-authorization`: Role-based access control using Spring Security authorities

### Modified Capabilities
- `multi-tenancy`: Changed from header-based tenant identification to subdomain-based derivation
- `user-identity`: Changed from header-based user identity to JWT-based authentication

## Impact

- **Security**: Replaces insecure header-based auth with verifiable JWT credentials
- **Backend entities**: `Tenant.java` — add tenantCode field; `User.java` — add password fields
- **Backend new entities**: `RefreshSession.java`
- **Backend filters**: `TenantFilter.java` — subdomain extraction instead of header reading
- **Backend config**: `SecurityConfig.java` — JWT filter, authorization rules, CSRF disabled; `CorsConfig.java` — header updates
- **Backend services**: `TenantService.java`, `AuthService.java`, `JwtTokenService.java`, `RefreshSessionService.java`
- **Backend controllers**: `AuthController.java` — new auth endpoints
- **Backend context**: `TenantContext.java` — remove hardcoded user fallback
- **Frontend auth**: New login page, auth slice, auth state management
- **Frontend API client**: `apiClient.tsx` — Bearer token handling, 401 refresh interceptor
- **Frontend routing**: `routes.tsx` — login route, protected routes
- **Database migrations**: Required for new columns and tables
- **Breaking changes**: Existing header-based auth will no longer work after implementation
