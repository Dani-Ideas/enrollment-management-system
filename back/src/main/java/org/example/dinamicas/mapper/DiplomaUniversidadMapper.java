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

// A diferencia de DiplomaPrimariaMapper/DiplomaSecundariaMapper, esta SI puede ser una
// interfaz comun: no hay un nivel despues de Universidad que necesite resolverla via desdeId,
// asi que no necesita @Inject ni cuerpo propio. "uses" trae DiplomaSecundariaMapper para
// resolver "diplomaSecundaria" (Long -> entidad real) en toEntity(), igual mecanismo que en
// DiplomaSecundariaMapper con diplomaPrimaria.
@Mapper(componentModel = MappingConstants.ComponentModel.CDI, uses = {DiplomaSecundariaMapper.class})
public interface DiplomaUniversidadMapper extends RequestResponseMapper<DiplomaUniversidadEty, DiplomaUniversidadRequestDto, DiplomaUniversidadDto> {

    @Override
    @Mapping(target = "inscripcionUniversidadId", source = "inscripcionUniversidad.id")
    @Mapping(target = "diplomaSecundariaId", source = "diplomaSecundaria.id")
    DiplomaUniversidadDto toDto(DiplomaUniversidadEty entidad);

    // inscripcionUniversidad: la asigna InscripcionUniversidadServiceImpl. diplomaSecundaria
    // SI se resuelve aca (via "uses"): el service necesita la entidad real para validar que
    // el diploma de secundaria referenciado este completo.
    @Override
    @Mapping(target = "inscripcionUniversidad", ignore = true)
    @Mapping(target = "emitido", ignore = true)
    @Mapping(target = "fechaEmision", ignore = true)
    DiplomaUniversidadEty toEntity(DiplomaUniversidadRequestDto dto);

    @InheritConfiguration(name = "toEntity")
    void actualizarDesde(@MappingTarget DiplomaUniversidadEty entidad, DiplomaUniversidadRequestDto dto);
}
