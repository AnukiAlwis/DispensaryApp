package com.anucode.dispensary.services;

import com.anucode.dispensary.dtos.*;

import java.util.List;
import java.util.UUID;

public interface PrescriptionService {

    UUID createPrescription(UUID tenantId, UUID doctorId, PrescriptionRequestDto requestDto);

    PrescriptionResponseDto getPrescription(UUID tenantId, UUID prescriptionId);

    UUID addPrescriptionItem(UUID tenantId, UUID prescriptionId, PrescriptionItemRequestDto requestDto, UUID recordedById);

    List<PrescriptionItemResponseDto> getPrescriptionItems(UUID tenantId, UUID prescriptionId);

    PrescriptionResponseDto updatePrescriptionStatus(UUID tenantId, UUID prescriptionId, String newStatus);

    PrescriptionResponseDto getPrescriptionByVisitId(UUID tenantId, UUID visitId);

    // New dispensing workflow methods
    CurrentServingPrescriptionDto getCurrentServing(UUID tenantId);

    List<CurrentServingPrescriptionDto> getUpNext(UUID tenantId);

    List<PrescriptionMedicineDto> getPrescriptionMedicines(UUID tenantId, UUID prescriptionId);
}
