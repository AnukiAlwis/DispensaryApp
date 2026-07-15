package com.anucode.dispensary.dtos;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class CurrentServingPrescriptionDto {
    private UUID id;
    private String patientName;
    private String patientPhone;
    private String doctorName;
    private LocalDateTime issuedAt; // using updatedAt as proxy for issued time
}
