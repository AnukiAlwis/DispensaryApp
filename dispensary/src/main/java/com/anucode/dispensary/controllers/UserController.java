package com.anucode.dispensary.controllers;


import com.anucode.dispensary.config.TenantContext;
import com.anucode.dispensary.dtos.UserRequestDto;
import com.anucode.dispensary.dtos.UserResponseDto;
import com.anucode.dispensary.entities.User;
import com.anucode.dispensary.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;


    @PostMapping
    public ResponseEntity<UserResponseDto> createUser(@RequestBody @Valid UserRequestDto request) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        UserResponseDto createdUser = userService.createUser(tenantId, request);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdUser.getId())
                .toUri();

        return ResponseEntity
                .created(location)  // HTTP 201 + Location header
                .body(createdUser);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDto> getUser(@PathVariable UUID id) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        return ResponseEntity.ok(userService.getUserById(tenantId, id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDto> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UserRequestDto requestDto) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        return ResponseEntity.ok(userService.updateUser(tenantId, id, requestDto));
    }

    @GetMapping
    public ResponseEntity<List<UserResponseDto>> getAllUsers(
            @RequestParam(required = false) List<User.Role> roles) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        List<UserResponseDto> users = userService.getAllUsers(tenantId, roles);
        return ResponseEntity.ok(users);
    }
}

