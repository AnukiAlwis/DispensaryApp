package com.anucode.dispensary.dtos;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class DailySummaryDto {
    private long patientsWaiting;
    private long patientsServed;
    private BigDecimal totalIncome;
    private BigDecimal totalCharity;
}
