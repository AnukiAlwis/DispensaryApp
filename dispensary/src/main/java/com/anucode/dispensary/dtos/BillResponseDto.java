package com.anucode.dispensary.dtos;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class BillResponseDto {
    private UUID id;
    private UUID visitId;
    private UUID patientId;

    private BigDecimal doctorFee;
    private Integer doctorDiscountPct;
    private BigDecimal doctorFeeFinal;

    private BigDecimal medicineTotal;
    private Integer pharmacyDiscountPct;
    private BigDecimal medicineTotalFinal;

    private BigDecimal grandTotal;

    private String status; // DUE, PAID, VOID

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<BillLineItemDto> lineItems;
}
