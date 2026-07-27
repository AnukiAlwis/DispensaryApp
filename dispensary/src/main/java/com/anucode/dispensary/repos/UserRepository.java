package com.anucode.dispensary.repos;


import com.anucode.dispensary.entities.Tenant;
import com.anucode.dispensary.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByUsernameAndTenant(String username, Tenant tenant);

    boolean existsByTenantIdAndUsername(UUID tenantId, String username);

    List<User> findAllByTenantId(UUID tenantId);
    List<User> findAllByTenantIdAndRoleIn(UUID tenantId, List<User.Role> roles);
}

