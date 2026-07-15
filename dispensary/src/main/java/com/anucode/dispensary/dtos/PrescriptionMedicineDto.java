package com.anucode.dispensary.dtos;

import lombok.Data;

import java.util.UUID;

@Data
public class PrescriptionMedicineDto {
    private UUID id;
    private String medicineName;
    private String strength;
    private String dose;
    private String frequency;
    private Integer quantity;
    private Integer currentStock;
}
