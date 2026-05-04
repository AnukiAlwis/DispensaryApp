package com.anucode.dispensary.dtos;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class TenantResponseDto {
    private UUID id;
    private String name;
    private String code;
    private LocalDateTime createdAt;
}
