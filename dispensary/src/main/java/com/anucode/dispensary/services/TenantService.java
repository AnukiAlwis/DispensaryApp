package com.anucode.dispensary.services;


import com.anucode.dispensary.dtos.TenantResponseDto;
import com.anucode.dispensary.entities.Tenant;

import java.util.List;
import java.util.Optional;

public interface TenantService {
    Tenant createTenant(String name, String code);
    List<TenantResponseDto> getAllTenants();
    Optional<Tenant> findByCode(String code);
}
