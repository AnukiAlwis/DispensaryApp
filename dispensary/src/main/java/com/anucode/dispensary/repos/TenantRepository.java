package com.anucode.dispensary.repos;

import com.anucode.dispensary.entities.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, UUID> {

    boolean existsByCode(String code);

    boolean existsByName(String name);
}