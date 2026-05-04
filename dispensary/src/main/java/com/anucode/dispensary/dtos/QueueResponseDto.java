package com.anucode.dispensary.dtos;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;
@Data
public class QueueResponseDto {
    private UUID id;
    private UUID patientId;
    private UUID doctorId;
    private String patientName;
    private String doctorName;
    private String status;
    private Integer queueNumber;
    private LocalDate queueDate;
    private LocalDateTime createdAt;
    private LocalDateTime checkedInAt;
    private LocalDateTime inProgressAt;
    private LocalDateTime servedAt;
}