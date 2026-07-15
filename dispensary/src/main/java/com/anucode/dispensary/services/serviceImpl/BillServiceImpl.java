package com.anucode.dispensary.services.serviceImpl;

import com.anucode.dispensary.dtos.*;
import com.anucode.dispensary.entities.*;
import com.anucode.dispensary.exception.*;
import com.anucode.dispensary.repos.*;
import com.anucode.dispensary.services.BillService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class BillServiceImpl implements BillService {

    private final BillRepository billRepository;
    private final BillLineItemRepository billLineItemRepository;
    private final VisitRepository visitRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final DispenseRepository dispenseRepository;
    private final MedicineRepository medicineRepository;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final ModelMapper modelMapper;

    public BillServiceImpl(BillRepository billRepository,
                           BillLineItemRepository billLineItemRepository,
                           VisitRepository visitRepository,
                           PrescriptionRepository prescriptionRepository,
                           PrescriptionItemRepository prescriptionItemRepository,
                           DispenseRepository dispenseRepository,
                           MedicineRepository medicineRepository,
                           UserRepository userRepository,
                           PatientRepository patientRepository,
                           ModelMapper modelMapper) {
        this.billRepository = billRepository;
        this.billLineItemRepository = billLineItemRepository;
        this.visitRepository = visitRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.prescriptionItemRepository = prescriptionItemRepository;
        this.dispenseRepository = dispenseRepository;
        this.medicineRepository = medicineRepository;
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public UUID createBill(UUID tenantId, UUID currentUserId, BillCreateDto dto) {
        // Validate current user
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // Load visit
        Visit visit = visitRepository.findById(dto.getVisitId())
                .orElseThrow(() -> new NotFoundException("Visit not found"));

        if (!visit.getTenant().getId().equals(tenantId)) {
            throw new TenantMismatchException("Visit does not belong to tenant");
        }

        // Load prescription
        Prescription prescription = prescriptionRepository.findByVisitId(visit.getId())
                .orElseThrow(() -> new NotFoundException("Prescription for visit not found"));

        if (!prescription.getTenant().getId().equals(tenantId)) {
            throw new TenantMismatchException("Prescription does not belong to tenant");
        }

        // 🔹 Get doctor fee from user table instead of DTO
        // Assuming Visit has a getDoctor() returning User or createdBy is doctor userId:
        User doctorUser = visit.getDoctor(); // or userRepository.findById(visit.getDoctorId())
        if (doctorUser == null) {
            throw new NotFoundException("Doctor for visit not found");
        }

        BigDecimal doctorFee = doctorUser.getDoctorCharge(); // your field in User entity

        // Build bill
        Bill bill = new Bill();
        bill.setTenant(visit.getTenant());
        bill.setPatient(visit.getPatient());
        bill.setPrescription(prescription);
        bill.setDoctorFee(doctorFee);
        bill.setDoctorDiscountPct(null);
        bill.setDoctorFeeFinal(doctorFee); // initial, before calculate
        bill.setMedicineTotal(BigDecimal.ZERO);
        bill.setPharmacyDiscountPct(null);
        bill.setMedicineTotalFinal(BigDecimal.ZERO);
        bill.setGrandTotal(bill.getDoctorFeeFinal().add(bill.getMedicineTotalFinal()));
        bill.setStatus(Bill.Status.DUE);
        bill.setCreatedAt(LocalDateTime.now());

        billRepository.save(bill);

        // Create line items from dispensed records
        createOrRefreshLineItemsFromDispense(bill);

        // Calculate totals and persist (so bill created has accurate medicineTotal)
        calculateAndPersist(bill);

        return bill.getId();
    }


    private void createOrRefreshLineItemsFromDispense(Bill bill) {
        // Remove existing line items (if any) and recreate from dispenses for the prescription
        List<BillLineItem> existing = billLineItemRepository.findByBillId(bill.getId());
        if (!existing.isEmpty()) {
            billLineItemRepository.deleteAll(existing);
        }

        // Gather dispenses for the prescription
        List<Dispense> dispenses = dispenseRepository.findByPrescriptionItemPrescriptionId(bill.getPrescription().getId());

        if (!dispenses.isEmpty()) {
            // Group by medicine
            Map<UUID, List<Dispense>> grouped = dispenses.stream()
                    .collect(Collectors.groupingBy(d -> d.getMedicine().getId()));

            for (Map.Entry<UUID, List<Dispense>> e : grouped.entrySet()) {
                UUID medicineId = e.getKey();
                Medicine med = medicineRepository.findById(medicineId)
                        .orElseThrow(() -> new MedicineNotFoundException("Medicine not found in dispenses"));

                int totalQty = e.getValue().stream().mapToInt(Dispense::getQtyDispensed).sum();
                BigDecimal unitPrice = med.getSellPrice() == null ? BigDecimal.ZERO : med.getSellPrice();
                BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(totalQty));

                BillLineItem item = new BillLineItem();
                item.setId(UUID.randomUUID());
                item.setBill(bill);
                item.setMedicine(med);
                item.setQty(totalQty);
                item.setUnitPrice(unitPrice);
                item.setLineTotal(lineTotal);

                billLineItemRepository.save(item);
            }
        } else {
            // No dispenses yet: calculate a temporary total from prescribed items
            List<PrescriptionItem> prescriptionItems = prescriptionItemRepository.findByPrescriptionId(bill.getPrescription().getId());
            Map<UUID, List<PrescriptionItem>> grouped = prescriptionItems.stream()
                    .collect(Collectors.groupingBy(pi -> pi.getMedicine().getId()));

            for (Map.Entry<UUID, List<PrescriptionItem>> e : grouped.entrySet()) {
                UUID medicineId = e.getKey();
                Medicine med = medicineRepository.findById(medicineId)
                        .orElseThrow(() -> new MedicineNotFoundException("Medicine not found in prescription items"));

                int totalQty = e.getValue().stream()
                        .mapToInt(pi -> pi.getQtyPrescribed() != null ? pi.getQtyPrescribed() : 0)
                        .sum();
                BigDecimal unitPrice = med.getSellPrice() == null ? BigDecimal.ZERO : med.getSellPrice();
                BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(totalQty));

                BillLineItem item = new BillLineItem();
                item.setId(UUID.randomUUID());
                item.setBill(bill);
                item.setMedicine(med);
                item.setQty(totalQty);
                item.setUnitPrice(unitPrice);
                item.setLineTotal(lineTotal);

                billLineItemRepository.save(item);
            }
        }
    }

    private BigDecimal sumLineItems(Bill bill) {
        List<BillLineItem> items = billLineItemRepository.findByBillId(bill.getId());
        return items.stream()
                .map(BillLineItem::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    @Transactional(readOnly = true)
    public BillResponseDto getBill(UUID tenantId, UUID billId) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new NotFoundException("Bill not found"));

        if (!bill.getTenant().getId().equals(tenantId)) {
            throw new TenantMismatchException("Bill does not belong to tenant");
        }

        BillResponseDto dto = modelMapper.map(bill, BillResponseDto.class);
        dto.setVisitId(bill.getPrescription().getVisit().getId());
        dto.setPatientId(bill.getPatient() != null ? bill.getPatient().getId() : null);
        dto.setStatus(bill.getStatus().name());

        List<BillLineItem> items = billLineItemRepository.findByBillId(bill.getId());
        List<BillLineItemDto> itemDtos = items.stream().map(it -> {
            BillLineItemDto li = new BillLineItemDto();
            li.setMedicineId(it.getMedicine() != null ? it.getMedicine().getId() : null);
            li.setMedicineName(it.getMedicine() != null ? it.getMedicine().getName() : null);
            li.setQty(it.getQty());
            li.setUnitPrice(it.getUnitPrice());
            li.setTotalPrice(it.getLineTotal());
            return li;
        }).collect(Collectors.toList());

        dto.setLineItems(itemDtos);
        return dto;
    }

    /**
     * Recalculate and persist calculated columns for the bill.
     * This will update doctorFeeFinal, medicineTotal, medicineTotalFinal, grandTotal, updatedAt.
     */
    @Override
    public BillResponseDto calculateBill(UUID tenantId, UUID currentUserId, UUID billId) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new NotFoundException("Bill not found"));

        if (!bill.getTenant().getId().equals(tenantId)) {
            throw new TenantMismatchException("Bill does not belong to tenant");
        }

        // refresh line items from dispense (in case new dispense happened)
        createOrRefreshLineItemsFromDispense(bill);

        // compute medicineTotal
        BigDecimal medicineTotal = sumLineItems(bill);
        bill.setMedicineTotal(medicineTotal);

        // doctorFeeFinal
        BigDecimal doctorFeeFinal = bill.getDoctorFee();
        if (bill.getDoctorDiscountPct() != null) {
            doctorFeeFinal = bill.getDoctorFee()
                    .subtract(bill.getDoctorFee().multiply(BigDecimal.valueOf(bill.getDoctorDiscountPct())).divide(BigDecimal.valueOf(100)));
        }
        bill.setDoctorFeeFinal(doctorFeeFinal);

        // medicineTotalFinal
        BigDecimal medicineTotalFinal = medicineTotal;
        if (bill.getPharmacyDiscountPct() != null) {
            medicineTotalFinal = medicineTotal
                    .subtract(medicineTotal.multiply(BigDecimal.valueOf(bill.getPharmacyDiscountPct())).divide(BigDecimal.valueOf(100)));
        }
        bill.setMedicineTotalFinal(medicineTotalFinal);

        // grand total
        BigDecimal grandTotal = doctorFeeFinal.add(medicineTotalFinal);
        bill.setGrandTotal(grandTotal);

        bill.setUpdatedAt(LocalDateTime.now());
        billRepository.save(bill);

        return getBill(tenantId, bill.getId());
    }

    @Override
    public BillResponseDto updateDiscounts(UUID tenantId, UUID currentUserId, UUID billId, BillDiscountUpdateDto dto) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new NotFoundException("Bill not found"));

        if (!bill.getTenant().getId().equals(tenantId)) {
            throw new TenantMismatchException("Bill does not belong to tenant");
        }

        if (bill.getStatus() == Bill.Status.PAID || bill.getStatus() == Bill.Status.VOID) {
            throw new IllegalStateException("Cannot update discounts on a PAID or VOID bill");
        }

        // permission check - only DOCTOR can update discounts
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (!"DOCTOR".equalsIgnoreCase(user.getRole().toString())) {
            throw new PermissionDeniedException("Only doctors can update discounts");
        }

        if (dto.getDoctorDiscountPct() != null) bill.setDoctorDiscountPct(dto.getDoctorDiscountPct());
        if (dto.getPharmacyDiscountPct() != null) bill.setPharmacyDiscountPct(dto.getPharmacyDiscountPct());

        // persist discounts and recalculate
        billRepository.save(bill);

        return calculateBill(tenantId, currentUserId, bill.getId());
    }

    @Override
    public BillResponseDto updateStatus(UUID tenantId, UUID currentUserId, UUID billId, BillStatusUpdateDto dto) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new NotFoundException("Bill not found"));

        if (!bill.getTenant().getId().equals(tenantId)) {
            throw new TenantMismatchException("Bill does not belong to tenant");
        }

        Bill.Status newStatus;
        try {
            newStatus = Bill.Status.valueOf(dto.getStatus());
        } catch (IllegalArgumentException ex) {
            throw new InvalidRequestException("Invalid status");
        }

        // transitions: DUE -> PAID/VOID allowed; PAID/VOID are terminal
        if (bill.getStatus() == Bill.Status.PAID || bill.getStatus() == Bill.Status.VOID) {
            throw new IllegalStateException("Cannot change status of PAID or VOID bill");
        }

        if (!(newStatus == Bill.Status.PAID || newStatus == Bill.Status.VOID)) {
            throw new InvalidRequestException("Status can only be set to PAID or VOID");
        }

        bill.setStatus(newStatus);
        bill.setUpdatedAt(LocalDateTime.now());
        billRepository.save(bill);

        return getBill(tenantId, bill.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BillResponseDto> listBillsByPatient(UUID tenantId, UUID patientId) {
        List<Bill> bills = billRepository.findByTenantIdAndPatientId(tenantId, patientId);
        return bills.stream().map(b -> {
            try {
                return getBill(tenantId, b.getId());
            } catch (Exception ex) {
                return null;
            }
        }).filter(Objects::nonNull).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BillResponseDto getBillByPrescriptionId(UUID tenantId, UUID prescriptionId) {
        Bill bill = billRepository.findByPrescription_Id(prescriptionId)
                .orElseThrow(() -> new NotFoundException("Bill not found"));

        if (!bill.getTenant().getId().equals(tenantId)) {
            throw new TenantMismatchException("Bill does not belong to tenant");
        }

        return getBill(tenantId, bill.getId());
    }


    private void calculateAndPersist(Bill bill) {
        // 1. Re-fetch line items from DB to ensure you have latest data
        List<BillLineItem> lineItems = billLineItemRepository.findByBillId(bill.getId());

        // 2. Sum medicine totals
        BigDecimal medicineTotal = lineItems.stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQty())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        bill.setMedicineTotal(medicineTotal);

        // 3. Apply pharmacy discount if set
        if (bill.getPharmacyDiscountPct() != null) {
            BigDecimal discountAmount = medicineTotal
                    .multiply(BigDecimal.valueOf(bill.getPharmacyDiscountPct()))
                    .divide(BigDecimal.valueOf(100));
            bill.setMedicineTotalFinal(medicineTotal.subtract(discountAmount));
        } else {
            bill.setMedicineTotalFinal(medicineTotal);
        }

        // 4. Apply doctor discount if set
        if (bill.getDoctorDiscountPct() != null) {
            BigDecimal doctorDiscountAmount = bill.getDoctorFee()
                    .multiply(BigDecimal.valueOf(bill.getDoctorDiscountPct()))
                    .divide(BigDecimal.valueOf(100));
            bill.setDoctorFeeFinal(bill.getDoctorFee().subtract(doctorDiscountAmount));
        } else {
            bill.setDoctorFeeFinal(bill.getDoctorFee());
        }

        // 5. Grand total
        bill.setGrandTotal(bill.getDoctorFeeFinal().add(bill.getMedicineTotalFinal()));

        // 6. Save changes
        billRepository.save(bill);
    }

}
