package com.anucode.dispensary.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class VisitRequestDto {

    @NotNull
    private UUID patientId;

    @NotNull
    private UUID doctorId;

    private LocalDateTime visitTime; // if null, default to now

    private String status; // OPEN, CLOSED, CANCELLED (optional, defaults to OPEN)
}
