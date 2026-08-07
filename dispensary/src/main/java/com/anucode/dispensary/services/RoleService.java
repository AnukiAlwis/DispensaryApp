package com.anucode.dispensary.services;

import com.anucode.dispensary.entities.Permission;
import com.anucode.dispensary.entities.Role;
import com.anucode.dispensary.entities.Tenant;
import com.anucode.dispensary.repos.RoleRepository;
import com.anucode.dispensary.repos.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private final TenantRepository tenantRepository;

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    public List<Role> getSystemRoles() {
        return roleRepository.findByTenantIsNull();
    }

    public List<Role> getTenantRoles(UUID tenantId) {
        return roleRepository.findByTenantId(tenantId);
    }

    public Optional<Role> getRoleById(UUID roleId) {
        return roleRepository.findById(roleId);
    }

    @Transactional
    public Role createCustomRole(UUID tenantId, String name, Set<Permission> permissions) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        Role role = Role.builder()
                .name(name)
                .tenant(tenant)
                .isSystem(false)
                .permissions(permissions)
                .build();
        return roleRepository.save(role);
    }

    @Transactional
    public Role updateCustomRole(UUID roleId, String name, Set<Permission> permissions) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        if (role.getIsSystem()) {
            throw new RuntimeException("Cannot modify system roles");
        }

        role.setName(name);
        role.setPermissions(permissions);
        return roleRepository.save(role);
    }

    @Transactional
    public void deleteRole(UUID roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        if (role.getIsSystem()) {
            throw new RuntimeException("Cannot delete system roles");
        }

        roleRepository.delete(role);
    }

    @Transactional
    public void attachPermissions(UUID roleId, Set<Permission> permissions) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        if (role.getIsSystem()) {
            throw new RuntimeException("Cannot modify system roles");
        }

        role.getPermissions().addAll(permissions);
        roleRepository.save(role);
    }

    @Transactional
    public void detachPermissions(UUID roleId, Set<Permission> permissions) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        if (role.getIsSystem()) {
            throw new RuntimeException("Cannot modify system roles");
        }

        role.getPermissions().removeAll(permissions);
        roleRepository.save(role);
    }
}
