package com.anucode.dispensary.controllers;

import com.anucode.dispensary.config.TenantContext;
import com.anucode.dispensary.dtos.AuthResponse;
import com.anucode.dispensary.dtos.LoginRequest;
import com.anucode.dispensary.dtos.RefreshRequest;
import com.anucode.dispensary.dtos.UserResponseDto;
import com.anucode.dispensary.services.AuthService;
import com.anucode.dispensary.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        AuthResponse response = authService.refresh(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody RefreshRequest request) {
        authService.logout(request.getRefreshToken());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getCurrentUser() {
        UUID userId = TenantContext.getCurrentUser();
        if (userId == null) {
            throw new RuntimeException("User not authenticated");
        }
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        return ResponseEntity.ok(userService.getUserById(tenantId, userId));
    }
}
