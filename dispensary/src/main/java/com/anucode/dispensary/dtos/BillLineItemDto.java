package com.anucode.dispensary.dtos;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class BillLineItemDto {
    private UUID medicineId;
    private String medicineName;
    private String strength;
    private String dose;
    private String frequency;
    private Integer qty;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
}
