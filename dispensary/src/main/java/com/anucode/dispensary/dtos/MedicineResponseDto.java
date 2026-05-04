package com.anucode.dispensary.dtos;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class MedicineResponseDto {

    private UUID id;
    private String name;
    private String form;
    private String strength;
    private String unitOfMeasurement;
    private BigDecimal sellPrice;
    private Integer reorderLevel;
    private Integer quantity;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
