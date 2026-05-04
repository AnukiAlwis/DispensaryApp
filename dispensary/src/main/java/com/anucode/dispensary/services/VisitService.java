package com.anucode.dispensary.services;

import com.anucode.dispensary.dtos.VisitNoteResponseDto;
import com.anucode.dispensary.dtos.VisitRequestDto;
import com.anucode.dispensary.dtos.VisitResponseDto;

import java.util.List;
import java.util.UUID;

public interface VisitService {

    String createVisit(UUID tenantId, UUID currentUserId, VisitRequestDto requestDto);

    VisitResponseDto getVisitById(UUID tenantId, UUID visitId);

    VisitResponseDto updateVisitStatus(UUID tenantId, UUID currentUserId, UUID visitId, String status);

    List<VisitResponseDto> listVisits(UUID tenantId, UUID patientId);

    UUID addVisitNote(UUID tenantId, UUID visitId, String note, UUID recordedById);

    List<VisitNoteResponseDto> getVisitNotes(UUID tenantId, UUID visitId);
}
