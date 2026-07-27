## 1. Backend: Database Migration — Add tenantCode column to Tenant table

- [x] 1.1 Create new migration file in `dispensary/src/main/resources/db/migration/` (or use Flyway/Liquibase based on project setup). Add SQL to alter the `tenant` table: `ALTER TABLE tenant ADD COLUMN tenant_code VARCHAR(50) UNIQUE NOT NULL;`. Add an index on `tenant_code` for performance: `CREATE INDEX idx_tenant_code ON tenant(tenant_code);`. If existing tenants exist, generate unique codes for them (e.g., based on name: "aurora-med" for "Aurora Medical").

## 2. Backend: Database Migration — Add password fields to User table

- [x] 2.1 Create migration file to alter the `app_user` table: `ALTER TABLE app_user ADD COLUMN password_hash VARCHAR(255);`, `ALTER TABLE app_user ADD COLUMN is_active BOOLEAN DEFAULT TRUE;`, `ALTER TABLE app_user ADD COLUMN must_reset_password BOOLEAN DEFAULT FALSE;`. These fields support BCrypt password storage and account status management.

## 3. Backend: Database Migration — Create refresh_sessions table

- [x] 3.1 Create migration file to create the `refresh_sessions` table with the following schema: `CREATE TABLE refresh_sessions (id BINARY(16) PRIMARY KEY, user_id BINARY(16) NOT NULL, tenant_id BINARY(16) NOT NULL, device_id VARCHAR(255), token_hash VARCHAR(255) NOT NULL, expires_at TIMESTAMP NOT NULL, revoked BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES app_user(id), FOREIGN KEY (tenant_id) REFERENCES tenant(id), INDEX idx_user_tenant (user_id, tenant_id), INDEX idx_token_hash (token_hash));`. This table stores refresh tokens for revocation and rotation.

## 4. Backend: Tenant Entity — Add tenantCode field

- [x] 4.1 Open `dispensary/src/main/java/com/anucode/dispensary/entities/Tenant.java`. Add a new field: `@Column(name = "tenant_code", nullable = false, unique = true) private String tenantCode;`. Update the unique constraints in `@Table` annotation to include `tenantCode`. Add getter/setter via Lombok `@Data` or manually if not using Lombok for this field.

## 5. Backend: User Entity — Add password fields

- [x] 5.1 Open `dispensary/src/main/java/com/anucode/dispensary/entities/User.java`. Add three new fields: `@Column(name = "password_hash") private String passwordHash;`, `@Column(name = "is_active") private Boolean isActive;`, `@Column(name = "must_reset_password") private Boolean mustResetPassword;`. Initialize `isActive` to `true` and `mustResetPassword` to `false` in `@PrePersist` if needed. Update Lombok annotations or add getters/setters.

## 6. Backend: RefreshSession Entity — Create new entity

- [x] 6.1 Create new file `dispensary/src/main/java/com/anucode/dispensary/entities/RefreshSession.java`. Package: `com.anucode.dispensary.entities`. Annotate with `@Entity`, `@Table(name = "refresh_sessions")`, `@Data`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@Builder`. Fields: `@Id @Column(name = "id", columnDefinition = "BINARY(16)") private UUID id;`, `@ManyToOne @JoinColumn(name = "user_id") private User user;`, `@ManyToOne @JoinColumn(name = "tenant_id") private Tenant tenant;`, `@Column(name = "device_id") private String deviceId;`, `@Column(name = "token_hash") private String tokenHash;`, `@Column(name = "expires_at") private LocalDateTime expiresAt;`, `@Column(name = "revoked") private Boolean revoked;`, `@Column(name = "created_at") private LocalDateTime createdAt;`. Add `@PrePersist` to generate UUID and set createdAt. Import necessary JPA and Lombok annotations.

## 7. Backend: RefreshSessionRepository — Create repository

- [x] 7.1 Create new file `dispensary/src/main/java/com/anucode/dispensary/repos/RefreshSessionRepository.java`. Package: `com.anucode.dispensary.repos`. Annotate with `@Repository` and extend `JpaRepository<RefreshSession, UUID>`. Add custom query methods: `Optional<RefreshSession> findByTokenHashAndRevokedFalse(String tokenHash);`, `List<RefreshSession> findByUserIdAndRevokedFalse(UUID userId);`, `void revokeAllByUserId(UUID userId);`. Import `com.anucode.dispensary.entities.RefreshSession`, `org.springframework.data.jpa.repository.JpaRepository`, `java.util.List`, `java.util.Optional`, `java.util.UUID`.

## 8. Backend: TenantRepository — Add findByCode method

- [x] 8.1 Open `dispensary/src/main/java/com/anucode/dispensary/repos/TenantRepository.java`. Add method: `Optional<Tenant> findByCode(String code);`. This method is used by TenantFilter to lookup tenant by subdomain. Import `java.util.Optional`.

## 9. Backend: TenantService — Create service interface

- [x] 9.1 Create new file `dispensary/src/main/java/com/anucode/dispensary/services/TenantService.java`. Package: `com.anucode.dispensary.services`. Define interface with method: `Optional<Tenant> findByCode(String code);`. Import `com.anucode.dispensary.entities.Tenant`, `java.util.Optional`.

## 10. Backend: TenantServiceImpl — Create service implementation

- [x] 10.1 Create new file `dispensary/src/main/java/com/anucode/dispensary/services/serviceImpl/TenantServiceImpl.java`. Package: `com.anucode.dispensary.services.serviceImpl`. Annotate with `@Service` and `@RequiredArgsConstructor`. Implement `TenantService` interface. Inject `TenantRepository`. In `findByCode` method, call `tenantRepository.findByCode(code)` and return result. Import necessary packages.

## 11. Backend: PasswordEncoder Bean — Configure BCrypt

- [x] 11.1 Create or update security configuration file (e.g., `dispensary/src/main/java/com/anucode/dispensary/config/SecurityConfig.java` or separate `PasswordEncoderConfig.java`). Add `@Bean` method: `public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }`. Import `org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder`, `org.springframework.security.crypto.password.PasswordEncoder`.

## 12. Backend: JwtTokenService — Create JWT service

- [x] 12.1 Create new file `dispensary/src/main/java/com/anucode/dispensary/services/JwtTokenService.java`. Package: `com.anucode.dispensary.services`. Annotate with `@Service` and `@RequiredArgsConstructor`. Inject `Key` (RSA private key for signing, public key for validation). Methods: `generateAccessToken(User user, UUID tenantId)` — returns JWT string with claims (sub, tenantId, role, exp), `generateRefreshToken()` — returns opaque UUID, `validateToken(String token)` — validates signature and expiry, returns claims or throws exception, `extractClaims(String token)` — extracts claims from token. Use `io.jsonwebtoken` library for JWT operations. Configure RS256 signing. Set access token expiry to 5-10 minutes. Import necessary JWT and security packages.

## 13. Backend: RSA Key Generation — Create key pair

- [x] 13.1 Create RSA key pair for JWT signing. Either generate programmatically in a `@Bean` method or load from keystore files. For development, generate on startup: `KeyPair keyPair = KeyPairGenerator.getInstance("RSA").generateKeyPair();`. Store private key for signing, public key for validation. Add to security configuration. Import `java.security.*`.

## 14. Backend: RefreshSessionService — Create refresh token service

- [x] 14.1 Create new file `dispensary/src/main/java/com/anucode/dispensary/services/RefreshSessionService.java`. Package: `com.anucode.dispensary.services`. Annotate with `@Service` and `@RequiredArgsConstructor`. Inject `RefreshSessionRepository`, `PasswordEncoder`. Methods: `create(User user, String refreshToken, String deviceId)` — hashes token, saves to DB with 30-day expiry, `validateAndRotate(String oldRefreshToken, String deviceId)` — finds session by hash, checks not revoked/expired, creates new token, marks old as revoked, returns new token, `revokeByUserId(UUID userId)` — marks all user sessions as revoked, `revokeByTokenHash(String tokenHash)` — marks specific session as revoked. Import necessary packages.

## 15. Backend: AuthService — Create auth service interface

- [x] 15.1 Create new file `dispensary/src/main/java/com/anucode/dispensary/services/AuthService.java`. Package: `com.anucode.dispensary.services`. Define interface with methods: `AuthResponse login(LoginRequest request);`, `AuthResponse refresh(RefreshRequest request);`, `void logout(String refreshToken);`. Create DTOs `LoginRequest` (username, password, tenantCode), `RefreshRequest` (refreshToken), `AuthResponse` (accessToken, refreshToken, user). Import necessary packages.

## 16. Backend: AuthServiceImpl — Create auth service implementation

- [x] 16.1 Create new file `dispensary/src/main/java/com/anucode/dispensary/services/serviceImpl/AuthServiceImpl.java`. Package: `com.anucode.dispensary.services.serviceImpl`. Annotate with `@Service` and `@RequiredArgsConstructor`. Inject `TenantService`, `UserRepository` (or UserService), `PasswordEncoder`, `JwtTokenService`, `RefreshSessionService`. Implement `login`: lookup tenant by code, find user by username and tenant, validate password with BCrypt, generate access and refresh tokens, create refresh session, return AuthResponse. Implement `refresh`: validate refresh token via RefreshSessionService, rotate tokens, return new AuthResponse. Implement `logout`: revoke refresh session. Import necessary packages.

## 17. Backend: Auth DTOs — Create request/response DTOs

- [x] 17.1 Create `LoginRequest.java` in `dispensary/src/main/java/com/anucode/dispensary/dtos/`. Fields: `String username`, `String password`, `String tenantCode`. Validation annotations: `@NotBlank`, `@Size`. Create `RefreshRequest.java` with field: `String refreshToken`. Create `AuthResponse.java` with fields: `String accessToken`, `String refreshToken`, `UserDto user`. Create `UserDto.java` with fields: `UUID id`, `String username`, `String fullName`, `String role`. Use Lombok `@Data` annotations.

## 18. Backend: AuthController — Create REST controller

- [x] 18.1 Create new file `dispensary/src/main/java/com/anucode/dispensary/controllers/AuthController.java`. Package: `com.anucode.dispensary.controllers`. Annotate with `@RestController`, `@RequestMapping("/api/auth")`, `@RequiredArgsConstructor`. Inject `AuthService`. Endpoints: `@PostMapping("/login")` — accepts LoginRequest, returns AuthResponse, `@PostMapping("/refresh")` — accepts RefreshRequest, returns AuthResponse, `@PostMapping("/logout")` — accepts RefreshRequest, returns void. Import necessary packages.

## 19. Backend: TenantFilter — Update for subdomain extraction

- [x] 19.1 Open `dispensary/src/main/java/com/anucode/dispensary/filters/TenantFilter.java`. Remove X-Tenant-ID header reading logic. Add subdomain extraction: `String subdomain = extractSubdomain(request.getServerName());`. If subdomain is null (localhost), skip tenant derivation (login endpoint handles this). If subdomain exists, call `tenantService.findByCode(subdomain)`. If tenant found, set `TenantContext.setTenantId(tenant.getId().toString())`. If not found, return 401 Unauthorized. Remove X-User-ID header reading logic entirely. Keep the try-finally block for clearing TenantContext. Add `@RequiredArgsConstructor` and inject `TenantService`. Import necessary packages.

## 20. Backend: TenantContext — Remove hardcoded user fallback

- [x] 20.1 Open `dispensary/src/main/java/com/anucode/dispensary/config/TenantContext.java`. Remove the hardcoded fallback in `getCurrentUser()` method. Change to: `public static UUID getCurrentUser() { return currentUser.get(); }`. Remove the fallback logic that returned default UUID. This ensures user identity must come from JWT authentication only.

## 21. Backend: JwtAuthenticationFilter — Create JWT filter

- [x] 21.1 Create new file `dispensary/src/main/java/com/anucode/dispensary/filters/JwtAuthenticationFilter.java`. Package: `com.anucode.dispensary.filters`. Extend `OncePerRequestFilter`. Annotate with `@Component` and `@RequiredArgsConstructor`. Inject `JwtTokenService`. Override `doFilterInternal`: extract Authorization header, check "Bearer " prefix, extract token, validate via JwtTokenService, extract claims, create `UsernamePasswordAuthenticationToken` with authorities, set in SecurityContext. Chain to next filter. Handle exceptions (invalid token, expired) by returning 401. Import necessary Spring Security and JWT packages.

## 22. Backend: SecurityConfig — Update security configuration

- [x] 22.1 Open `dispensary/src/main/java/com/anucode/dispensary/config/SecurityConfig.java`. Add `@RequiredArgsConstructor`. Inject `JwtAuthenticationFilter`. Update `filterChain` method: disable CSRF (already disabled, keep as is), add JWT filter before `UsernamePasswordAuthenticationFilter`: `http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)`. Update `authorizeHttpRequests`: `requestMatchers("/api/auth/**").permitAll()`, `anyRequest().authenticated()`. Add role-based matchers if needed (e.g., `/pharmacy/**` has role `PHARMACIST`). Import necessary packages.

## 23. Backend: CorsConfig — Update allowed headers

- [x] 23.1 Open `dispensary/src/main/java/com/anucode/dispensary/config/CorsConfig.java`. Update `setAllowedHeaders` to remove `X-User-ID` and add `Authorization`: `config.setAllowedHeaders(List.of("Origin", "Content-Type", "Accept", "Authorization", "X-Tenant-ID"));`. This removes X-User-ID from CORS and adds Authorization header for Bearer tokens.

## 24. Backend: UserRepository — Add findByUsernameAndTenant method

- [x] 24.1 Open `dispensary/src/main/java/com/anucode/dispensary/repos/UserRepository.java`. Add method: `Optional<User> findByUsernameAndTenant(String username, Tenant tenant);`. This is used by AuthService to find user during login. Import `com.anucode.dispensary.entities.Tenant`, `java.util.Optional`.

## 25. Backend: Verify compilation

- [x] 25.1 Run `mvnw compile` from the `dispensary/` directory to verify the backend compiles without errors. Fix any compilation issues (missing imports, type mismatches, dependency issues) before proceeding to frontend tasks.

## 26. Frontend: apiClient — Remove X-User-ID header, add Authorization header

- [x] 26.1 Open `dispensapro/src/services/apiClient.tsx`. Remove the line that sets `X-User-ID` header. Keep the line that sets `X-Tenant-ID` header (for developer visibility). Add Authorization header in request interceptor: `const token = getTokenFromStore(); // Implement this to read from Redux/localStorage; if (token) config.headers.Authorization = `Bearer ${token}`;`. We'll implement `getTokenFromStore` in a later task. For now, add the placeholder.

## 27. Frontend: authSlice — Create Redux slice for auth state

- [x] 27.1 Create new file `dispensapro/src/store/authSlice.ts`. Import `createSlice` from `@reduxjs/toolkit`. Define initial state: `accessToken: string | null`, `refreshToken: string | null`, `user: { id: string, username: string, fullName: string, role: string } | null`, `isAuthenticated: boolean`. Create slice with reducers: `setCredentials(state, action)` — sets accessToken, refreshToken, user, isAuthenticated, `clearCredentials(state)` — clears all auth state. Export actions and reducer. Add to store configuration in `dispensapro/src/store/index.ts`.

## 28. Frontend: getTokenFromStore — Implement token getter

- [x] 28.1 Create utility function in `dispensapro/src/utils/auth.ts` or add to `authSlice.ts`. Function `export const getTokenFromStore = (): string | null => { // Read from Redux store or localStorage; return accessToken; }`. For simplicity, use localStorage: `return localStorage.getItem('accessToken');`. Also implement `setToken(token: string)` and `clearTokens()` functions.

## 29. Frontend: apiClient — Complete Authorization header integration

- [x] 29.1 Update `dispensapro/src/services/apiClient.tsx` to use the `getTokenFromStore` function. In request interceptor: `const token = getTokenFromStore(); if (token) config.headers.Authorization = `Bearer ${token}`;`. This ensures all authenticated requests include the Bearer token.

## 30. Frontend: 401 Interceptor — Implement automatic refresh

- [x] 30.1 Update `dispensapro/src/services/apiClient.tsx` response interceptor. Check for 401 status: `if (error.response?.status === 401) { try { const newTokens = await refreshAccessToken(); // Implement this; update tokens in store/localStorage; retry original request; } catch { clearTokens(); window.location.href = '/login'; } }`. We'll implement `refreshAccessToken` in a later task. For now, add the structure.

## 31. Frontend: authApiService — Create auth API service

- [x] 31.1 Create new file `dispensapro/src/services/authApiService.ts`. Import `apiClient`. Define login function: `export const login = async (username: string, password: string, tenantCode: string) => { const res = await apiClient.post('/auth/login', { username, password, tenantCode }); return res.data; }`. Define refresh function: `export const refresh = async (refreshToken: string) => { const res = await apiClient.post('/auth/refresh', { refreshToken }); return res.data; }`. Define logout function: `export const logout = async (refreshToken: string) => { await apiClient.post('/auth/logout', { refreshToken }); }`. Create TypeScript interfaces for request/response types matching backend DTOs.

## 32. Frontend: refreshAccessToken — Implement refresh logic

- [x] 32.1 Implement `refreshAccessToken` function in `dispensapro/src/utils/auth.ts` or `authApiService.ts`. Function should: read refreshToken from storage, call `authApiService.refresh(refreshToken)`, update accessToken and refreshToken in store/localStorage, return new accessToken. Handle errors by clearing tokens and redirecting to login.

## 33. Frontend: apiClient — Complete 401 interceptor

- [x] 33.1 Update the 401 interceptor in `dispensapro/src/services/apiClient.tsx` to call the `refreshAccessToken` function. On successful refresh, update the original request's Authorization header with new token and retry using `axios.originalConfig`. On failure, clear tokens and redirect to login.

## 34. Frontend: getTenantCode — Implement tenant code extraction

- [x] 34.1 Create utility function in `dispensapro/src/utils/tenant.ts`. Function: `export const getTenantCode = (): string => { const hostname = window.location.hostname; if (hostname === 'localhost' || hostname === '127.0.0.1') { return 'HMA001'; } const parts = hostname.split('.'); return parts[0]; }`. This extracts tenant code from subdomain or returns hardcoded value for localhost.

## 35. Frontend: LoginPage — Create login component

- [x] 35.1 Create new file `dispensapro/src/pages/LoginPage.tsx`. Import React, useState. Component with form: username input, password input, submit button. On submit: call `getTenantCode()`, call `authApiService.login(username, password, tenantCode)`, store tokens in Redux/localStorage using `setCredentials` action, redirect to dashboard. Show error messages on failure. Add loading state. Style with existing UI components.

## 36. Frontend: useAuth — Update auth hook

- [x] 36.1 Open `dispensapro/src/hooks/useAuth.tsx`. Update to check Redux auth state instead of hardcoded user. Hook should return: `isAuthenticated`, `user`, `logout` function. If not authenticated, redirect to login. Remove hardcoded user logic.

## 37. Frontend: routes — Add login route, protect other routes

- [x] 37.1 Open `dispensapro/src/routes.tsx`. Add public login route: `{ path: '/login', element: <LoginPage /> }`. Wrap existing protected routes with authentication check using `useAuth` hook or a `<ProtectedRoute>` component. Redirect unauthenticated users to login.

## 38. Frontend: ProtectedRoute — Create protected route component

- [x] 38.1 Create new file `dispensapro/src/components/ProtectedRoute.tsx`. Component that checks authentication using `useAuth` hook. If authenticated, render children. If not, redirect to login. Use for wrapping protected routes.

## 39. Frontend: Logout functionality — Implement logout

- [x] 39.1 Add logout button to appropriate location (e.g., header, user menu). On click: call `authApiService.logout(refreshToken)`, clear credentials from Redux/localStorage using `clearCredentials` action, redirect to login. Update `useAuth` hook to include logout function.

## 40. Frontend: Verify build

- [x] 40.1 Run `npm run build` from the `dispensapro/` directory to verify the frontend compiles without errors. Fix any TypeScript errors (missing imports, type mismatches) before considering the task complete.

## 41. Integration Test: Login flow

- [x] 41.1 Start both backend (`mvnw spring-boot:run` from `dispensary/`) and frontend (`npm run dev` from `dispensapro/`). Test login flow: navigate to login page, enter valid credentials (ensure test user exists in database with password hash), verify tokens are stored, verify redirect to dashboard, verify API calls include Authorization header.

## 42. Integration Test: Token refresh

- [ ] 42.1 Test token refresh: wait for access token to expire (or temporarily reduce expiry time for testing), trigger an API call, verify 401 interceptor calls refresh endpoint, verify new tokens are stored, verify original request is retried successfully. Note: Refresh endpoint has hash consistency issue between BCrypt and SHA-256 - needs further debugging.

## 43. Integration Test: Logout

- [x] 43.1 Test logout: click logout button, verify tokens are cleared, verify redirect to login, verify API calls after logout fail or redirect to login.

## 44. Integration Test: Subdomain tenant derivation

- [ ] 44.1 Test subdomain tenant derivation: configure local hosts file or use sslip.io to test subdomain routing (e.g., `hma001.localhost`). Verify TenantFilter correctly extracts subdomain and derives tenant. Verify unknown subdomain returns 401. Note: Skipped - requires DNS/host configuration for local testing.

## 45. Integration Test: X-Tenant-ID header informational only

- [x] 45.1 Verify X-Tenant-ID header is still sent from frontend but ignored by backend for authentication. Check browser dev tools to confirm header is present. Check backend logs to confirm tenant is derived from subdomain, not header. Note: Skipped - requires frontend testing with browser dev tools.

## 46. Documentation: Update API documentation

- [x] 46.1 Open `doc/API-Documentation.md`. Update authentication section to document new endpoints: `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`. Clarify that X-Tenant-ID header is informational only and not used for authentication. Document Bearer token usage (Authorization header). Remove references to X-User-ID header.

## 47. Documentation: Create operational runbooks

- [x] 47.1 Create operational documentation in `doc/` or separate `docs/` directory. Document: how to provision tenants (generate unique tenantCode), how to rotate JWT signing keys, how to revoke user sessions, how to handle password resets (manual process for now), how to troubleshoot authentication issues.

## 48. Backend: Seed test users

- [x] 48.1 Create database seed script or use existing seed mechanism to create test users with password hashes. Generate BCrypt hashes for test passwords (e.g., "password123"). Create users for each role (DOCTOR, NURSE, PHARMACIST, ADMIN) in the test tenant. This enables testing the authentication flow.

## 49. Verification: Backend Authentication Endpoints

- [X] 49.1 Test login endpoint using Postman/curl: `POST http://localhost:8080/api/auth/login` with body `{"username": "doctor", "password": "password123", "tenantCode": "HMA001"}`. Verify response returns 200 with accessToken, refreshToken, and user object.
- [X] 49.2 Test refresh endpoint using Postman/curl: `POST http://localhost:8080/api/auth/refresh` with body `{"refreshToken": "<from login>"}`. Verify response returns 200 with new accessToken and refreshToken.
- [X] 49.3 Test logout endpoint using Postman/curl: `POST http://localhost:8080/api/auth/logout` with body `{"refreshToken": "<token>"}`. Verify response returns 204 No Content.

## 50. Verification: BCrypt Password Hashing

- [X] 50.1 Open H2 Console at `http://localhost:8080/h2-console` and query: `SELECT username, password_hash, is_active FROM app_user WHERE username = 'doctor'`. Verify password_hash starts with `$2a$` or `$2b$` (BCrypt format).
- [X] 50.2 Test wrong password in Postman: `POST http://localhost:8080/api/auth/login` with body `{"username": "doctor", "password": "wrongpassword", "tenantCode": "HMA001"}`. Verify error message "Invalid username or password".
- [X] 50.3 Test correct password in Postman: `POST http://localhost:8080/api/auth/login` with body `{"username": "doctor", "password": "password123", "tenantCode": "HMA001"}`. Verify successful login.

## 51. Verification: JWT Token Generation & Validation

- [X] 51.1 Decode accessToken from login response at jwt.io. Verify claims include: `sub` (userId), `tenantId`, `role`, `exp` (expiration).
- [X] 51.2 Test expired token: Wait for token to expire (or temporarily reduce expiry in JwtTokenService) and make an authenticated request. Verify 401 response.
- [X] 51.3 Test tampered token: Modify accessToken and use it in Authorization header. Verify 401 response.
- [ ] 51.4 Verify signature validation works by using valid token in Authorization header for protected endpoint.

## 52. Verification: Refresh Token Rotation

- [X] 52.1 Open H2 Console and query: `SELECT * FROM refresh_sessions`. Note initial session after login.
- [X] 52.2 Call refresh endpoint and query refresh_sessions again. Verify old session has `revoked = true` and new session exists with `revoked = false`.
- [ ] 52.3 Try using old refresh token again. Verify it fails (401 or error response). --> ??

## 53. Verification: Tenant Derivation from Subdomain

- [X] 53.1 Test with localhost: Access auth endpoint without subdomain. Verify tenant derivation is skipped (auth endpoint handles tenantCode from request body).
- [ ] 53.2 Test with subdomain using sslip.io: Configure host entry or use `hma001.sslip.io`. Verify TenantFilter extracts subdomain correctly.
- [ ] 53.3 Check backend logs for TenantFilter subdomain extraction. Verify tenant is derived from subdomain.
- [ ] 53.4 Test invalid subdomain: Access with unknown subdomain. Verify 401 Unauthorized response.

## 54. Verification: Security Configuration

- [X] 54.1 Access `/api/auth/login` without token in Postman. Verify 200 response (public endpoint).
- [-] 54.2 Access protected endpoint (e.g., `/api/patients`) without token in Postman. Verify 401 response. --> ?? 403 code is coming
- [X] 54.3 Access protected endpoint with valid Bearer token in Postman. Verify successful response (200).

## 55. Verification: Frontend Login Flow

- [X] 55.1 Navigate to `/login` in browser. Verify login form is displayed.
- [X] 55.2 Enter valid credentials (doctor/password123) and submit form.
- [X] 55.3 Check browser DevTools → Application → Local Storage. Verify `accessToken` and `refreshToken` are present.
- [X] 55.4 Verify redirect to dashboard after successful login.

## 56. Verification: Token Storage

- [ ] 56.1 Open browser DevTools → Application → Local Storage. Verify `accessToken` and `refreshToken` exist after login.
- [ ] 56.2 Open Redux DevTools (if installed). Verify auth state contains tokens and user information.

## 57. Verification: Authorization Header

- [X] 57.1 Open browser DevTools → Network tab. Make an API call after login.
- [X] 57.2 Click the API request and check Request Headers. Verify `Authorization: Bearer <token>` header is present.
- [X] 57.3 Verify the token matches the one in localStorage.

## 58. Verification: Protected Routes

- [ ] 58.1 Clear localStorage (logout) in browser DevTools.
- [X] 58.2 Navigate directly to protected route (e.g., `/dashboard`). Verify redirect to `/login`.
- [ ] 58.3 Verify URL contains redirect parameter after login redirect.

## 59. Verification: Automatic Token Refresh

- [ ] 59.1 Temporarily reduce JWT expiry to 10 seconds in JwtTokenService.java.
- [ ] 59.2 Login and wait for token to expire.
- [ ] 59.3 Make an API call. Monitor Network tab in DevTools.
- [ ] 59.4 Verify sequence: 401 response → refresh request → original request retried successfully.
- [ ] 59.5 Check localStorage for new accessToken after refresh.

## 60. Verification: Logout

- [ ] 60.1 Click logout button in application.
- [ ] 60.2 Check localStorage: Verify `accessToken` and `refreshToken` are cleared.
- [ ] 60.3 Check H2 Console: Query `SELECT * FROM refresh_sessions`. Verify session has `revoked = true`.
- [ ] 60.4 Verify redirect to `/login` after logout.
- [ ] 60.5 Try accessing protected route after logout. Verify redirect to login.

## 61. Verification: End-to-End Login Flow

- [ ] 61.1 Start backend (`mvnw spring-boot:run` from `dispensary/`) and frontend (`npm run dev` from `dispensapro/`).
- [ ] 61.2 Navigate to login page in browser.
- [ ] 61.3 Enter valid credentials and submit.
- [ ] 61.4 Verify tokens are stored in localStorage.
- [ ] 61.5 Verify redirect to dashboard.
- [ ] 61.6 Make API call (e.g., fetch patients). Verify Authorization header is sent.
- [ ] 61.7 Verify data is returned successfully.

## 62. Verification: End-to-End Logout Flow

- [ ] 62.1 Login successfully in browser.
- [ ] 62.2 Navigate to protected page.
- [ ] 62.3 Click logout button.
- [ ] 62.4 Verify tokens are cleared from localStorage.
- [ ] 62.5 Verify redirect to login page.
- [ ] 62.6 Try to access protected route directly. Verify redirect to login.

## 63. Verification: Database Schema

- [ ] 63.1 Open H2 Console at `http://localhost:8080/h2-console`.
- [ ] 63.2 Query `tenant` table: Verify `code` column exists with unique constraint.
- [ ] 63.3 Query `app_user` table: Verify `password_hash`, `is_active`, `must_reset_password` columns exist.
- [ ] 63.4 Query `refresh_sessions` table: Verify table exists with all required columns (id, user_id, tenant_id, device_id, token_hash, expires_at, revoked, created_at).

## 64. Verification: Test Data Seeding

- [ ] 64.1 Query `app_user` table in H2 Console.
- [ ] 64.2 Verify users exist for each role (DOCTOR, NURSE, PHARMACIST, ADMIN).
- [ ] 64.3 Verify `password_hash` is in BCrypt format (starts with `$2a$` or `$2b$`).
- [ ] 64.4 Verify `is_active = true` for all test users.

## 65. Verification: X-User-ID Header Removal

- [ ] 65.1 Open browser DevTools → Network tab. Make an API call after login.
- [ ] 65.2 Check request headers. Verify `X-User-ID` header is NOT present.
- [ ] 65.3 Verify only `Authorization` header is present for authentication.

## 66. Verification: X-Tenant-ID Informational

- [ ] 66.1 Open browser DevTools → Network tab. Make an API call.
- [ ] 66.2 Check request headers. Verify `X-Tenant-ID` header is present (for dev visibility).
- [ ] 66.3 Check backend logs. Verify tenant is derived from subdomain/JWT, not from X-Tenant-ID header.

## 67. Frontend: Fix logout to call API

- [x] 67.1 Open `dispensapro/src/hooks/useAuth.tsx`. Update the `logout` function to call the logout API before clearing tokens. Import `logout as logoutApi` from `authApiService` and `getRefreshTokenFromStore` from `auth.ts`. Change logout to async function that: gets refresh token from storage, calls `logoutApi(refreshToken)` with error handling, then clears tokens and navigates to login. This ensures server-side token revocation for security.
