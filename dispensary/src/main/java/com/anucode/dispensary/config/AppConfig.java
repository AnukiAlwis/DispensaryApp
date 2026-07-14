package com.anucode.dispensary.config;

import com.anucode.dispensary.dtos.PatientResponseDto;
import com.anucode.dispensary.dtos.VisitResponseDto;
import com.anucode.dispensary.entities.Patient;
import com.anucode.dispensary.entities.Visit;
import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();


//        // Explicit mapping: Patient -> PatientResponseDto
//        modelMapper.typeMap(Patient.class, PatientResponseDto.class)
//                .addMappings(mapper -> {
//                    mapper.map(src -> src.getCreatedBy() != null ? src.getCreatedBy().getId() : null,
//                            PatientResponseDto::setCreatedById);
//                });

        modelMapper.getConfiguration().setAmbiguityIgnored(true);

        modelMapper.typeMap(Visit.class, VisitResponseDto.class)
                .addMappings(mapper -> mapper.skip(VisitResponseDto::setNotes));

        return modelMapper;
    }
}
