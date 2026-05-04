package com.anucode.dispensary.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class PrescriptionRequestDto {
    @NotNull
    private UUID visitId;
    @NotNull
    private UUID patientId;
}