package org.example.dinamicas.mapper;

import org.example.comun.RequestResponseMapper;
import org.example.dinamicas.dto.DiplomaUniversidadDto;
import org.example.dinamicas.dto.DiplomaUniversidadRequestDto;
import org.example.dinamicas.model.DiplomaUniversidadEty;
import org.mapstruct.InheritConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;

// Interfaz comun, sin @Inject: cierra la cadena, nadie necesita resolverla por Long despues
// de Universidad. DiplomaUniversidadRequestDto ya no trae ninguna FK propia (la PK compartida
// la fija InscripcionUniversidadRequestDto.diplomaSecundaria, un nivel arriba).
@Mapper(componentModel = MappingConstants.ComponentModel.CDI)
public interface DiplomaUniversidadMapper extends RequestResponseMapper<DiplomaUniversidadEty, DiplomaUniversidadRequestDto, DiplomaUniversidadDto> {

    @Override
    @Mapping(target = "id", source = "inscripcionUniversidad.diplomaSecundaria.inscripcionSecundaria.diplomaPrimaria.id")
    DiplomaUniversidadDto toDto(DiplomaUniversidadEty entidad);

    // inscripcionUniversidad: la asigna InscripcionUniversidadServiceImpl (PK compartida).
    @Override
    @Mapping(target = "inscripcionUniversidad", ignore = true)
    @Mapping(target = "emitido", ignore = true)
    @Mapping(target = "fechaEmision", ignore = true)
    DiplomaUniversidadEty toEntity(DiplomaUniversidadRequestDto dto);

    @InheritConfiguration(name = "toEntity")
    void actualizarDesde(@MappingTarget DiplomaUniversidadEty entidad, DiplomaUniversidadRequestDto dto);
}
