package com.anucode.dispensary.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VisitNoteRequestDto {


    @NotBlank
    private String note;
}
