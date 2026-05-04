package com.anucode.dispensary.repos;

import com.anucode.dispensary.entities.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, UUID> {
    List<Prescription> findByTenantIdAndStatus(UUID tenantId, Prescription.Status status);
    Optional<Prescription> findByVisitId(UUID visitId);
}