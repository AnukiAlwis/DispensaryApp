package com.anucode.dispensary.services;

import com.anucode.dispensary.dtos.*;

import java.util.List;
import java.util.UUID;

public interface BillService {

    UUID createBill(UUID tenantId, UUID currentUserId, BillCreateDto dto);

    BillResponseDto getBill(UUID tenantId, UUID billId);

    BillResponseDto calculateBill(UUID tenantId, UUID currentUserId, UUID billId);

    BillResponseDto updateDiscounts(UUID tenantId, UUID currentUserId, UUID billId, BillDiscountUpdateDto dto);

    BillResponseDto updateStatus(UUID tenantId, UUID currentUserId, UUID billId, BillStatusUpdateDto dto);

    List<BillResponseDto> listBillsByPatient(UUID tenantId, UUID patientId);
}
