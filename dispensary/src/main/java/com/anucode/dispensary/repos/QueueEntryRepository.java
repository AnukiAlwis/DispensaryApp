package com.anucode.dispensary.repos;

import com.anucode.dispensary.entities.QueueEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface QueueEntryRepository extends JpaRepository<QueueEntry, UUID> {

    List<QueueEntry> findByDoctorIdAndQueueDateOrderByQueueNumber(UUID doctorId, LocalDate queueDate);

    boolean existsByPatientIdAndDoctorIdAndQueueDateAndStatusIn(
            UUID patientId, UUID doctorId, LocalDate queueDate, List<QueueEntry.Status> statuses);
}
