package com.anucode.dispensary.controllers;

import com.anucode.dispensary.config.TenantContext;
import com.anucode.dispensary.dtos.DailySummaryDto;
import com.anucode.dispensary.services.SummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/summary")
@RequiredArgsConstructor
public class SummaryController {

    private final SummaryService summaryService;

    @GetMapping("/today")
    public ResponseEntity<DailySummaryDto> getTodaySummary() {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        UUID doctorId = TenantContext.getCurrentUser();
        LocalDate today = LocalDate.now();
        DailySummaryDto dto = summaryService.getDailySummary(tenantId, doctorId, today);
        return ResponseEntity.ok(dto);
    }
}
