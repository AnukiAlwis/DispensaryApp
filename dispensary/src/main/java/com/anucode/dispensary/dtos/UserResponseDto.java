package com.anucode.dispensary.dtos;

import com.anucode.dispensary.entities.User;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDto {

    private UUID id;
    private String username;
    private String fullName;
    private String email;
    private String phone;
    private User.Role role;
    private BigDecimal doctorCharge;
    private UUID tenantId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Getters & Setters
}

