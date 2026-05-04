package com.anucode.dispensary.services;

import com.anucode.dispensary.dtos.DispenseRequestDto;
import com.anucode.dispensary.dtos.DispenseResponseDto;

import java.util.UUID;

public interface DispenseService {

    UUID recordDispense(UUID tenantId, UUID currentUserId, DispenseRequestDto requestDto);

    DispenseResponseDto getDispenseById(UUID tenantId, UUID dispenseId);
}
