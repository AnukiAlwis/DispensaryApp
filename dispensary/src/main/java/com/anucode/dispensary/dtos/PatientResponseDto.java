package com.anucode.dispensary.dtos;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class PatientResponseDto {

    private UUID id;
    private String firstName;
    private String lastName;
    private LocalDate dob;
    private String age;
    private String gender;
    private String contact;
    private String address;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UUID createdById;
}
