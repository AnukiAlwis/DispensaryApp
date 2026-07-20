package com.anucode.dispensary.services;

import com.anucode.dispensary.dtos.DailySummaryDto;

import java.time.LocalDate;
import java.util.UUID;

public interface SummaryService {
    DailySummaryDto getDailySummary(UUID tenantId, UUID doctorId, LocalDate date);
}
