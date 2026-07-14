package com.anucode.dispensary.dtos;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class VisitResponseDto {

    private UUID id;
    private UUID patientId;
    private String patientName;
    private UUID doctorId;
    private String doctorName;
    private LocalDateTime visitTime;
    private String status;
    private BigDecimal doctorFee;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UUID createdById;

    private List<VisitNoteResponseDto> notes;
}
