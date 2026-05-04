package com.anucode.dispensary.dtos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class DispenseRequestDto {

    @NotNull
    private UUID prescriptionItemId;

    @NotNull
    private UUID medicineId;

    @NotNull
    @Min(1)
    private Integer qtyDispensed;

    private String note;
}
