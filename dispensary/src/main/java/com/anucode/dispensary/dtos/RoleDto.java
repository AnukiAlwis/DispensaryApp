package com.anucode.dispensary.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleDto {

    private UUID id;
    private String name;
    private Boolean isSystem;
    private List<PermissionDto> permissions;
}
