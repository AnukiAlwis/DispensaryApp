package com.anucode.dispensary.repos;

import com.anucode.dispensary.entities.Visit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VisitRepository extends JpaRepository<Visit, UUID> {

    List<Visit> findByTenantId(UUID tenantId);

    List<Visit> findByTenantIdAndPatientId(UUID tenantId, UUID patientId);
}

