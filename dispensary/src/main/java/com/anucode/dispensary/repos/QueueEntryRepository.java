package com.anucode.dispensary.repos;

import com.anucode.dispensary.entities.QueueEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface QueueEntryRepository extends JpaRepository<QueueEntry, UUID> {

    List<QueueEntry> findByDoctorIdAndQueueDateOrderByQueueNumber(UUID doctorId, LocalDate queueDate);

    boolean existsByPatientIdAndDoctorIdAndQueueDateAndStatusIn(
            UUID patientId, UUID doctorId, LocalDate queueDate, List<QueueEntry.Status> statuses);

    @Query("SELECT q FROM QueueEntry q JOIN q.patient p WHERE q.tenant.id = :tenantId AND q.status = 'BOOKED' AND q.queueDate = :queueDate AND " +
           "(LOWER(p.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(CONCAT(p.firstName, ' ', p.lastName)) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "p.contact LIKE CONCAT('%', :searchTerm, '%'))")
    List<QueueEntry> searchByPatientNameOrPhone(UUID tenantId, LocalDate queueDate, String searchTerm);

    long countByTenantIdAndDoctorIdAndQueueDateAndStatus(UUID tenantId, UUID doctorId, LocalDate queueDate, QueueEntry.Status status);
}
