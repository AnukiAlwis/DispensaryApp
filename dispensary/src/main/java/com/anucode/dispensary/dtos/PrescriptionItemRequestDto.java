package com.anucode.dispensary.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class PrescriptionItemRequestDto {
    @NotNull
    private UUID medicineId;
    private String dosage;
    private String frequency;
    private Integer durationDays;
    private Integer qtyPrescribed;
    private String instructions;
}