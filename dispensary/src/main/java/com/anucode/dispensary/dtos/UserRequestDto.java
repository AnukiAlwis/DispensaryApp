package com.anucode.dispensary.dtos;

import com.anucode.dispensary.entities.DisplayPosition;
import com.anucode.dispensary.entities.Role;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRequestDto {

    @NotBlank
    @Size(min = 3, max = 50)
    private String username;

    @NotBlank
    private String fullName;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 10, max = 12)
    @Pattern(
            regexp = "^(\\+94\\d{9}|0\\d{9})$",
            message = "Phone must be Number format: +94XXXXXXXXX or 0XXXXXXXXX"
    )
    private String phone;

    @NotEmpty
    private Set<Role> roles;

    private DisplayPosition displayPosition;

    private BigDecimal doctorCharge;

    // Getters & Setters

    @AssertTrue(message = "Doctor charge must be null unless user has DOCTOR role")
    public boolean isDoctorChargeValid() {
        boolean hasDoctorRole = roles != null && roles.stream()
                .anyMatch(role -> "DOCTOR".equals(role.getName()));
        return !hasDoctorRole || doctorCharge != null;
    }

    @AssertTrue(message = "Doctor charge is invalid.")
    public boolean isDoctorChargeInRange() {
        // if not a doctor → always valid, don't change behaviour
        boolean hasDoctorRole = roles != null && roles.stream()
                .anyMatch(role -> "DOCTOR".equals(role.getName()));
        if (!hasDoctorRole) {
            return true;
        }

        // if doctor → doctorCharge must be not null and within range
        if (doctorCharge == null) {
            return false; // triggers the message above
        }

        // check min & max
        return doctorCharge.doubleValue() >= 100 && doctorCharge.doubleValue() <= 3000;
    }
}

