package com.anucode.dispensary.services;

import com.anucode.dispensary.entities.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JwtTokenService {

    private final RSAPrivateKey privateKey;
    private final RSAPublicKey publicKey;

    private static final long ACCESS_TOKEN_EXPIRY_MINUTES = 10;
    private static final long REFRESH_TOKEN_EXPIRY_DAYS = 30;

    public String generateAccessToken(User user, UUID tenantId) {
        Instant now = Instant.now();
        Instant expiry = now.plus(ACCESS_TOKEN_EXPIRY_MINUTES, ChronoUnit.MINUTES);

        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("tenantId", tenantId.toString())
                .claim("role", user.getRole().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(privateKey, Jwts.SIG.RS256)
                .compact();
    }

    public String generateRefreshToken() {
        return UUID.randomUUID().toString();
    }

    public Claims validateToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(publicKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            throw new RuntimeException("Invalid or expired token", e);
        }
    }

    public Claims extractClaims(String token) {
        return validateToken(token);
    }

    public UUID extractUserId(String token) {
        Claims claims = extractClaims(token);
        return UUID.fromString(claims.getSubject());
    }

    public UUID extractTenantId(String token) {
        Claims claims = extractClaims(token);
        return UUID.fromString(claims.get("tenantId", String.class));
    }

    public String extractRole(String token) {
        Claims claims = extractClaims(token);
        return claims.get("role", String.class);
    }
}
