package com.anucode.dispensary.services.serviceImpl;

import com.anucode.dispensary.dtos.DailySummaryDto;
import com.anucode.dispensary.entities.QueueEntry;
import com.anucode.dispensary.repos.BillRepository;
import com.anucode.dispensary.repos.QueueEntryRepository;
import com.anucode.dispensary.services.SummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SummaryServiceImpl implements SummaryService {

    private final QueueEntryRepository queueEntryRepository;
    private final BillRepository billRepository;

    @Override
    public DailySummaryDto getDailySummary(UUID tenantId, UUID doctorId, LocalDate date) {
        long patientsWaiting = queueEntryRepository.countByTenantIdAndDoctorIdAndQueueDateAndStatus(
                tenantId, doctorId, date, QueueEntry.Status.CHECKED_IN_WAITING);
        long patientsServed = queueEntryRepository.countByTenantIdAndDoctorIdAndQueueDateAndStatus(
                tenantId, doctorId, date, QueueEntry.Status.SERVED);
        BigDecimal totalIncome = billRepository.sumIncomeByDoctorAndDate(tenantId, doctorId, date);
        BigDecimal totalCharity = billRepository.sumCharityByDoctorAndDate(tenantId, doctorId, date);

        DailySummaryDto dto = new DailySummaryDto();
        dto.setPatientsWaiting(patientsWaiting);
        dto.setPatientsServed(patientsServed);
        dto.setTotalIncome(totalIncome != null ? totalIncome : BigDecimal.ZERO);
        dto.setTotalCharity(totalCharity != null ? totalCharity : BigDecimal.ZERO);
        return dto;
    }
}
