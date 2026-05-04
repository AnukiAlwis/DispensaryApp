package com.anucode.dispensary.dtos;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class SupplyResponseDto {

    private UUID id;
    private UUID distributorId;
    private String invoiceNo;
    private BigDecimal totalPayable;
    private Boolean isPaidFull;
    private LocalDateTime paymentDateTime;
    private String note;
    private UUID createdBy;
    private LocalDateTime createdAt;

    // nested stock batches
    private List<StockBatchResponseDto> stockBatches;
}
