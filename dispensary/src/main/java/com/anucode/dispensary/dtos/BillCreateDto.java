package com.anucode.dispensary.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class BillCreateDto {
    @NotNull
    private UUID visitId;

    // Improvement : this bill creation api can be introduced as a part in the visit creation API.
    // implementing in separate API for separate of concerns for now.
}
