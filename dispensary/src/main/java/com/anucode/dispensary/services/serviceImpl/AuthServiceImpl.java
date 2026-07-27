package com.anucode.dispensary.services.serviceImpl;

import com.anucode.dispensary.dtos.AuthResponse;
import com.anucode.dispensary.dtos.LoginRequest;
import com.anucode.dispensary.dtos.RefreshRequest;
import com.anucode.dispensary.dtos.UserDto;
import com.anucode.dispensary.entities.Tenant;
import com.anucode.dispensary.entities.User;
import com.anucode.dispensary.repos.UserRepository;
import com.anucode.dispensary.services.AuthService;
import com.anucode.dispensary.services.JwtTokenService;
import com.anucode.dispensary.services.RefreshSessionService;
import com.anucode.dispensary.services.TenantService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final TenantService tenantService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;
    private final RefreshSessionService refreshSessionService;

    @Override
    public AuthResponse login(LoginRequest request) {
        // Lookup tenant by code
        Optional<Tenant> tenantOpt = tenantService.findByCode(request.getTenantCode());
        if (tenantOpt.isEmpty()) {
            throw new RuntimeException("Invalid tenant code");
        }

        Tenant tenant = tenantOpt.get();

        // Find user by username and tenant
        Optional<User> userOpt = userRepository.findByUsernameAndTenant(request.getUsername(), tenant);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Invalid username or password");
        }

        User user = userOpt.get();

        // Check if user is active
        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new RuntimeException("User account is disabled");
        }

        // Validate password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid username or password");
        }

        // Generate tokens
        String accessToken = jwtTokenService.generateAccessToken(user, tenant.getId());
        String refreshToken = jwtTokenService.generateRefreshToken();

        // Create refresh session
        String deviceId = extractDeviceId();
        String tokenHash = refreshSessionService.hashToken(refreshToken);
        refreshSessionService.create(user, refreshToken, deviceId);

        // Build response
        UserDto userDto = UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(userDto)
                .build();
    }

    @Override
    public AuthResponse refresh(RefreshRequest request) {
        // Rotate refresh token and get result with token and session
        var result = refreshSessionService.validateAndRotate(request.getRefreshToken(), extractDeviceId());

        User user = result.getSession().getUser();
        Tenant tenant = result.getSession().getTenant();
        String newRefreshToken = result.getToken();

        // Generate new access token
        String accessToken = jwtTokenService.generateAccessToken(user, tenant.getId());

        // Build response
        UserDto userDto = UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(newRefreshToken)
                .user(userDto)
                .build();
    }

    @Override
    public void logout(String refreshToken) {
        // Revoke the refresh session
        // We need to hash the token first to find the session
        // This is a simplified version
        refreshSessionService.revokeByTokenHash(refreshToken);
    }

    private String extractDeviceId() {
        // In a real implementation, extract from User-Agent header or similar
        // For now, return a simple identifier
        return "web-client";
    }
}
