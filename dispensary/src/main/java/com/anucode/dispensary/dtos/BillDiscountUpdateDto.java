package com.anucode.dispensary.dtos;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class BillDiscountUpdateDto {
    @Min(0) @Max(100)
    private Integer doctorDiscountPct;

    @Min(0) @Max(100)
    private Integer pharmacyDiscountPct;
}
