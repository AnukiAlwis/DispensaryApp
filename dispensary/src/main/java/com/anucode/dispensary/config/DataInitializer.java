package com.anucode.dispensary.config;

import com.anucode.dispensary.entities.Tenant;
import com.anucode.dispensary.entities.User;
import com.anucode.dispensary.repos.TenantRepository;
import com.anucode.dispensary.repos.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("Initializing test data...");
        
        // Create or get HMA001 tenant
        Tenant tenant = createOrGetTenant("HMA001", "Himalaya Medical Associates");
        
        // Create test users for each role
        createUser(tenant, "doctor", "Dr. John Doe", User.Role.DOCTOR, "password123");
        createUser(tenant, "nurse", "Jane Smith", User.Role.NURSE, "password123");
        createUser(tenant, "pharmacist", "Bob Johnson", User.Role.PHARMACIST, "password123");
        createUser(tenant, "admin", "Admin User", User.Role.ADMIN, "password123");
        createUser(tenant, "receptionist", "Alice Brown", User.Role.RECEPTIONIST, "password123");
        
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

    private void createUser(Tenant tenant, String username, String fullName, User.Role role, String password) {
        Optional<User> existingUser = userRepository.findByUsernameAndTenant(username, tenant);
        if (existingUser.isPresent()) {
            log.info("User {} already exists in tenant {}", username, tenant.getCode());
            return;
        }

        String passwordHash = passwordEncoder.encode(password);
        User user = User.builder()
                .tenant(tenant)
                .username(username)
                .fullName(fullName)
                .role(role)
                .passwordHash(passwordHash)
                .isActive(true)
                .mustResetPassword(false)
                .build();
        userRepository.save(user);
        log.info("Created user: {} with role: {}", username, role);
    }
}
