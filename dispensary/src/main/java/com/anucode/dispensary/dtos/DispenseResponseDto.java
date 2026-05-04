package com.anucode.dispensary.dtos;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class DispenseResponseDto {

    private UUID id;
    private UUID prescriptionItemId;
    private UUID medicineId;
    private Integer qtyDispensed;
    private LocalDateTime dispensedAt;
    private UUID dispensedById;
    private String note;
}
