package com.anucode.dispensary.config;

import com.anucode.dispensary.entities.*;
import com.anucode.dispensary.repos.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Initializing test data...");
        
        // Seed permissions
        seedPermissions();
        
        // Seed system roles
        seedSystemRoles();
        
        // Migrate existing users from old role column to new user_role table
        migrateExistingUsers();
        
        // Create or get HMA001 tenant
        Tenant tenant = createOrGetTenant("HMA001", "Himalaya Medical Associates");
        
        // Create test users for each role
        createUser(tenant, "doctor", "Dr. John Doe", "DOCTOR", "password123");
        createUser(tenant, "nurse", "Jane Smith", "NURSE", "password123");
        createUser(tenant, "pharmacist", "Bob Johnson", "PHARMACIST", "password123");
        createUser(tenant, "admin", "Admin User", "ADMIN", "password123");
        createUser(tenant, "receptionist", "Alice Brown", "RECEPTIONIST", "password123");
        
        log.info("Test data initialization complete");
    }

    private Tenant createOrGetTenant(String code, String name) {
        Optional<Tenant> existingTenant = tenantRepository.findByCode(code);
        if (existingTenant.isPresent()) {
            log.info("Tenant {} already exists", code);
            return existingTenant.get();
        }
        
        Tenant tenant = Tenant.builder()
                .code(code)
                .name(name)
                .build();
        tenant = tenantRepository.save(tenant);
        log.info("Created tenant: {} - {}", code, name);
        return tenant;
    }

    private void createUser(Tenant tenant, String username, String fullName, String roleName, String password) {
        Optional<User> existingUser = userRepository.findByUsernameAndTenant(username, tenant);
        if (existingUser.isPresent()) {
            log.info("User {} already exists in tenant {}", username, tenant.getCode());
            return;
        }

        // Get the system role
        Optional<Role> roleOpt = roleRepository.findByNameAndTenantIsNull(roleName);
        if (roleOpt.isEmpty()) {
            log.error("System role {} not found", roleName);
            return;
        }

        String passwordHash = passwordEncoder.encode(password);
        User.UserBuilder userBuilder = User.builder()
                .tenant(tenant)
                .username(username)
                .fullName(fullName)
                .passwordHash(passwordHash)
                .isActive(true)
                .mustResetPassword(false)
                .roles(Set.of(roleOpt.get()));
        
        // Set doctorCharge only for doctor user
        if ("doctor".equals(username)) {
            userBuilder.doctorCharge(new BigDecimal("1500.00"));
        }
        
        User user = userBuilder.build();
        userRepository.save(user);
        log.info("Created user: {} with role: {}", username, roleName);
    }

    private void seedPermissions() {
        // Patients feature permissions
        createPermissionIfNotExists("PATIENT_VIEW", "View patient information");
        createPermissionIfNotExists("PATIENT_EDIT", "Edit patient information");
        createPermissionIfNotExists("PATIENT_DELETE", "Delete patient information");

        // Consults feature permissions
        createPermissionIfNotExists("CONSULT_VIEW", "View consultation information");
        createPermissionIfNotExists("CONSULT_CREATE", "Create new consultation");
        createPermissionIfNotExists("CONSULT_EDIT", "Edit consultation information");

        // Dispensing feature permissions
        createPermissionIfNotExists("PRESCRIPTION_DISPENSE", "Dispense prescriptions");
        createPermissionIfNotExists("PRESCRIPTION_VIEW", "View prescription information");

        // Pharmacy feature permissions
        createPermissionIfNotExists("PHARMACY_MANAGE", "Manage pharmacy inventory and supplies");
        createPermissionIfNotExists("PHARMACY_VIEW", "View pharmacy information");

        // Queues feature permissions
        createPermissionIfNotExists("QUEUE_MANAGE", "Manage patient queues");
        createPermissionIfNotExists("QUEUE_VIEW", "View queue information");

        // Visits feature permissions
        createPermissionIfNotExists("VISIT_VIEW", "View visit information");
        createPermissionIfNotExists("VISIT_EDIT", "Edit visit information");

        // Users feature permissions
        createPermissionIfNotExists("USER_MANAGE", "Manage users");
        createPermissionIfNotExists("USER_VIEW", "View user information");

        // Role management permission
        createPermissionIfNotExists("ROLE_MANAGE", "Manage roles and permissions");

        // Billing feature permissions
        createPermissionIfNotExists("BILL_VIEW", "View billing information");
        createPermissionIfNotExists("BILL_MANAGE", "Manage billing information");

        // Discounts feature permissions
        createPermissionIfNotExists("DISCOUNTS_ADD", "Add discounts to bills");

        log.info("Permissions seeded successfully");
    }

    private void seedSystemRoles() {
        // Create system roles with their default permissions (Source of Truth from authorizationStory.md)
        Role adminRole = createSystemRoleIfNotExists("ADMIN", Set.of(
            "PATIENT_VIEW",
            "USER_VIEW", "USER_MANAGE",
            "ROLE_MANAGE"
        ));

        Role doctorRole = createSystemRoleIfNotExists("DOCTOR", Set.of(
            "PATIENT_VIEW", "PATIENT_EDIT", "PATIENT_DELETE",
            "VISIT_VIEW", "VISIT_EDIT",
            "CONSULT_VIEW", "CONSULT_CREATE", "CONSULT_EDIT",
            "DISCOUNTS_ADD",
            "QUEUE_VIEW", "QUEUE_MANAGE",
            "PRESCRIPTION_VIEW",
            "PHARMACY_VIEW",
            "USER_VIEW"
        ));

        Role nurseRole = createSystemRoleIfNotExists("NURSE", Set.of(
            "PATIENT_VIEW", "PATIENT_EDIT", "PATIENT_DELETE",
            "VISIT_VIEW", "VISIT_EDIT",
            "QUEUE_MANAGE",
            "USER_VIEW"
        ));

        Role pharmacistRole = createSystemRoleIfNotExists("PHARMACIST", Set.of(
            "PRESCRIPTION_VIEW", "PRESCRIPTION_DISPENSE",
            "PHARMACY_MANAGE", "PHARMACY_VIEW",
            "PATIENT_VIEW",
            "VISIT_VIEW", "VISIT_EDIT",
            "USER_VIEW"
        ));

        Role receptionistRole = createSystemRoleIfNotExists("RECEPTIONIST", Set.of(
            "PATIENT_VIEW", "PATIENT_EDIT", "PATIENT_DELETE",
            "VISIT_VIEW", "VISIT_EDIT",
            "QUEUE_VIEW", "QUEUE_MANAGE",
            "USER_VIEW"
        ));

        log.info("System roles seeded successfully");
    }

    private void createPermissionIfNotExists(String code, String description) {
        if (permissionRepository.findByCode(code).isEmpty()) {
            Permission permission = Permission.builder()
                    .code(code)
                    .description(description)
                    .build();
            permissionRepository.save(permission);
            log.info("Created permission: {}", code);
        }
    }

    private Role createSystemRoleIfNotExists(String name, Set<String> permissionCodes) {
        Optional<Role> existingRole = roleRepository.findByNameAndTenantIsNull(name);
        if (existingRole.isPresent()) {
            return existingRole.get();
        }

        Set<Permission> permissions = Set.copyOf(permissionRepository.findAll().stream()
                .filter(p -> permissionCodes.contains(p.getCode()))
                .toList());

        Role role = Role.builder()
                .name(name)
                .isSystem(true)
                .tenant(null)
                .permissions(permissions)
                .build();
        role = roleRepository.save(role);
        log.info("Created system role: {} with {} permissions", name, permissions.size());
        return role;
    }

    private void migrateExistingUsers() {
        // This migration is for users created before the role-permission system
        // Since we removed the old role column, new users will be created with the new system
        // This is a no-op for fresh databases
        log.info("User migration check complete");
    }
}
