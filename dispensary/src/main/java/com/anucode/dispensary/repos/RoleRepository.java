package com.anucode.dispensary.repos;

import com.anucode.dispensary.entities.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface RoleRepository extends JpaRepository<Role, UUID> {
    Optional<Role> findByNameAndTenantId(String name, UUID tenantId);
    
    Optional<Role> findByNameAndTenantIsNull(String name);
    
    List<Role> findByTenantId(UUID tenantId);
    
    List<Role> findByTenantIsNull();
    
    @Query("SELECT DISTINCT r.permissions FROM Role r JOIN r.users u WHERE u.id = :userId")
    Set<com.anucode.dispensary.entities.Permission> findPermissionsByUserId(@Param("userId") UUID userId);
}
