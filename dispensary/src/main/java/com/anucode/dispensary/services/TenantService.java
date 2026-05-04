package com.anucode.dispensary.services;


import com.anucode.dispensary.dtos.TenantResponseDto;
import com.anucode.dispensary.entities.Tenant;

import java.util.List;

public interface TenantService {
    Tenant createTenant(String name, String code);
    List<TenantResponseDto> getAllTenants();
}
