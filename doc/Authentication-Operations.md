# Authentication Operations Guide

This document provides operational procedures for managing authentication in the DispensaryApp system.

## Tenant Provisioning

### Creating a New Tenant

1. **Generate Unique Tenant Code**
   - Use a short, memorable code (e.g., "HMA001" for Himalaya Medical Associates)
   - Ensure the code is unique across the system
   - Format: 3-6 character alphanumeric code

2. **Create Tenant via API**
   ```bash
   POST http://localhost:8080/tenants?name={tenantName}&code={tenantCode}
   ```

   Example:
   ```bash
   POST http://localhost:8080/tenants?name=City+Hospital&code=CITY001
   ```

3. **Verify Tenant Creation**
   ```bash
   GET http://localhost:8080/tenants
   ```

4. **Configure DNS**
   - Add subdomain for the tenant (e.g., `hma001.yourdomain.com`)
   - Point subdomain to your application server

### Tenant Code Best Practices
- Use consistent naming conventions
- Avoid special characters
- Keep codes short and memorable
- Document the mapping between codes and organization names

## JWT Key Rotation

### Current Key Setup
- The system uses RSA-256 keys for JWT signing
- Keys are stored in the application configuration
- Private key signs tokens, public key validates them

### Key Rotation Procedure

1. **Generate New RSA Key Pair**
   ```bash
   # Generate private key
   openssl genrsa -out private_key.pem 2048
   
   # Generate public key
   openssl rsa -in private_key.pem -pubout -out public_key.pem
   ```

2. **Backup Current Keys**
   - Save current private and public keys securely
   - Document the rotation date

3. **Update Application Configuration**
   - Replace private key in application configuration
   - Replace public key in application configuration
   - Restart the application

4. **Verify Rotation**
   - Test login with new keys
   - Verify existing tokens are invalidated (expected behavior)
   - Users will need to re-login after key rotation

### Key Rotation Schedule
- Recommended: Rotate keys annually
- After security incident: Rotate immediately
- Keep backup of old keys for audit purposes

## User Session Management

### Revoking User Sessions

#### Revoke All Sessions for a User
```sql
-- Direct database access
UPDATE refresh_sessions SET revoked = true WHERE user_id = '{userId}';
```

#### Revoke Specific Session
```sql
UPDATE refresh_sessions SET revoked = true WHERE id = '{sessionId}';
```

#### Via API (Logout)
```bash
POST http://localhost:8080/api/auth/logout
Content-Type: application/json

{
  "refreshToken": "{refreshToken}"
}
```

### Viewing Active Sessions
```sql
SELECT 
  rs.id,
  u.username,
  t.code as tenant_code,
  rs.device_id,
  rs.expires_at,
  rs.revoked
FROM refresh_sessions rs
JOIN app_user u ON rs.user_id = u.id
JOIN tenant t ON rs.tenant_id = t.id
WHERE rs.revoked = false
  AND rs.expires_at > CURRENT_TIMESTAMP;
```

### Session Cleanup
- Revoked sessions remain in database for audit purposes
- Consider implementing a cleanup job for old revoked sessions
- Recommended retention: 90 days for revoked sessions

## Password Reset

### Current Process (Manual)

Since automated password reset is not yet implemented, follow this manual process:

1. **Verify User Identity**
   - Confirm user identity through phone or in-person verification
   - Document the reset request

2. **Generate Temporary Password**
   - Generate a secure temporary password
   - Example: `TempPass2024!`

3. **Hash the New Password**
   ```bash
   # Use BCrypt to hash the password
   # The hash will be stored in the database
   ```

4. **Update Database**
   ```sql
   UPDATE app_user 
   SET password_hash = '{bcryptHash}',
       must_reset_password = true
   WHERE username = '{username}' 
     AND tenant_id = '{tenantId}';
   ```

5. **Communicate New Password**
   - Provide temporary password to user via secure channel
   - Instruct user to change password on first login

6. **Verify Password Change**
   - Confirm user has changed their password
   - Clear the `must_reset_password` flag

### Future Automation
- Implement email-based password reset
- Add security questions
- Implement password complexity requirements
- Add password history tracking

## Troubleshooting Authentication Issues

### Common Issues and Solutions

#### Issue: "Invalid or expired refresh token"
**Symptoms:**
- User cannot refresh their access token
- 401 error on `/api/auth/refresh`

**Solutions:**
1. Check if refresh token exists in database:
   ```sql
   SELECT * FROM refresh_sessions WHERE token_hash = '{hash}';
   ```
2. Verify token is not revoked
3. Check token expiration date
4. If token is lost, user must re-login

#### Issue: "Invalid username or password"
**Symptoms:**
- Login fails with 401 error
- User credentials are correct

**Solutions:**
1. Verify user exists in correct tenant:
   ```sql
   SELECT * FROM app_user 
   WHERE username = '{username}' 
     AND tenant_id = '{tenantId}';
   ```
2. Check if user is active:
   ```sql
   SELECT is_active FROM app_user WHERE id = '{userId}';
   ```
3. Verify password hash matches (requires BCrypt verification)

#### Issue: "Tenant not found"
**Symptoms:**
- Login fails with 404 error
- Tenant code is invalid

**Solutions:**
1. Verify tenant exists:
   ```sql
   SELECT * FROM tenant WHERE code = '{tenantCode}';
   ```
2. Check subdomain configuration
3. Verify TenantFilter is extracting subdomain correctly

#### Issue: JWT validation fails
**Symptoms:**
- Access token rejected by backend
- 401 error on protected endpoints

**Solutions:**
1. Verify JWT signing keys are correct
2. Check token expiration (10 minutes)
3. Verify token format (should be RS256 signed)
4. Check if token contains required claims (sub, tenantId, role)

#### Issue: User cannot login after password change
**Symptoms:**
- User changed password but cannot login
- Password hash may be corrupted

**Solutions:**
1. Manually reset password using the password reset procedure
2. Verify BCrypt encoding is working correctly
3. Check database constraints

### Debugging Tips

1. **Enable SQL Logging**
   - Check `application.properties` for `spring.jpa.show-sql=true`
   - Review SQL queries in logs

2. **Check H2 Console**
   - Access at `http://localhost:8080/h2-console`
   - JDBC URL: `jdbc:h2:file:./data/dispensary`
   - Inspect tables directly

3. **Review Application Logs**
   - Look for authentication-related errors
   - Check for security filter chain issues
   - Verify JWT filter is processing requests

4. **Test with curl**
   ```bash
   # Test login
   curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"doctor","password":"password123","tenantCode":"HMA001"}'
   ```

### Security Considerations

1. **Never log passwords** - Even in debug mode
2. **Protect JWT keys** - Store securely, never commit to version control
3. **Monitor failed login attempts** - Implement rate limiting
4. **Audit session revocations** - Log all session revocations
5. **Regular security audits** - Review authentication logs periodically

## Contact Information

For authentication-related issues that cannot be resolved using this guide:
- Contact the system administrator
- Review the authentication story documentation: `doc/stories/authenticationStory.md`
- Check API documentation: `doc/API-Documentation.md`

---

*Last updated: July 27, 2026*
