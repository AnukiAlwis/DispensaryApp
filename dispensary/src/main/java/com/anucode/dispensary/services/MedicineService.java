package com.anucode.dispensary.services;

import com.anucode.dispensary.dtos.MedicineRequestDto;
import com.anucode.dispensary.dtos.MedicineResponseDto;

import java.util.List;
import java.util.UUID;

public interface MedicineService {

    UUID addMedicine(UUID tenantId, MedicineRequestDto requestDto, UUID createdById);

    List<MedicineResponseDto> listMedicines(UUID tenantId);
}
