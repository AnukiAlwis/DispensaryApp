package com.anucode.dispensary.repos;

import com.anucode.dispensary.entities.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    // Find prescriptions that have been dispensed but not yet paid (billing pending)
    @Query("""
            SELECT p FROM Prescription p
            JOIN Bill b ON b.prescription.id = p.id
            WHERE p.tenant.id = :tenantId
              AND p.status = 'DISPENSED'
              AND b.status = 'DUE'
            ORDER BY p.updatedAt ASC
            """)
    List<Prescription> findBillingPendingByTenantId(@Param("tenantId") UUID tenantId);
}