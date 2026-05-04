package com.anucode.dispensary.dtos;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class StockBatchResponseDto {

    private UUID id;
    private UUID medicineId;
    private String batchNo;
    private LocalDate expiryDate;
    private Integer qtyReceived;
    private BigDecimal unitCost;
    private LocalDateTime receivedAt;
    private UUID createdBy;
    private LocalDateTime createdAt;
}
