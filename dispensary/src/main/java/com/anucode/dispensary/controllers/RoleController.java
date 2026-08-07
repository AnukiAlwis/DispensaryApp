package com.anucode.dispensary.controllers;

import com.anucode.dispensary.config.TenantContext;
import com.anucode.dispensary.dtos.PermissionDto;
import com.anucode.dispensary.dtos.RoleDto;
import com.anucode.dispensary.entities.Permission;
import com.anucode.dispensary.entities.Role;
import com.anucode.dispensary.security.Permissions;
import com.anucode.dispensary.services.PermissionService;
import com.anucode.dispensary.services.RoleService;
import com.anucode.dispensary.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;
    private final PermissionService permissionService;
    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAuthority('" + Permissions.ROLE_MANAGE + "')")
    public ResponseEntity<List<RoleDto>> listRoles() {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        List<Role> systemRoles = roleService.getSystemRoles();
        List<Role> tenantRoles = roleService.getTenantRoles(tenantId);
        
        List<RoleDto> allRoles = systemRoles.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        allRoles.addAll(tenantRoles.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList()));
        
        return ResponseEntity.ok(allRoles);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('" + Permissions.ROLE_MANAGE + "')")
    public ResponseEntity<RoleDto> createCustomRole(@RequestBody CreateRoleRequest request) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        
        Set<Permission> permissions = request.getPermissionCodes().stream()
                .map(code -> permissionService.getPermissionByCode(code)
                        .orElseThrow(() -> new RuntimeException("Permission not found: " + code)))
                .collect(Collectors.toSet());
        
        Role role = roleService.createCustomRole(tenantId, request.getName(), permissions);
        return ResponseEntity.ok(convertToDto(role));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('" + Permissions.ROLE_MANAGE + "')")
    public ResponseEntity<RoleDto> updateCustomRole(@PathVariable UUID id, @RequestBody CreateRoleRequest request) {
        Set<Permission> permissions = request.getPermissionCodes().stream()
                .map(code -> permissionService.getPermissionByCode(code)
                        .orElseThrow(() -> new RuntimeException("Permission not found: " + code)))
                .collect(Collectors.toSet());
        
        Role role = roleService.updateCustomRole(id, request.getName(), permissions);
        return ResponseEntity.ok(convertToDto(role));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('" + Permissions.ROLE_MANAGE + "')")
    public ResponseEntity<Void> deleteRole(@PathVariable UUID id) {
        roleService.deleteRole(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/permissions")
    @PreAuthorize("hasAuthority('" + Permissions.ROLE_MANAGE + "')")
    public ResponseEntity<RoleDto> attachPermissions(@PathVariable UUID id, @RequestBody PermissionRequest request) {
        Set<Permission> permissions = request.getPermissionCodes().stream()
                .map(code -> permissionService.getPermissionByCode(code)
                        .orElseThrow(() -> new RuntimeException("Permission not found: " + code)))
                .collect(Collectors.toSet());
        
        roleService.attachPermissions(id, permissions);
        Role role = roleService.getRoleById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));
        return ResponseEntity.ok(convertToDto(role));
    }

    @DeleteMapping("/{id}/permissions")
    @PreAuthorize("hasAuthority('" + Permissions.ROLE_MANAGE + "')")
    public ResponseEntity<RoleDto> detachPermissions(@PathVariable UUID id, @RequestBody PermissionRequest request) {
        Set<Permission> permissions = request.getPermissionCodes().stream()
                .map(code -> permissionService.getPermissionByCode(code)
                        .orElseThrow(() -> new RuntimeException("Permission not found: " + code)))
                .collect(Collectors.toSet());
        
        roleService.detachPermissions(id, permissions);
        Role role = roleService.getRoleById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));
        return ResponseEntity.ok(convertToDto(role));
    }

    @GetMapping("/permissions")
    @PreAuthorize("hasAuthority('" + Permissions.ROLE_MANAGE + "')")
    public ResponseEntity<List<PermissionDto>> listPermissions() {
        List<Permission> permissions = permissionService.getAllPermissions();
        List<PermissionDto> permissionDtos = permissions.stream()
                .map(this::convertToPermissionDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(permissionDtos);
    }

    @PostMapping("/users/{userId}/roles/{roleId}")
    @PreAuthorize("hasAuthority('" + Permissions.ROLE_MANAGE + "')")
    public ResponseEntity<Void> assignRoleToUser(@PathVariable UUID userId, @PathVariable UUID roleId) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        userService.assignRole(tenantId, userId, roleId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/users/{userId}/roles/{roleId}")
    @PreAuthorize("hasAuthority('" + Permissions.ROLE_MANAGE + "')")
    public ResponseEntity<Void> unassignRoleFromUser(@PathVariable UUID userId, @PathVariable UUID roleId) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        userService.unassignRole(tenantId, userId, roleId);
        return ResponseEntity.noContent().build();
    }

    private RoleDto convertToDto(Role role) {
        List<PermissionDto> permissionDtos = role.getPermissions().stream()
                .map(this::convertToPermissionDto)
                .collect(Collectors.toList());
        
        return RoleDto.builder()
                .id(role.getId())
                .name(role.getName())
                .isSystem(role.getIsSystem())
                .permissions(permissionDtos)
                .build();
    }

    private PermissionDto convertToPermissionDto(Permission permission) {
        return PermissionDto.builder()
                .id(permission.getId())
                .code(permission.getCode())
                .description(permission.getDescription())
                .build();
    }

    public static class CreateRoleRequest {
        private String name;
        private List<String> permissionCodes;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public List<String> getPermissionCodes() {
            return permissionCodes;
        }

        public void setPermissionCodes(List<String> permissionCodes) {
            this.permissionCodes = permissionCodes;
        }
    }

    public static class PermissionRequest {
        private List<String> permissionCodes;

        public List<String> getPermissionCodes() {
            return permissionCodes;
        }

        public void setPermissionCodes(List<String> permissionCodes) {
            this.permissionCodes = permissionCodes;
        }
    }
}
