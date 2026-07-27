# Authentication Story

## 1. Background and goals
- **Business need:** move from header-based impersonation to a real authentication and authorization stack that can evolve toward Keycloak without rework.
- **Constraints:** multi-tenant SaaS, healthcare data sensitivity, limited budget now (no Keycloak hosting yet), desire to minimize user-visible complexity.
- **Strategy:** deliver a lightweight Phase 1 implementation (Spring Security 6 + JWT + BCrypt + refresh tokens, Bearer token approach) while laying the groundwork for a Keycloak-powered future.

## 2. Current state snapshot (July 2026)
### Frontend (React / Redux)
- `userSlice` preloads a hard-coded doctor identity, and `useAuth` simply checks whether that object exists. Every visitor is implicitly “logged in.” (@dispensapro/src/store/userSlice.ts#1-49, @dispensapro/src/hooks/useAuth.tsx#1-13)
- `apiClient` injects `X-Tenant-ID` and `X-User-ID` headers into Axios requests and hints at “future Keycloak auth,” but no tokens are generated or validated today. (@dispensapro/src/services/apiClient.tsx#1-45)
- Router exposes only protected routes; there’s no login form or public landing path. (@dispensapro/src/routes.tsx#1-32)

### Backend (Spring Boot)
- `SecurityConfig` disables CSRF, leaves every endpoint `permitAll`, and has no auth providers configured. (@dispensary/src/main/java/com/anucode/dispensary/config/SecurityConfig.java#1-24)
- `TenantFilter`/`TenantContext` rely on `X-Tenant-ID` + optional `X-User-ID` headers to decide who’s calling; if no user header is provided, a fixed UUID is assumed. (@dispensary/src/main/java/com/anucode/dispensary/filters/TenantFilter.java#1-59, @dispensary/src/main/java/com/anucode/dispensary/config/TenantContext.java#1-37)
- Controllers/services trust those thread-local values for scoping and never verify credentials. Example: `UserController` obtains tenant ID from `TenantContext` before every action. (@dispensary/src/main/java/com/anucode/dispensary/controllers/UserController.java#1-64)

**Implication:** anyone who knows (or guesses) a tenant/user UUID can impersonate that identity just by crafting headers. No protection against anonymous access, token replay, or cross-tenant snooping.

## 3. Phase 1 plan — Spring Security 6 + JWT + BCrypt + refresh tokens
### Objectives
1. Replace header-based trust with verifiable credentials.
2. Support secure multi-tenant logins via subdomains, while keeping the experience simple for end users.
3. Issue short-lived access tokens (JWT) and revocable refresh tokens, returned in response body and stored in frontend (localStorage/Redux).
4. Introduce role-based authorization hooks so business rules can evolve.

### Backend blueprint
1. **Tenant derivation**
   - Parse `request.getServerName()` (or `X-Forwarded-Host`) to extract the subdomain slug.
   - Lookup slug → tenant UUID (new table `tenant_domains` or columns on `Tenant`).
   - Populate `TenantContext` from the slug only. **X-Tenant-ID header is completely ignored for tenant derivation** - it's sent from frontend for developer visibility only and accepted by backend via CORS rules, but not used for authentication.
   - **No fallback**: Subdomain extraction must always work. For localhost development, frontend hardcodes tenantCode = HMA001.

2. **User credentials**
   - Extend `User` entity with `passwordHash`, `isActive`, `mustResetPassword`, etc., hashed via BCrypt (`PasswordEncoder` bean).
   - Admin provisioning flow hashes passwords (or issues temporary activation links).

3. **Auth endpoints**
   - `POST /api/auth/login`: requires `username`, `password`, `tenantCode`; server validates credentials and returns `{ accessToken, refreshToken, user }`.
   - `POST /api/auth/refresh`: requires `refreshToken` in request body; validates and rotates tokens, returns new `{ accessToken, refreshToken }`.
   - `POST /api/auth/logout`: revokes refresh token(s) in database.

4. **Token service**
   - Access token: JWT signed with server RSA key (RS256), contains `sub`, `tenantId`, `userId`, `role`, `exp` (~5–10 min).
   - Refresh token: opaque UUID, persisted in DB with tenant/user info, expiration (~30 days), status (`active`, `revoked`).
   - Implement rotating refresh tokens: issuing a new token invalidates the old ID.

5. **Security filter chain**
   - Add JWT authentication filter that reads `Authorization: Bearer <token>` header, validates signature/claims, and populates `SecurityContext`.
   - Configure `authorizeHttpRequests`: `permitAll` only for `/auth/**` and public assets; require `authenticated()` for everything else; add role-based matchers (e.g., `/pharmacy/**` → `hasRole('PHARMACIST')`).
   - Disable CSRF (not needed with Bearer tokens).

6. **Revocation strategy**
   - Maintain a `refresh_sessions` table storing token IDs, tenant IDs, user IDs, device metadata, expiry, and revocation flags.
   - Admin “revoke user” and “logout all devices” actions mark rows as revoked; future refresh attempts fail, forcing full re-login.
   - Log anomalies (e.g., refresh attempt after revocation) for auditing.

### Frontend blueprint
1. **Tenant awareness via subdomain**
   - On app bootstrap, extract the subdomain from `window.location.host` and store it in a global context (for analytics, UI labeling, tenant-specific assets). No tenant selector UI required.
   - **Localhost development**: Hardcode tenantCode = HMA001 in frontend code for development purposes.
   - **X-Tenant-ID header**: Continue sending X-Tenant-ID header from frontend for developer visibility only. Backend accepts via CORS rules but does not use it for authentication.
   - **X-User-ID header**: Remove completely from frontend - no longer sent in requests.

2. **Login form**
   - Fields: username + password (no tenant field). Optionally show the tenant name derived from subdomain for reassurance.
   - Submit to `/api/auth/login` with `tenantCode` in request body; expect success with `{ accessToken, refreshToken, user }`.
   - Store tokens in localStorage or Redux state.

3. **Session handling**
   - Store auth state in Redux/Zustand (user profile, roles, accessToken, refreshToken).
   - Attach `Authorization: Bearer <accessToken>` header to all API requests.
   - Intercept 401 responses: initiate `/api/auth/refresh` with refreshToken; if refresh fails, redirect to login.

4. **Logout button**
   - Call `/api/auth/logout`; clear local auth state; redirect to login.

5. **UX impact**
   - From the user’s perspective, nothing changes compared to traditional web apps: they log in once per session, can open multiple tabs, and are silently refreshed until their refresh token expires or is revoked.

### Token lifecycle overview
```
[Login form]
     │ username/password + tenantCode (from subdomain or hardcoded for localhost)
     ▼
[Auth Controller]
     │ validates via BCrypt + tenantCode lookup
     │ returns access (5 min) + refresh (30 days) tokens in response body
     ▼
[SPA stores tokens]
     │ localStorage or Redux state
     ▼
[SPA requests]
     │ Authorization: Bearer <access_token> header
     ▼
[JWT filter]
     │ validates signature, exp, tenant slug
     │ populates SecurityContext + TenantContext
     ▼
[Protected controller]
     │ enforces roles/tenant

(Access token expiry)
     │ 401 detected in SPA
     ▼
[Refresh endpoint]
     │ POST with refreshToken in body
     │ validates refresh token in DB
     │ rotates tokens (returns new tokens in response)
```

## 4. Tenant routing via subdomains
1. **DNS & TLS**
   - Configure wildcard DNS (`*.dispensapro.com` → load balancer) and obtain a wildcard TLS certificate.
2. **Ingress**
   - Reverse proxy must forward the original `Host` header so both frontend and backend can read the subdomain.
3. **Tenant provisioning workflow**
   - When creating a tenant, generate a slug (e.g., `aurora-med`) and ensure it’s unique.
   - Store slug + canonical domain (e.g., `aurora-med.dispensapro.com`) in the tenant record.
4. **Backend mapping**
   - Middleware extracts the slug and fetches the tenant row; if unknown, return 404 to avoid leaking other tenants.
5. **Local dev**
   - Use `sslip.io`, `lvh.me`, or host-file entries (`tenant.localhost`) to emulate subdomains.

## 5. Security considerations with Bearer tokens
- **Token storage**
  - Store tokens in localStorage or Redux state. Consider using secure storage mechanisms for sensitive environments.
- **XSS protection**
  - Implement Content Security Policy (CSP) to mitigate XSS risks that could steal tokens.
- **Token transmission**
  - Always use HTTPS in production to prevent token interception.
- **Session expiry**
  - Warn users shortly before refresh token expiration (optional) so they can re-authenticate proactively.
- **Device enrollment**
  - Track device/browser fingerprints when creating refresh sessions to support auditing and targeted revocation.

## 6. Revocation strategy details
| Scenario | What happens | User experience |
|----------|---------------|-----------------|
| User clicks “Log out” | Server deletes refresh session record; frontend clears tokens from storage | Immediately redirected to login; other devices remain active |
| Admin disables user | All refresh sessions for that user marked revoked; optional `locked` flag prevents future logins | Current access tokens expire within minutes; refresh attempts fail → forced logout |
| Suspicious refresh use | Detect refresh attempts from new IP/device while previous session still active; optionally alert or auto-revoke | Depending on policy, may require user to re-login |

Implementation tips:
- Store refresh sessions in DB or Redis with TTL and indexes on `userId`, `tenantId`, `deviceId` for fast revocation.
- Consider asynchronous cleanup job to purge expired sessions.
- Log revocation events for compliance.

## 7. Future Keycloak readiness
| Area | Phase 1 design | Keycloak migration impact |
|------|----------------|---------------------------|
| Token format | Standards-based JWT with RS256 | Client code keeps parsing the same claims; only issuer changes |
| Roles/scopes | Spring authorities derived from token claims | Keycloak role mappers feed the same authorities |
| Tenant identity | Derived from subdomain + stored in token claims | Keycloak realm or custom attribute can carry tenant ID; keep slug mapping consistent |
| User provisioning | Admin UI hashes passwords & stores locally | Later call Keycloak Admin API or sync to Keycloak via federation |
| Refresh handling | Server-managed refresh sessions | Replace with Keycloak’s refresh tokens + admin session revocation APIs |

Steps when adopting Keycloak:
1. Configure Keycloak realm per tenant (or per environment) and map subdomains to realms.
2. Swap custom login UI for Keycloak’s hosted login or PKCE flow.
3. Replace JWT validation key with Keycloak’s public JWKS endpoint.
4. Disable local password store once all accounts live in Keycloak.

## 8. Risks, open questions, next actions
1. **Slug collisions & DNS propagation:** need guardrails when provisioning tenants to prevent duplicates and handle DNS caching delays.
2. **Audit logging:** define what events must be captured for compliance (logins, failed attempts, revocations).
3. **Password resets:** decide whether admins trigger resets or users can self-service via email.
4. **Device limits:** optionally cap concurrent refresh sessions per user to reduce risk.
5. **Migration plan:** determine how to move existing hard-coded users into the new credential store (manual insertion vs. scripted).

### Immediate next steps
1. Model updates: add credential fields to `User`, create `RefreshSession` entity/table, add `tenantCode` column to `Tenant`.
2. Implement subdomain extraction in TenantFilter to derive tenant from slug (remove X-Tenant-ID dependency).
3. Remove X-User-ID header from TenantFilter authentication logic and remove from frontend apiClient.
4. Implement authentication service & controllers (login, refresh, logout) with Bearer token approach.
5. Build login/logout/refresh flow in the SPA with Authorization header handling.
6. Document operational runbooks (how to add tenants, rotate signing keys, revoke sessions).

With Phase 1 complete, the system will have real authentication, safer token handling, and a clear runway to Keycloak whenever hosting budget allows.


note : please keep the 'x-tenant-id' header without removing it for now



-----



## Authentication Verification Checklist

### Backend Verification

**1. Backend Authentication Endpoints**
- **What:** Login, refresh, logout endpoints work correctly
- **How:** Use Postman/curl to test:
  ```bash
  # Login
  POST http://localhost:8080/api/auth/login
  Body: {"username": "test", "password": "password123", "tenantCode": "HMA001"}
  Expected: 200 with accessToken, refreshToken, user
  
  # Refresh
  POST http://localhost:8080/api/auth/refresh
  Body: {"refreshToken": "<from login>"}
  Expected: 200 with new accessToken, refreshToken
  
  # Logout
  POST http://localhost:8080/api/auth/logout
  Body: {"refreshToken": "<token>"}
  Expected: 204 No Content
  ```

**2. BCrypt Password Hashing**
- **What:** Passwords are hashed correctly and validate properly
- **How:** 
  - Check H2 console: `SELECT password_hash FROM app_user WHERE username = 'test'`
  - Verify hash starts with `$2a$` or `$2b$` (BCrypt format)
  - Try wrong password: should get "Invalid username or password"
  - Try correct password: should succeed

**3. JWT Token Generation & Validation**
- **What:** JWT contains correct claims and validates properly
- **How:**
  - Decode accessToken at jwt.io
  - Verify claims: `sub` (userId), `tenantId`, `role`, `exp`
  - Try expired token: should get 401
  - Try tampered token: should get 401
  - Check signature verification works

**4. Refresh Token Rotation**
- **What:** Old refresh token revoked, new one issued
- **How:**
  - Check H2 console: `SELECT * FROM refresh_sessions`
  - After refresh, old session should have `revoked = true`
  - New session should exist with `revoked = false`
  - Old token should fail on subsequent refresh attempts

**5. Tenant Derivation from Subdomain**
- **What:** Tenant correctly extracted from subdomain
- **How:**
  - Test with localhost: should skip tenant derivation (auth endpoint handles)
  - Test with subdomain (use sslip.io): `hma001.sslip.io`
  - Check backend logs: TenantFilter should extract subdomain
  - Invalid subdomain should return 401

**6. Security Configuration**
- **What:** Auth endpoints public, others protected
- **How:**
  - Access `/api/auth/login` without token: should work (200)
  - Access `/api/patients` without token: should return 401
  - Access protected endpoint with valid token: should work

### Frontend Verification

**7. Frontend Login Flow**
- **What:** Login form submits correctly, stores tokens
- **How:**
  - Navigate to `/login`
  - Enter credentials (ensure test user exists)
  - Submit form
  - Check localStorage: `accessToken`, `refreshToken` should be present
  - Should redirect to dashboard

**8. Token Storage**
- **What:** Tokens stored in localStorage/Redux
- **How:**
  - Browser DevTools → Application → Local Storage
  - Verify `accessToken` and `refreshToken` exist
  - Check Redux DevTools: auth state should have tokens and user

**9. Authorization Header**
- **What:** Bearer token sent with API requests
- **How:**
  - Browser DevTools → Network tab
  - Click any API request after login
  - Check Request Headers: `Authorization: Bearer <token>`
  - Verify token matches localStorage

**10. Protected Routes**
- **What:** Unauthenticated users redirected to login
- **How:**
  - Clear localStorage (logout)
  - Navigate directly to `/dashboard` or any protected route
  - Should redirect to `/login`
  - URL should have redirect parameter

**11. Automatic Token Refresh**
- **What:** 401 triggers refresh and retries request
- **How:**
  - Temporarily reduce JWT expiry to 10 seconds in [JwtTokenService](cci:2://file:///g:/dispensaPro/DispensaryApp%20-%200.2.2v/dispensary/src/main/java/com/anucode/dispensary/services/JwtTokenService.java:16:0-74:1)
  - Login and wait for expiry
  - Make an API call
  - Network tab should show: 401 → refresh request → original request retried
  - New token should be in localStorage

**12. Logout**
- **What:** Tokens cleared, session revoked, redirect to login
- **How:**
  - Click logout button
  - Check localStorage: tokens should be cleared
  - Check H2 console: refresh session should have `revoked = true`
  - Should redirect to `/login`
  - Subsequent API calls should fail/redirect

### Integration Verification

**13. End-to-End Login Flow**
- **What:** Complete flow from login to authenticated API usage
- **How:**
  1. Start backend and frontend
  2. Navigate to login page
  3. Enter valid credentials
  4. Verify tokens stored
  5. Verify redirect to dashboard
  6. Make API call (e.g., fetch patients)
  7. Verify Authorization header sent
  8. Verify data returned successfully

**14. End-to-End Logout Flow**
- **What:** Complete logout with cleanup
- **How:**
  1. Login successfully
  2. Navigate to protected page
  3. Click logout
  4. Verify tokens cleared
  5. Verify redirect to login
  6. Try to access protected route directly
  7. Verify redirect to login

### Database Verification

**15. Database Schema**
- **What:** Tables and columns created correctly
- **How:**
  - H2 Console at `http://localhost:8080/h2-console`
  - Check `tenant` table has `code` column with unique constraint
  - Check `app_user` has `password_hash`, `is_active`, `must_reset_password`
  - Check `refresh_sessions` table exists with all columns

**16. Test Data Seeding**
- **What:** Test users exist with hashed passwords
- **How:**
  - Query `app_user` table
  - Verify users exist for each role (DOCTOR, NURSE, PHARMACIST, ADMIN)
  - Verify `password_hash` is BCrypt format
  - Verify `is_active = true`

### Security Verification

**17. X-User-ID Header Removal**
- **What:** X-User-ID not sent from frontend
- **How:**
  - Network tab → check request headers
  - X-User-ID should not be present
  - Only Authorization header should be present

**18. X-Tenant-ID Informational**
- **What:** X-Tenant-ID sent but not used for auth
- **How:**
  - Network tab → verify X-Tenant-ID present (for dev visibility)
  - Backend logs → verify tenant derived from subdomain/JWT, not header

This checklist covers all authentication aspects. You can verify these incrementally as you implement frontend tasks, or do a final end-to-end verification after completing all tasks.
