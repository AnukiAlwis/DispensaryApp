package com.anucode.dispensary.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BillStatusUpdateDto {
    @NotBlank
    private String status; // PAID or VOID
}
