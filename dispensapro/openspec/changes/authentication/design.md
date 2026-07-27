## Context

The current system uses header-based impersonation for authentication. `TenantFilter` reads `X-Tenant-ID` header to set tenant context and optionally reads `X-User-ID` header for user identity. If no user header is provided, a hardcoded UUID is assumed. All controllers trust these thread-local values for scoping without any credential verification. This means anyone who knows or guesses a tenant/user UUID can impersonate that identity by crafting headers. There is no protection against anonymous access, token replay, or cross-tenant snooping.

The system is a multi-tenant SaaS application with healthcare data sensitivity. The frontend is React/Redux, backend is Spring Boot with H2 database. Current security configuration permits all requests with CSRF disabled.

## Goals / Non-Goals

**Goals:**
- Replace header-based trust with verifiable JWT credentials
- Implement subdomain-based tenant derivation for multi-tenant SaaS
- Support secure login with username/password credentials
- Implement short-lived access tokens (5-10 min) and revocable refresh tokens (30 days)
- Add role-based authorization hooks for business rules
- Lay groundwork for future Keycloak migration without rework
- Keep X-Tenant-ID header for developer visibility only (not used for auth)

**Non-Goals:**
- Full Keycloak integration in Phase 1 (future work)
- Password reset flow via email (admin-triggered or manual for now)
- Device fingerprinting/enrollment (basic device tracking only)
- Real-time session monitoring
- Social login or OAuth providers
- Multi-factor authentication

## Decisions

### 1. Bearer tokens vs HttpOnly cookies
**Decision**: Use Bearer tokens (Authorization header) instead of HttpOnly cookies.

**Rationale**: 
- Simpler implementation for frontend (no CSRF handling needed)
- Easier debugging (tokens visible in browser dev tools)
- More flexible for API clients beyond just the SPA
- CSRF disabled, reducing complexity

**Trade-offs**: More vulnerable to XSS attacks if frontend has XSS vulnerabilities. Mitigated by implementing Content Security Policy (CSP).

**Alternative considered**: HttpOnly cookies with CSRF tokens — rejected as over-complex for current needs, and story explicitly requested Bearer token approach.

### 2. Tenant derivation: subdomain only, no header fallback
**Decision**: Extract tenant from subdomain (request.getServerName()), lookup by tenantCode in database. X-Tenant-ID header is accepted via CORS but completely ignored for authentication.

**Rationale**: 
- Subdomain-based routing is standard for multi-tenant SaaS
- Removes security risk of header spoofing
- Clear separation: subdomain = tenant identity
- X-Tenant-ID kept for developer debugging visibility only

**Trade-offs**: Requires subdomain infrastructure (DNS, wildcard TLS). Localhost development needs hardcoded tenantCode (HMA001).

**Alternative considered**: Use X-Tenant-ID as fallback for development — rejected based on user requirement that header should serve no authentication purpose.

### 3. Login endpoint accepts tenantCode parameter
**Decision**: POST /api/auth/login accepts { username, password, tenantCode } in request body.

**Rationale**: 
- Works on both localhost (hardcoded HMA001) and production (from subdomain)
- Single login flow regardless of environment
- Server validates tenantCode → tenantId mapping as part of authentication

**Alternative considered**: Infer tenant from subdomain only on login — rejected because localhost has no subdomain, would require different login flows.

### 4. JWT token claims structure
**Decision**: Access token JWT contains: { sub: userId, tenantId, role, exp } signed with RS256.

**Rationale**: 
- Standard JWT claims structure
- tenantId in claims allows validation against subdomain-derived tenant
- role in claims enables role-based authorization
- RS256 provides asymmetric crypto (public key for validation, private for signing)

**Alternative considered**: HS256 symmetric signing — rejected as less secure (same key for signing and validation).

### 5. Refresh token storage: database with rotation
**Decision**: Refresh tokens are opaque UUIDs stored in database with userId, tenantId, deviceId, expiry, revoked flag. Implement token rotation (new token invalidates old).

**Rationale**: 
- Revocation support (admin can revoke user sessions)
- Device tracking for audit trail
- Rotation prevents replay attacks
- Database persistence survives server restarts

**Alternative considered**: Stateless JWT refresh tokens — rejected because they cannot be revoked without blacklisting, which defeats the purpose.

### 6. TenantContext: remove hardcoded user fallback
**Decision**: Remove getCurrentUser() hardcoded fallback. User identity must come from JWT authentication only.

**Rationale**: 
- No authentication = no user identity (fail secure)
- Forces proper authentication implementation
- Eliminates security risk of fallback being used accidentally

**Alternative considered**: Keep fallback for development — rejected based on user requirement for no fallbacks.

### 7. Security filter chain: JWT filter + disable CSRF
**Decision**: Add custom JWT authentication filter that reads Authorization header, validates token, sets SecurityContext. Disable CSRF (not needed with Bearer tokens).

**Rationale**: 
- Bearer tokens don't need CSRF protection
- Simplifies configuration
- JWT filter provides standard Spring Security integration

**Alternative considered**: Use Spring Security's built-in JWT support — considered, but custom filter gives more control over error handling and claim extraction.

### 8. Frontend token storage: localStorage or Redux
**Decision**: Store tokens in localStorage or Redux state (user choice). Attach via Authorization header on all requests.

**Rationale**: 
- Simple implementation
- Tokens persist across page refreshes
- Redux integration for auth state management

**Trade-offs**: Vulnerable to XSS if application has XSS vulnerabilities. Mitigated by CSP.

**Alternative considered**: Session storage — rejected because tokens don't persist across tabs/windows.

### 9. 401 handling: automatic refresh with retry
**Decision**: Axios interceptor detects 401, calls /api/auth/refresh with refreshToken, stores new tokens, retries original request. If refresh fails, redirect to login.

**Rationale**: 
- Seamless user experience (silent refresh)
- Standard pattern for token-based auth
- Handles access token expiry gracefully

**Alternative considered**: Redirect to login on any 401 — rejected as poor UX (users would be logged out frequently).

### 10. Unknown subdomain: return 401 unauthorized
**Decision**: If subdomain doesn't map to any tenant, return 401 (not 404).

**Rationale**: 
- Treats unknown tenant as authentication failure
- Doesn't leak information about which tenants exist
- Consistent with security posture

**Alternative considered**: Return 404 — rejected as it could be used for tenant enumeration.

## Risks / Trade-offs

- **[Risk] XSS can steal Bearer tokens from localStorage** → Mitigation: Implement Content Security Policy (CSP) headers, sanitize user input, use React's built-in XSS protection. Consider secure storage mechanisms for sensitive environments.
- **[Risk] Subdomain infrastructure required for production** → Mitigation: Document DNS/wildcard TLS requirements. Use sslip.io or lvh.me for local development testing. Localhost uses hardcoded tenantCode.
- **[Risk] Token rotation could cause race conditions** → Mitigation: Use database transactions when rotating tokens. Mark old token as revoked before issuing new one.
- **[Risk] Refresh token database becomes large** → Mitigation: Implement cleanup job to purge expired/revoked sessions. Add TTL if using Redis in future.
- **[Risk] JWT key rotation requires coordination** → Mitigation: Document key rotation procedure. Support multiple public keys during transition period.
- **[Risk] Clock skew causes token expiry issues** → Mitigation: Use reasonable expiry times (5-10 min for access, 30 days for refresh). Consider leeway in JWT validation.
- **[Risk] Subdomain extraction fails on misconfigured proxies** → Mitigation: Support X-Forwarded-Host header for reverse proxy scenarios. Add logging for tenant resolution failures.
- **[Risk] Migration from header-based auth breaks existing clients** → Mitigation: This is an intentional breaking change. Document migration path. Consider parallel implementation period if needed (but user requested immediate removal).

## Implementation Notes

### Database Schema Changes
```sql
-- Add to tenant table
ALTER TABLE tenant ADD COLUMN tenant_code VARCHAR(50) UNIQUE NOT NULL;

-- Add to app_user table
ALTER TABLE app_user ADD COLUMN password_hash VARCHAR(255);
ALTER TABLE app_user ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE app_user ADD COLUMN must_reset_password BOOLEAN DEFAULT FALSE;

-- Create refresh_sessions table
CREATE TABLE refresh_sessions (
    id BINARY(16) PRIMARY KEY,
    user_id BINARY(16) NOT NULL,
    tenant_id BINARY(16) NOT NULL,
    device_id VARCHAR(255),
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES app_user(id),
    FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    INDEX idx_user_tenant (user_id, tenant_id),
    INDEX idx_token_hash (token_hash)
);
```

### Frontend Tenant Code Extraction
```typescript
const getTenantCode = (): string => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'HMA001'; // Hardcoded for local development
  }
  // Extract subdomain: aurora-med.dispensapro.com → aurora-med
  const parts = hostname.split('.');
  return parts[0];
};
```

### Backend Subdomain Extraction
```java
private String extractSubdomain(String host) {
    if (host.equals("localhost") || host.equals("127.0.0.1")) {
        return null; // Localhost uses tenantCode from login request
    }
    String[] parts = host.split("\\.");
    return parts[0]; // Extract first part as subdomain
}
```

### Keycloak Migration Path
The JWT-based design is Keycloak-ready:
- Token format: Standard JWT with RS256 (same as Keycloak)
- Claims structure: Compatible with Keycloak role mappers
- Tenant identity: Can be carried in Keycloak realm or custom attribute
- Migration steps: Replace JWT validation with JWKS endpoint, swap login UI for Keycloak hosted login
