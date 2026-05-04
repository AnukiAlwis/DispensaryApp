package com.anucode.dispensary.services.serviceImpl;

import com.anucode.dispensary.dtos.MedicineRequestDto;
import com.anucode.dispensary.dtos.MedicineResponseDto;
import com.anucode.dispensary.entities.Medicine;
import com.anucode.dispensary.entities.Tenant;
import com.anucode.dispensary.entities.User;
import com.anucode.dispensary.exception.TenantMismatchException;
import com.anucode.dispensary.repos.MedicineRepository;
import com.anucode.dispensary.repos.TenantRepository;
import com.anucode.dispensary.repos.UserRepository;
import com.anucode.dispensary.services.MedicineService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class MedicineServiceImpl implements MedicineService {

    private final MedicineRepository medicineRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    public MedicineServiceImpl(MedicineRepository medicineRepository,
                               TenantRepository tenantRepository,
                               UserRepository userRepository,
                               ModelMapper modelMapper) {
        this.medicineRepository = medicineRepository;
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public UUID addMedicine(UUID tenantId, MedicineRequestDto requestDto, UUID createdById) {

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new TenantMismatchException("Tenant mismatch"));

        User createdBy = userRepository.findById(createdById)
                .orElseThrow(() -> new RuntimeException("Invalid createdBy user"));

        Medicine medicine = modelMapper.map(requestDto, Medicine.class);
        medicine.setTenant(tenant);

        medicineRepository.save(medicine);
        return medicine.getId();
    }

    @Override
    public List<MedicineResponseDto> listMedicines(UUID tenantId) {
        List<Medicine> medicines = medicineRepository.findByTenantId(tenantId);
        return medicines.stream()
                .map(m -> modelMapper.map(m, MedicineResponseDto.class))
                .collect(Collectors.toList());
    }
}
