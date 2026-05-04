package com.anucode.dispensary.dtos;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class DistributorResponseDto {

    private UUID id;
    private String name;
    private String contact;
    private String address;
    private LocalDateTime createdAt;
}
