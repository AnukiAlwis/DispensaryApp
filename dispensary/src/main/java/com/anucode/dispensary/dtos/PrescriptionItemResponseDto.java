package com.anucode.dispensary.dtos;

import lombok.Data;

import java.util.UUID;

@Data
public class PrescriptionItemResponseDto {
    private UUID id;
    private UUID medicineId;
    private String medicineName;
    private String medicineStrength;
    private String dosage;
    private String frequency;
    private Integer durationDays;
    private Integer qtyPrescribed;
    private String instructions;
}