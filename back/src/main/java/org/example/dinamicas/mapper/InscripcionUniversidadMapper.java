package org.example.dinamicas.mapper;

import org.example.comun.RequestResponseMapper;
import org.example.dinamicas.dto.InscripcionUniversidadConDiplomaDto;
import org.example.dinamicas.dto.InscripcionUniversidadDto;
import org.example.dinamicas.dto.InscripcionUniversidadRequestDto;
import org.example.dinamicas.model.InscripcionUniversidadEty;
import org.example.estaticos.mapper.MiniFormAmbMapper;
import org.example.estaticos.mapper.MiniFormEstMapper;
import org.example.estaticos.mapper.MiniFormRespMapper;
import org.example.estaticos.mapper.MiniFormSisMapper;
import org.mapstruct.InheritConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;

// Mismo esqueleto que InscripcionSecundariaMapper, nivel Universidad.
@Mapper(componentModel = MappingConstants.ComponentModel.CDI,
        uses = {MiniFormEstMapper.class,
                MiniFormSisMapper.class,
                MiniFormRespMapper.class,
                MiniFormAmbMapper.class,
                DiplomaUniversidadMapper.class})
public interface InscripcionUniversidadMapper extends RequestResponseMapper<InscripcionUniversidadEty, InscripcionUniversidadRequestDto, InscripcionUniversidadDto> {

    @Override
    @Mapping(target = "estado", source = "estado.estado")
    @Mapping(target = "sistema", source = "sistema.nombre")
    @Mapping(target = "jefeCarrera", source = "jefeCarrera.nombreLargo")
    @Mapping(target = "maestro", source = "maestro.nombreLargo")
    @Mapping(target = "carrera", source = "carrera.nombreLargo")
    @Mapping(target = "ambiente", source = "ambiente.nombre")
    InscripcionUniversidadDto toDto(InscripcionUniversidadEty inscripcion);

    @Override
    @Mapping(target = "diplomaUniversidad", ignore = true)
    InscripcionUniversidadEty toEntity(InscripcionUniversidadRequestDto dto);

    @InheritConfiguration(name = "toEntity")
    void actualizarDesde(@MappingTarget InscripcionUniversidadEty inscripcion, InscripcionUniversidadRequestDto dto);

    @Mapping(target = "inscripcionUniversidad", source = ".")
    InscripcionUniversidadConDiplomaDto toDtoConDiploma(InscripcionUniversidadEty entidad);
}
