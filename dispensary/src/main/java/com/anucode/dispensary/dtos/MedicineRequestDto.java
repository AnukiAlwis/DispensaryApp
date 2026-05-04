package com.anucode.dispensary.dtos;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MedicineRequestDto {

    @NotBlank
    private String name;

    private String form;

    private String strength;

    @NotBlank
    private String unitOfMeasurement;

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal sellPrice;

    @Min(0)
    private Integer reorderLevel;

    @NotNull
    @Min(0)
    private Integer quantity; // of lowest sellable unit
}
