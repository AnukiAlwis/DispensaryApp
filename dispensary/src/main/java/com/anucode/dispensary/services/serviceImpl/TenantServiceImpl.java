package com.anucode.dispensary.services.serviceImpl;

import com.anucode.dispensary.dtos.TenantResponseDto;
import com.anucode.dispensary.entities.Tenant;
import com.anucode.dispensary.exception.TenantAlreadyExistsException;
import com.anucode.dispensary.repos.TenantRepository;
import com.anucode.dispensary.services.TenantService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TenantServiceImpl implements TenantService {

    private final TenantRepository tenantRepository;

    @Override
    public Tenant createTenant(String name, String code) {
        // Check if tenant name already exists
        if (tenantRepository.existsByName(name)) {
            throw new TenantAlreadyExistsException("Tenant with name '" + name + "' already exists");
        }

        // Check if tenant code already exists
        if (tenantRepository.existsByCode(code)) {
            throw new TenantAlreadyExistsException("Tenant with code '" + code + "' already exists");
        }

        Tenant tenant = Tenant.builder()
                .name(name)
                .code(code)
                .build();

        return tenantRepository.save(tenant);
    }

    @Override
    public List<TenantResponseDto> getAllTenants() {
        List<Tenant> tenants = tenantRepository.findAll();

        return tenants.stream()
                .map(t -> TenantResponseDto.builder()
                        .id(t.getId())
                        .name(t.getName())
                        .code(t.getCode())
                        .createdAt(t.getCreatedAt())
                        .build())
                .toList(); // returns unmodifiable list in Java 16+
    }
}

