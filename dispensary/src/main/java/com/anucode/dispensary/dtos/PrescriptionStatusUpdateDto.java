package com.anucode.dispensary.dtos;


import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PrescriptionStatusUpdateDto {
    @NotNull
    private String status; // STARTED → ISSUED, ISSUED → DISPENSED/CANCELLED
}