package com.anucode.dispensary.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class PatientRequestDto {

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @NotNull
    private LocalDate dob;

    @NotBlank
    private String gender;

    @NotBlank
    @Pattern(
            regexp = "^(\\+94\\d{9}|0\\d{9})$",
            message = "Phone must be Number format: +94XXXXXXXXX or 0XXXXXXXXX"
    )
    private String contact;

    private String address;

    private UUID createdById;
}
