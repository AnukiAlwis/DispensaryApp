package com.anucode.dispensary.repos;

import com.anucode.dispensary.entities.Supply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SupplyRepository extends JpaRepository<Supply, UUID> {

    List<Supply> findByTenantId(UUID tenantId);

    List<Supply> findByTenantIdAndDistributorId(UUID tenantId, UUID distributorId);
}
