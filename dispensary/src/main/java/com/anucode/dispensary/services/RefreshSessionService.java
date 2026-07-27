package com.anucode.dispensary.services;

import com.anucode.dispensary.entities.RefreshSession;
import com.anucode.dispensary.entities.Tenant;
import com.anucode.dispensary.entities.User;
import com.anucode.dispensary.repos.RefreshSessionRepository;
import com.anucode.dispensary.repos.TenantRepository;
import com.anucode.dispensary.repos.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshSessionService {

    private final RefreshSessionRepository refreshSessionRepository;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;

    private static final long REFRESH_TOKEN_EXPIRY_DAYS = 30;

    public RefreshSessionRepository getRepository() {
        return refreshSessionRepository;
    }

    public String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    @Transactional
    public RefreshSession create(User user, String refreshToken, String deviceId) {
        String tokenHash = hashToken(refreshToken);
        LocalDateTime expiresAt = LocalDateTime.now().plus(REFRESH_TOKEN_EXPIRY_DAYS, ChronoUnit.DAYS);

        RefreshSession session = RefreshSession.builder()
                .user(user)
                .tenant(user.getTenant())
                .deviceId(deviceId)
                .tokenHash(tokenHash)
                .expiresAt(expiresAt)
                .revoked(false)
                .build();

        return refreshSessionRepository.save(session);
    }

    @Transactional
    public RefreshTokenResult validateAndRotate(String oldRefreshToken, String deviceId) {
        String oldTokenHash = hashToken(oldRefreshToken);
        Optional<RefreshSession> sessionOpt = refreshSessionRepository.findByTokenHashAndRevokedFalse(oldTokenHash)
                .filter(session -> session.getExpiresAt().isAfter(LocalDateTime.now()));

        if (sessionOpt.isEmpty()) {
            throw new RuntimeException("Invalid or expired refresh token");
        }

        RefreshSession oldSession = sessionOpt.get();

        // Store user and tenant before revoking
        User user = oldSession.getUser();
        Tenant tenant = oldSession.getTenant();

        // Revoke old token
        oldSession.setRevoked(true);
        refreshSessionRepository.save(oldSession);

        // Generate new token
        String newRefreshToken = UUID.randomUUID().toString();
        String newTokenHash = hashToken(newRefreshToken);
        LocalDateTime newExpiresAt = LocalDateTime.now().plus(REFRESH_TOKEN_EXPIRY_DAYS, ChronoUnit.DAYS);

        RefreshSession newSession = RefreshSession.builder()
                .user(user)
                .tenant(tenant)
                .deviceId(deviceId)
                .tokenHash(newTokenHash)
                .expiresAt(newExpiresAt)
                .revoked(false)
                .build();

        newSession = refreshSessionRepository.save(newSession);

        return new RefreshTokenResult(newRefreshToken, newSession);
    }

    public static class RefreshTokenResult {
        private final String token;
        private final RefreshSession session;

        public RefreshTokenResult(String token, RefreshSession session) {
            this.token = token;
            this.session = session;
        }

        public String getToken() { return token; }
        public RefreshSession getSession() { return session; }
    }

    @Transactional
    public void revokeByUserId(UUID userId) {
        refreshSessionRepository.revokeAllByUserId(userId);
    }

    @Transactional
    public void revokeByTokenHash(String tokenHash) {
        // Hash the token first before searching
        String hashedToken = hashToken(tokenHash);
        refreshSessionRepository.revokeByTokenHash(hashedToken);
    }
}
