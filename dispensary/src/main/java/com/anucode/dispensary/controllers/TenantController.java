package com.anucode.dispensary.controllers;

import com.anucode.dispensary.dtos.TenantResponseDto;
import com.anucode.dispensary.entities.Tenant;
import com.anucode.dispensary.services.TenantService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tenants")
@RequiredArgsConstructor
public class TenantController {

    private final TenantService tenantService;

    @PostMapping
    public Tenant createTenant(@RequestParam String name, @RequestParam String code) {
        return tenantService.createTenant(name, code);
    }

    @GetMapping
    public List<TenantResponseDto> getAllTenants() {
        return tenantService.getAllTenants();
    }
}
