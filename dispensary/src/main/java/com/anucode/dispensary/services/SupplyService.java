package com.anucode.dispensary.services;

import com.anucode.dispensary.dtos.StockBatchRequestDto;
import com.anucode.dispensary.dtos.StockBatchResponseDto;
import com.anucode.dispensary.dtos.SupplyRequestDto;
import com.anucode.dispensary.dtos.SupplyResponseDto;

import java.util.List;
import java.util.UUID;

public interface SupplyService {

    UUID createSupply(UUID tenantId, UUID createdById, SupplyRequestDto requestDto);

    /**
     * Add multiple stock batches to an existing supply.
     * Returns list of created StockBatch IDs.
     */
    List<UUID> addStockBatches(UUID tenantId, UUID supplyId, List<StockBatchRequestDto> batches, UUID createdById);

    SupplyResponseDto getSupplyById(UUID tenantId, UUID supplyId);

    List<SupplyResponseDto> listSupplies(UUID tenantId, UUID distributorId);
}
