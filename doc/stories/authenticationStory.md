# Authentication Story

## 1. Background and goals
- **Business need:** move from header-based impersonation to a real authentication and authorization stack that can evolve toward Keycloak without rework.
- **Constraints:** multi-tenant SaaS, healthcare data sensitivity, limited budget now (no Keycloak hosting yet), desire to minimize user-visible complexity.
- **Strategy:** deliver a lightweight Phase 1 implementation (Spring Security 6 + JWT + BCrypt + refresh tokens, HttpOnly cookies) while laying the groundwork for a Keycloak-powered future.

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
3. Issue short-lived access tokens and revocable refresh tokens stored in HttpOnly cookies.
4. Introduce role-based authorization hooks so business rules can evolve.

### Backend blueprint
1. **Tenant derivation**
   - Parse `request.getServerName()` (or `X-Forwarded-Host`) to extract the subdomain slug.
   - Lookup slug → tenant UUID (new table `tenant_domains` or columns on `Tenant`).
   - Populate `TenantContext` from the slug rather than from headers (headers remain optional for internal tooling/tests).

2. **User credentials**
   - Extend `User` entity with `passwordHash`, `isActive`, `mustResetPassword`, etc., hashed via BCrypt (`PasswordEncoder` bean).
   - Admin provisioning flow hashes passwords (or issues temporary activation links).

3. **Auth endpoints**
   - `POST /api/auth/login`: requires `username`, `password`; server infers tenant from host, validates credentials, and issues cookies.
   - `POST /api/auth/refresh`: validates refresh cookie, rotates both tokens.
   - `POST /api/auth/logout`: clears cookies and revokes refresh token(s).

4. **Token service**
   - Access token: JWT signed with server RSA key (RS256), contains `sub`, `tenantId`, `userId`, `role`, `exp` (~5–10 min).
   - Refresh token: stored-as-cookie opaque UUID (`refresh_token_id`), persisted in DB/Redis with tenant/user info, expiration (~30 days), status (`active`, `revoked`).
   - Implement rotating refresh tokens: issuing a new token invalidates the old ID.

5. **Security filter chain**
   - Add `BearerTokenAuthenticationFilter` (configured for cookies) or a custom filter that reads the access token from the cookie, validates signature/claims, and populates `SecurityContext`/`TenantContext`.
   - Configure `authorizeHttpRequests`: `permitAll` only for `/auth/**` and public assets; require `authenticated()` for everything else; add role-based matchers (e.g., `/pharmacy/**` → `hasRole('PHARMACIST')`).
   - Re-enable CSRF for browser clients and expose a CSRF token endpoint (`/auth/csrf`) for the SPA to read an XSRF cookie/header.

6. **Revocation strategy**
   - Maintain a `refresh_sessions` table storing token IDs, tenant IDs, user IDs, device metadata, expiry, and revocation flags.
   - Admin “revoke user” and “logout all devices” actions mark rows as revoked; future refresh attempts fail, forcing full re-login.
   - Log anomalies (e.g., refresh attempt after revocation) for auditing.

### Frontend blueprint
1. **Tenant awareness via subdomain**
   - On app bootstrap, extract the subdomain from `window.location.host` and store it in a global context (for analytics, UI labeling, tenant-specific assets). No tenant selector UI required.

2. **Login form**
   - Fields: username + password (no tenant field). Optionally show the tenant name derived from subdomain for reassurance.
   - Submit to `/api/auth/login` with `credentials: 'include'`; expect success to set cookies.

3. **Session handling**
   - Store minimal auth state in Redux/Zustand (user profile, roles). Do **not** store tokens; rely on cookies.
   - Intercept 401 responses: initiate `/api/auth/refresh`; if refresh fails, redirect to login.
   - Pull CSRF token from a readable cookie (e.g., `XSRF-TOKEN`) and attach as `X-CSRF-Token` header on mutating requests.

4. **Logout button**
   - Call `/api/auth/logout`; clear local auth state; redirect to login.

5. **UX impact**
   - From the user’s perspective, nothing changes compared to traditional web apps: they log in once per session, can open multiple tabs, and are silently refreshed until their refresh token expires or is revoked.

### Token lifecycle overview
```
[Login form]
     │ username/password + tenant implied by subdomain
     ▼
[Auth Controller]
     │ validates via BCrypt + tenant slug
     │ issues access (5 min) + refresh (30 days) tokens as HttpOnly cookies
     ▼
[SPA requests]
     │ fetch/axios with credentials → cookies auto-attached
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
     │ validates refresh token ID in DB
     │ rotates tokens (new cookies)
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

## 5. Security considerations with HttpOnly cookies
- **SameSite settings**
  - Access token cookie: `SameSite=Lax` so app pages can make same-site POSTs. If API lives on `api.dispensapro.com` and frontend on subdomains, set `SameSite=None` and `Secure=true`.
  - Refresh token cookie: `SameSite=Strict` to limit unsolicited cross-site requests.
- **CSRF mitigation**
  - Issue a non-HttpOnly CSRF cookie containing a random token; frontend echoes it in `X-CSRF-Token` header for state-changing requests.
- **Session expiry**
  - Warn users shortly before refresh token expiration (optional) so they can re-authenticate proactively.
- **Device enrollment**
  - Track device/browser fingerprints when creating refresh sessions to support auditing and targeted revocation.

## 6. Revocation strategy details
| Scenario | What happens | User experience |
|----------|---------------|-----------------|
| User clicks “Log out” | Server deletes refresh session record and clears cookies | Immediately redirected to login; other devices remain active |
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
1. Model updates: add credential fields to `User`, create `RefreshSession` entity/table, create `TenantDomain` mapping.
2. Implement authentication service & controllers following the plan above.
3. Build login/logout/refresh flow in the SPA with CSRF handling.
4. Add feature toggles or configuration to fall back to header-based auth in dev/test until new flow is fully stable.
5. Document operational runbooks (how to add tenants, rotate signing keys, revoke sessions).

With Phase 1 complete, the system will have real authentication, safer token handling, and a clear runway to Keycloak whenever hosting budget allows.


note : please keep the 'x-tenant-id' header without removing it for now