package com.anucode.dispensary.dtos;

import lombok.*;

import java.util.UUID;

@Data
public class QueueCreateDto {
    private UUID patientId;
    private UUID doctorId;
}