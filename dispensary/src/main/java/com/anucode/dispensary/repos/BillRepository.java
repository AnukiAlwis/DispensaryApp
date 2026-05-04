package com.anucode.dispensary.repos;

import com.anucode.dispensary.entities.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BillRepository extends JpaRepository<Bill, UUID> {

    List<Bill> findByTenantId(UUID tenantId);
    List<Bill> findByTenantIdAndPatientId(UUID tenantId, UUID patientId);
}
