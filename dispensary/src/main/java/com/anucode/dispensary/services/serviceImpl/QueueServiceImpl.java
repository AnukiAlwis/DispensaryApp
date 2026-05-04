package com.anucode.dispensary.services.serviceImpl;

import com.anucode.dispensary.dtos.QueueCreateDto;
import com.anucode.dispensary.dtos.QueueResponseDto;
import com.anucode.dispensary.entities.*;
import com.anucode.dispensary.repos.*;
import com.anucode.dispensary.services.QueueService;
import com.anucode.dispensary.exception.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class QueueServiceImpl implements QueueService {

    private final QueueEntryRepository queueRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;

    // Allowed status transitions
    private static final Map<QueueEntry.Status, List<QueueEntry.Status>> ALLOWED_TRANSITIONS = Map.of(
            QueueEntry.Status.BOOKED, List.of(QueueEntry.Status.CHECKED_IN_WAITING, QueueEntry.Status.REMOVED, QueueEntry.Status.NO_SHOW),
            QueueEntry.Status.CHECKED_IN_WAITING, List.of(QueueEntry.Status.IN_PROGRESS, QueueEntry.Status.REMOVED),
            QueueEntry.Status.IN_PROGRESS, List.of(QueueEntry.Status.SERVED),
            QueueEntry.Status.SERVED, List.of(), // cannot change
            QueueEntry.Status.NO_SHOW, List.of(),
            QueueEntry.Status.REMOVED, List.of()
    );

    @Override
    public QueueResponseDto createQueueEntry(UUID tenantId, UUID currentUserId, QueueCreateDto dto) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new TenantMismatchException("Tenant not found"));

        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new NotFoundException("Patient not found"));

        User doctor = userRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new NotFoundException("Doctor not found"));

        // Validate duplicate for same day
        if (queueRepository.existsByPatientIdAndDoctorIdAndQueueDateAndStatusIn(
                patient.getId(),
                doctor.getId(),
                LocalDate.now(),
                List.of(QueueEntry.Status.BOOKED, QueueEntry.Status.CHECKED_IN_WAITING, QueueEntry.Status.IN_PROGRESS)
        )) {
            throw new DuplicateQueueEntryException("Patient already in queue for this doctor today");
        }

        // Calculate queue number
        Integer maxQueueNumber = queueRepository.findByDoctorIdAndQueueDateOrderByQueueNumber(doctor.getId(), LocalDate.now())
                .stream()
                .map(QueueEntry::getQueueNumber)
                .max(Integer::compareTo)
                .orElse(0);

        QueueEntry entry = QueueEntry.builder()
                .tenant(tenant)
                .patient(patient)
                .doctor(doctor)
                .status(QueueEntry.Status.BOOKED)
                .queueDate(LocalDate.now())
                .queueNumber(maxQueueNumber + 1)
                .build();

        queueRepository.save(entry);
        return mapToDto(entry);
    }

    private QueueResponseDto mapToDto(QueueEntry entry) {
        QueueResponseDto dto = new QueueResponseDto();
        dto.setId(entry.getId());
        dto.setPatientId(entry.getPatient().getId());
        dto.setDoctorId(entry.getDoctor().getId());
        dto.setPatientName(entry.getPatient().getFirstName() + " " + entry.getPatient().getLastName());
        dto.setDoctorName(entry.getDoctor().getFullName());
        dto.setStatus(entry.getStatus().name());
        dto.setQueueNumber(entry.getQueueNumber());
        dto.setQueueDate(entry.getQueueDate());
        dto.setCreatedAt(entry.getCreatedAt());
        dto.setCheckedInAt(entry.getCheckedInAt());
        dto.setInProgressAt(entry.getInProgressAt());
        dto.setServedAt(entry.getServedAt());
        return dto;
    }

    private QueueEntry updateStatus(UUID tenantId, UUID queueId, QueueEntry.Status to, java.util.function.Consumer<QueueEntry> extraUpdater) {
        QueueEntry entry = queueRepository.findById(queueId)
                .orElseThrow(() -> new QueueEntryNotFoundException("Queue entry not found"));

        if (!entry.getTenant().getId().equals(tenantId))
            throw new TenantMismatchException("Tenant mismatch");

        List<QueueEntry.Status> allowed = ALLOWED_TRANSITIONS.get(entry.getStatus());
        if (!allowed.contains(to)) {
            throw new InvalidStatusTransitionException(
                    "Invalid status transition: Cannot change status from " + entry.getStatus() + " to " + to);
        }

        entry.setStatus(to);
        if (extraUpdater != null) extraUpdater.accept(entry);
        return entry;
    }

    @Override
    public QueueResponseDto checkIn(UUID tenantId, UUID currentUserId, UUID queueId) {
        QueueEntry entry = updateStatus(tenantId, queueId, QueueEntry.Status.CHECKED_IN_WAITING,
                e -> e.setCheckedInAt(LocalDateTime.now()));
        return mapToDto(entry);
    }

    @Override
    public QueueResponseDto startConsultation(UUID tenantId, UUID currentUserId, UUID queueId) {
        QueueEntry entry = updateStatus(tenantId, queueId, QueueEntry.Status.IN_PROGRESS,
                e -> e.setInProgressAt(LocalDateTime.now()));
        return mapToDto(entry);
    }

    @Override
    public QueueResponseDto serve(UUID tenantId, UUID currentUserId, UUID queueId) {
        QueueEntry entry = updateStatus(tenantId, queueId, QueueEntry.Status.SERVED,
                e -> e.setServedAt(LocalDateTime.now()));
        return mapToDto(entry);
    }

    @Override
    public QueueResponseDto markNoShow(UUID tenantId, UUID currentUserId, UUID queueId) {
        QueueEntry entry = updateStatus(tenantId, queueId, QueueEntry.Status.NO_SHOW, null);
        return mapToDto(entry);
    }

    @Override
    public QueueResponseDto remove(UUID tenantId, UUID currentUserId, UUID queueId) {
        QueueEntry entry = updateStatus(tenantId, queueId, QueueEntry.Status.REMOVED, null);
        return mapToDto(entry);
    }

    @Override
    public List<QueueResponseDto> getDoctorQueue(UUID tenantId, UUID doctorId) {
        return queueRepository.findByDoctorIdAndQueueDateOrderByQueueNumber(doctorId, LocalDate.now())
                .stream()
                .filter(e -> e.getTenant().getId().equals(tenantId))
                .filter(e -> e.getStatus() == QueueEntry.Status.BOOKED
                        || e.getStatus() == QueueEntry.Status.CHECKED_IN_WAITING
                        || e.getStatus() == QueueEntry.Status.IN_PROGRESS)
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
}
