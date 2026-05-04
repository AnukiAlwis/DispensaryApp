package com.anucode.dispensary.services;

import com.anucode.dispensary.dtos.PrescriptionItemRequestDto;
import com.anucode.dispensary.dtos.PrescriptionItemResponseDto;
import com.anucode.dispensary.dtos.PrescriptionRequestDto;
import com.anucode.dispensary.dtos.PrescriptionResponseDto;

import java.util.List;
import java.util.UUID;

public interface PrescriptionService {

    UUID createPrescription(UUID tenantId, UUID doctorId, PrescriptionRequestDto requestDto);

    PrescriptionResponseDto getPrescription(UUID tenantId, UUID prescriptionId);

    UUID addPrescriptionItem(UUID tenantId, UUID prescriptionId, PrescriptionItemRequestDto requestDto, UUID recordedById);

    List<PrescriptionItemResponseDto> getPrescriptionItems(UUID tenantId, UUID prescriptionId);

    PrescriptionResponseDto updatePrescriptionStatus(UUID tenantId, UUID prescriptionId, String newStatus);
}
