package com.anucode.dispensary.dtos;

import lombok.Data;
import java.util.UUID;

@Data
public class PrescriptionResponseDto {
    private UUID id;
    private UUID visitId;
    private UUID patientId;
    private UUID doctorId;
    private String status; // STARTED, ISSUED, DISPENSED, CANCELLED
}