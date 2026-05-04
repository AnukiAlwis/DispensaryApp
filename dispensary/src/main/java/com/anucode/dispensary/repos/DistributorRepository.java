package com.anucode.dispensary.repos;

import com.anucode.dispensary.entities.Distributor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DistributorRepository extends JpaRepository<Distributor, UUID>{

    List<Distributor> findByTenantId(UUID tenantId);

    Optional<Distributor> findByTenantIdAndNameIgnoreCase(UUID tenantId, String name);

}

