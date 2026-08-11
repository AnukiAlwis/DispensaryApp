package com.anucode.dispensary.dtos;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class CompleteDispenseRequestDto {
    @NotEmpty
    @Valid
    private List<CompleteDispenseItemDto> items;
}
