package com.anucode.dispensary.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CompleteDispenseItemDto {
    @NotNull
    private UUID prescriptionItemId;
    @NotNull
    private Integer qtyDispensed;
    private String note;
}
