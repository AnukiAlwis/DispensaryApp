package com.anucode.dispensary.services.serviceImpl;

import com.anucode.dispensary.dtos.DistributorRequestDto;
import com.anucode.dispensary.dtos.DistributorResponseDto;
import com.anucode.dispensary.entities.Distributor;
import com.anucode.dispensary.entities.Tenant;
import com.anucode.dispensary.exception.DistributorAlreadyExistsException;
import com.anucode.dispensary.exception.TenantMismatchException;
import com.anucode.dispensary.repos.DistributorRepository;
import com.anucode.dispensary.repos.TenantRepository;
import com.anucode.dispensary.services.DistributorService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class DistributorServiceImpl implements DistributorService {

    private final DistributorRepository distributorRepository;
    private final TenantRepository tenantRepository;
    private final ModelMapper modelMapper;

    public DistributorServiceImpl(DistributorRepository distributorRepository,
                                  TenantRepository tenantRepository,
                                  ModelMapper modelMapper) {
        this.distributorRepository = distributorRepository;
        this.tenantRepository = tenantRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public UUID createDistributor(UUID tenantId, DistributorRequestDto requestDto) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new TenantMismatchException("Tenant mismatch"));

        distributorRepository.findByTenantIdAndNameIgnoreCase(tenantId, requestDto.getName())
                .ifPresent(d -> {
                    throw new DistributorAlreadyExistsException("Distributor with name '" + requestDto.getName() + "' already exists for this tenant");
                });

        Distributor distributor = modelMapper.map(requestDto, Distributor.class);
        distributor.setTenant(tenant);
        distributor.setCreatedAt(LocalDateTime.now());

        distributorRepository.save(distributor);
        return distributor.getId();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DistributorResponseDto> listDistributors(UUID tenantId) {
        List<Distributor> distributors = distributorRepository.findByTenantId(tenantId);
        return distributors.stream()
                .map(d -> modelMapper.map(d, DistributorResponseDto.class))
                .collect(Collectors.toList());
    }
}
