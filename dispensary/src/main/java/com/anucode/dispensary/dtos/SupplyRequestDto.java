package com.anucode.dispensary.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class SupplyRequestDto {

    @NotNull
    private UUID distributorId;

    private String invoiceNo;

    @NotNull
    private BigDecimal totalPayable;

    private Boolean isPaidFull;
    private LocalDateTime paymentDateTime;
    private String note;
}
