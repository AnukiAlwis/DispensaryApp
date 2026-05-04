package com.anucode.dispensary.services;

import com.anucode.dispensary.dtos.DistributorRequestDto;
import com.anucode.dispensary.dtos.DistributorResponseDto;

import java.util.List;
import java.util.UUID;

public interface DistributorService {

    UUID createDistributor(UUID tenantId, DistributorRequestDto requestDto);

    List<DistributorResponseDto> listDistributors(UUID tenantId);
}
