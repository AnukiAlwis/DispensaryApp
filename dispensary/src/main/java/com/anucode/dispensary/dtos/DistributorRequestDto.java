package com.anucode.dispensary.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class DistributorRequestDto {

    @NotBlank
    private String name;

    @NotBlank
    @Pattern(
            regexp = "^(\\+94\\d{9}|0\\d{9})$",
            message = "Phone must be Number format: +94XXXXXXXXX or 0XXXXXXXXX"
    )
    private String contact;

    @NotBlank
    private String address;
}
