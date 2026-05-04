package com.anucode.dispensary.services.serviceImpl;

import com.anucode.dispensary.dtos.DispenseRequestDto;
import com.anucode.dispensary.dtos.DispenseResponseDto;
import com.anucode.dispensary.entities.Dispense;
import com.anucode.dispensary.entities.Medicine;
import com.anucode.dispensary.entities.Prescription;
import com.anucode.dispensary.entities.PrescriptionItem;
import com.anucode.dispensary.entities.User;
import com.anucode.dispensary.exception.*;
import com.anucode.dispensary.repos.*;
import com.anucode.dispensary.services.DispenseService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Transactional
public class DispenseServiceImpl implements DispenseService {

    private final DispenseRepository dispenseRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final MedicineRepository medicineRepository;
    private final UserRepository userRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final ModelMapper modelMapper;

    public DispenseServiceImpl(DispenseRepository dispenseRepository,
                               PrescriptionItemRepository prescriptionItemRepository,
                               MedicineRepository medicineRepository,
                               UserRepository userRepository,
                               PrescriptionRepository prescriptionRepository,
                               ModelMapper modelMapper) {
        this.dispenseRepository = dispenseRepository;
        this.prescriptionItemRepository = prescriptionItemRepository;
        this.medicineRepository = medicineRepository;
        this.userRepository = userRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public UUID recordDispense(UUID tenantId, UUID currentUserId, DispenseRequestDto requestDto) {
        // Validate prescription item exists
        PrescriptionItem pItem = prescriptionItemRepository.findById(requestDto.getPrescriptionItemId())
                .orElseThrow(() -> new PrescriptionItemNotFoundException("Prescription item not found"));

        // Validate prescription belongs to tenant
        Prescription prescription = pItem.getPrescription();
        if (prescription == null) {
            throw new PrescriptionItemNotFoundException("Prescription item not linked to a prescription");
        }
        if (!prescription.getTenant().getId().equals(tenantId)) {
            throw new TenantMismatchException("Prescription item does not belong to tenant");
        }

        // Prescription must be ISSUED
        if (prescription.getStatus() != Prescription.Status.ISSUED) {
            throw new InvalidPrescriptionStateException("Prescription must be ISSUED to dispense");
        }

        // Validate medicine
        Medicine medicine = medicineRepository.findById(requestDto.getMedicineId())
                .orElseThrow(() -> new MedicineNotFoundException("Medicine not found"));

        if (!medicine.getTenant().getId().equals(tenantId)) {
            throw new TenantMismatchException("Medicine does not belong to tenant");
        }
        if (Boolean.FALSE.equals(medicine.getIsActive())) {
            throw new IllegalStateException("Medicine is not active");
        }

        // Ensure prescriptionItem's medicine matches requested medicine
        if (pItem.getMedicine() == null || !pItem.getMedicine().getId().equals(medicine.getId())) {
            throw new InvalidRequestException("Prescription item medicine does not match requested medicine");
        }

        // Check stock availability
        Integer available = medicine.getQuantity() == null ? 0 : medicine.getQuantity();
        if (available < requestDto.getQtyDispensed()) {
            throw new InsufficientStockException("Insufficient stock. Available: " + available + ", requested: " + requestDto.getQtyDispensed());
        }

        // Validate user
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // Create dispense record
        Dispense dispense = new Dispense();
        dispense.setTenant(prescription.getTenant());
        dispense.setPrescriptionItem(pItem);
        dispense.setMedicine(medicine);
        dispense.setQtyDispensed(requestDto.getQtyDispensed());
        dispense.setDispensedAt(LocalDateTime.now());
        dispense.setDispensedBy(user);
        // note not present in entity, skip if not needed; if needed, add field to entity and DTO
        // dispense.setNote(requestDto.getNote()); // if added

        dispenseRepository.save(dispense);

        // Deduct medicine quantity
        medicine.setQuantity(available - requestDto.getQtyDispensed());
        medicineRepository.save(medicine);

        return dispense.getId();
    }

    @Override
    @Transactional(readOnly = true)
    public DispenseResponseDto getDispenseById(UUID tenantId, UUID dispenseId) {
        Dispense dispense = dispenseRepository.findById(dispenseId)
                .orElseThrow(() -> new DispenseNotFoundException("Dispense record not found"));

        if (!dispense.getTenant().getId().equals(tenantId)) {
            throw new TenantMismatchException("Dispense record does not belong to tenant");
        }

        DispenseResponseDto dto = modelMapper.map(dispense, DispenseResponseDto.class);
        dto.setPrescriptionItemId(dispense.getPrescriptionItem() != null ? dispense.getPrescriptionItem().getId() : null);
        dto.setMedicineId(dispense.getMedicine() != null ? dispense.getMedicine().getId() : null);
        dto.setDispensedById(dispense.getDispensedBy() != null ? dispense.getDispensedBy().getId() : null);
        return dto;
    }
}
