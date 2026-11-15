package org.example.dinamicas.mapper;

import org.example.comun.RequestResponseMapper;
import org.example.dinamicas.dto.InscripcionSecundariaConDiplomaDto;
import org.example.dinamicas.dto.InscripcionSecundariaDto;
import org.example.dinamicas.dto.InscripcionSecundariaRequestDto;
import org.example.dinamicas.model.InscripcionSecundariaEty;
import org.example.estaticos.mapper.MiniFormAmbMapper;
import org.example.estaticos.mapper.MiniFormEstMapper;
import org.example.estaticos.mapper.MiniFormRespMapper;
import org.example.estaticos.mapper.MiniFormSisMapper;
import org.mapstruct.InheritConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;

// Mismo esqueleto que InscripcionMapper, nivel Secundaria. "uses" trae DiplomaSecundariaMapper
// solo para toDtoConDiploma -- toEntity()/actualizarDesde() de esta clase no tocan el diploma
// (lo maneja InscripcionSecundariaServiceImpl aparte, igual que formacionesComplementarias).
@Mapper(componentModel = MappingConstants.ComponentModel.CDI,
        uses = {MiniFormEstMapper.class,
                MiniFormSisMapper.class,
                MiniFormRespMapper.class,
                MiniFormAmbMapper.class,
                DiplomaSecundariaMapper.class})
public interface InscripcionSecundariaMapper extends RequestResponseMapper<InscripcionSecundariaEty, InscripcionSecundariaRequestDto, InscripcionSecundariaDto> {

    @Override
    @Mapping(target = "estado", source = "estado.estado")
    @Mapping(target = "sistema", source = "sistema.nombre")
    @Mapping(target = "jefeCarrera", source = "jefeCarrera.nombreLargo")
    @Mapping(target = "maestro", source = "maestro.nombreLargo")
    @Mapping(target = "carrera", source = "carrera.nombreLargo")
    @Mapping(target = "ambiente", source = "ambiente.nombre")
    InscripcionSecundariaDto toDto(InscripcionSecundariaEty inscripcion);

    @Override
    @Mapping(target = "diplomaSecundaria", ignore = true)
    InscripcionSecundariaEty toEntity(InscripcionSecundariaRequestDto dto);

    @InheritConfiguration(name = "toEntity")
    void actualizarDesde(@MappingTarget InscripcionSecundariaEty inscripcion, InscripcionSecundariaRequestDto dto);

    // Respuesta de GET/{id}, POST y PUT: la Inscripcion Secundaria aplanada + su diploma.
    @Mapping(target = "inscripcionSecundaria", source = ".")
    InscripcionSecundariaConDiplomaDto toDtoConDiploma(InscripcionSecundariaEty entidad);
}
