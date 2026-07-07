package com.anucode.dispensary.services;

import com.anucode.dispensary.dtos.QueueCreateDto;
import com.anucode.dispensary.dtos.QueueResponseDto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface QueueService {

    QueueResponseDto createQueueEntry(UUID tenantId, UUID currentUserId, QueueCreateDto dto);

    QueueResponseDto checkIn(UUID tenantId, UUID currentUserId, UUID queueId);

    QueueResponseDto startConsultation(UUID tenantId, UUID currentUserId, UUID queueId);

    QueueResponseDto serve(UUID tenantId, UUID currentUserId, UUID queueId);

    QueueResponseDto markNoShow(UUID tenantId, UUID currentUserId, UUID queueId);

    QueueResponseDto remove(UUID tenantId, UUID currentUserId, UUID queueId);

    List<QueueResponseDto> getDoctorQueue(UUID tenantId, UUID doctorId);

    List<QueueResponseDto> searchQueueByPatientNameOrPhone(UUID tenantId, LocalDate queueDate, String searchTerm);
}
