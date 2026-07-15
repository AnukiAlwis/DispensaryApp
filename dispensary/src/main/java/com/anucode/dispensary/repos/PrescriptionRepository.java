package com.anucode.dispensary.repos;

import com.anucode.dispensary.entities.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, UUID> {
    List<Prescription> findByTenantIdAndStatus(UUID tenantId, Prescription.Status status);
    Optional<Prescription> findByVisitId(UUID visitId);

    // Find the oldest ISSUED prescription for today (current serving)
    Optional<Prescription> findFirstByTenantIdAndStatusAndUpdatedAtBetweenOrderByUpdatedAtAsc(
            UUID tenantId, Prescription.Status status, LocalDateTime startOfDay, LocalDateTime endOfDay);

    // Find all remaining ISSUED prescriptions for today, excluding the current-serving one (up next)
    List<Prescription> findByTenantIdAndStatusAndUpdatedAtBetweenAndIdNotOrderByUpdatedAtAsc(
            UUID tenantId, Prescription.Status status, LocalDateTime startOfDay, LocalDateTime endOfDay, UUID excludeId);
}