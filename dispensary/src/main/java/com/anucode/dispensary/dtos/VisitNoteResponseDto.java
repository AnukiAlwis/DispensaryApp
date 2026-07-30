package com.anucode.dispensary.dtos;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class VisitNoteResponseDto {

    private UUID id;
    private String note;
    private UUID recordedById;
    private String recordedByFullName;
    private String recordedByRole;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
