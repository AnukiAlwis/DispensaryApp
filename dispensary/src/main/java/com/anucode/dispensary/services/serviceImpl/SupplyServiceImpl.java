package com.anucode.dispensary.services.serviceImpl;

import com.anucode.dispensary.dtos.*;
import com.anucode.dispensary.entities.*;
import com.anucode.dispensary.exception.*;
import com.anucode.dispensary.repos.*;
import com.anucode.dispensary.services.SupplyService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@Transactional
public class SupplyServiceImpl implements SupplyService {

    private final SupplyRepository supplyRepository;
    private final StockBatchRepository stockBatchRepository;
    private final DistributorRepository distributorRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final MedicineRepository medicineRepository;
    private final ModelMapper modelMapper;
    private final MedicineRepository medicineRepo; // alias if needed

    public SupplyServiceImpl(SupplyRepository supplyRepository,
                             StockBatchRepository stockBatchRepository,
                             DistributorRepository distributorRepository,
                             TenantRepository tenantRepository,
                             UserRepository userRepository,
                             MedicineRepository medicineRepository,
                             ModelMapper modelMapper) {
        this.supplyRepository = supplyRepository;
        this.stockBatchRepository = stockBatchRepository;
        this.distributorRepository = distributorRepository;
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.medicineRepository = medicineRepository;
        this.modelMapper = modelMapper;
        this.medicineRepo = medicineRepository;
    }

    @Override
    public UUID createSupply(UUID tenantId, UUID createdById, SupplyRequestDto requestDto) {
        // validate tenant
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new TenantMismatchException("Tenant mismatch"));

        // validate distributor (belongs to tenant)
        Distributor distributor = distributorRepository.findById(requestDto.getDistributorId())
                .orElseThrow(() -> new DistributorNotFoundException("Distributor not found"));

        if (!distributor.getTenant().getId().equals(tenantId)) {
            throw new TenantMismatchException("Distributor does not belong to tenant");
        }

        // validate createdBy user exists
        userRepository.findById(createdById)
                .orElseThrow(() -> new UserNotFoundException("CreatedBy user not found"));

        // create supply
        Supply supply = new Supply();
        supply.setTenant(tenant);
        supply.setDistributor(distributor);
        supply.setInvoiceNo(requestDto.getInvoiceNo());
        supply.setTotalPayable(requestDto.getTotalPayable());
        supply.setIsPaidFull(requestDto.getIsPaidFull() != null ? requestDto.getIsPaidFull() : Boolean.FALSE);
        supply.setPaymentDateTime(requestDto.getPaymentDateTime());
        supply.setNote(requestDto.getNote());
        supply.setCreatedBy(createdById);
        supply.setCreatedAt(LocalDateTime.now());

        supplyRepository.save(supply);
        return supply.getId();
    }

    @Override
    public List<UUID> addStockBatches(UUID tenantId, UUID supplyId, List<StockBatchRequestDto> batches, UUID createdById) {
        Supply supply = supplyRepository.findById(supplyId)
                .orElseThrow(() -> new SupplyNotFoundException("Supply not found"));

        if (!supply.getTenant().getId().equals(tenantId)) {
            throw new TenantMismatchException("Supply does not belong to tenant");
        }

        // validate createdBy user exists
        userRepository.findById(createdById)
                .orElseThrow(() -> new UserNotFoundException("CreatedBy user not found"));

        List<UUID> createdIds = new ArrayList<>();

        for (StockBatchRequestDto dto : batches) {
            // validate medicine exists and belongs to tenant and is active
            Medicine medicine = medicineRepository.findById(dto.getMedicineId())
                    .orElseThrow(() -> new MedicineNotFoundException("Medicine with id " + dto.getMedicineId() + " not found"));

            if (!medicine.getTenant().getId().equals(tenantId)) {
                throw new TenantMismatchException("Medicine does not belong to tenant");
            }
            if (Boolean.FALSE.equals(medicine.getIsActive())) {
                throw new IllegalStateException("Medicine is not active: " + dto.getMedicineId());
            }

            StockBatch batch = new StockBatch();
            batch.setTenant(supply.getTenant());
            batch.setMedicine(medicine);
            batch.setSupply(supply); // <-- important link
            batch.setBatchNo(dto.getBatchNo());
            batch.setExpiryDate(dto.getExpiryDate());
            batch.setQtyReceived(dto.getQtyReceived());
            batch.setUnitCost(dto.getUnitCost());
            batch.setReceivedAt(LocalDateTime.now());
            batch.setCreatedBy(createdById);
            batch.setCreatedAt(LocalDateTime.now());

            stockBatchRepository.save(batch);
            createdIds.add(batch.getId());

            // update medicine quantity (store as integer, default 0)
            Integer existingQty = medicine.getQuantity() == null ? 0 : medicine.getQuantity();
            medicine.setQuantity(existingQty + dto.getQtyReceived());
            medicineRepository.save(medicine);
        }

        return createdIds;
    }

    @Override
    @Transactional(readOnly = true)
    public SupplyResponseDto getSupplyById(UUID tenantId, UUID supplyId) {
        Supply supply = supplyRepository.findById(supplyId)
                .orElseThrow(() -> new SupplyNotFoundException("Supply not found"));

        if (!supply.getTenant().getId().equals(tenantId)) {
            throw new TenantMismatchException("Tenant mismatch");
        }

        SupplyResponseDto dto = modelMapper.map(supply, SupplyResponseDto.class);
        dto.setDistributorId(supply.getDistributor() != null ? supply.getDistributor().getId() : null);

        List<StockBatch> batches = stockBatchRepository.findBySupplyIdOrderByCreatedAtAsc(supplyId);
        List<StockBatchResponseDto> batchDtos = batches.stream()
                .map(b -> {
                    StockBatchResponseDto br = modelMapper.map(b, StockBatchResponseDto.class);
                    br.setMedicineId(b.getMedicine() != null ? b.getMedicine().getId() : null);
                    return br;
                })
                .collect(Collectors.toList());

        dto.setStockBatches(batchDtos);
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplyResponseDto> listSupplies(UUID tenantId, UUID distributorId) {
        List<Supply> supplies;
        if (distributorId != null) {
            supplies = supplyRepository.findByTenantIdAndDistributorId(tenantId, distributorId);
        } else {
            supplies = supplyRepository.findByTenantId(tenantId);
        }

        return supplies.stream().map(s -> {
            SupplyResponseDto dto = modelMapper.map(s, SupplyResponseDto.class);
            dto.setDistributorId(s.getDistributor() != null ? s.getDistributor().getId() : null);
            return dto;
        }).collect(Collectors.toList());
    }
}
