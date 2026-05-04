package com.anucode.dispensary.dtos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class StockBatchRequestDto {

    @NotNull
    private UUID medicineId;      // mandatory, server will validate existence

    private String batchNo;

    private LocalDate expiryDate;

    @NotNull
    @Min(1)
    private Integer qtyReceived;

    private BigDecimal unitCost;
}
