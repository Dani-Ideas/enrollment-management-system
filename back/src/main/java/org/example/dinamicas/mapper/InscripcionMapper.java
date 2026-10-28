package org.example.dinamicas.mapper;

import org.example.dinamicas.dto.InscripcionConFormacionComplementariaDto;
import org.example.dinamicas.dto.InscripcionDto;
import org.example.dinamicas.dto.InscripcionRequestDto;
import org.example.estaticos.mapper.MiniFormAmbMapper;
import org.example.estaticos.mapper.MiniFormEstMapper;
import org.example.estaticos.mapper.MiniFormRespMapper;
import org.example.estaticos.mapper.MiniFormSisMapper;
import org.example.dinamicas.dinamica.InscripcionEty;
import org.example.comun.RequestResponseMapper;
import org.mapstruct.InheritConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = MappingConstants.ComponentModel.CDI,
        uses = {MiniFormEstMapper.class,
                MiniFormSisMapper.class,
                MiniFormRespMapper.class,
                MiniFormAmbMapper.class,
                FormacionComplementariaMapper.class})
public interface InscripcionMapper extends RequestResponseMapper<InscripcionEty, InscripcionRequestDto, InscripcionDto> {

    @Override
    @Mapping(target = "estado", source = "estado.estado")
    @Mapping(target = "sistema", source = "sistema.nombre")
    @Mapping(target = "jefeCarrera", source = "jefeCarrera.nombreLargo")
    @Mapping(target = "maestro", source = "maestro.nombreLargo")
    @Mapping(target = "carrera", source = "carrera.nombreLargo")
    @Mapping(target = "ambiente", source = "ambiente.nombre")
    InscripcionDto toDto(InscripcionEty inscripcion);

    @Override
    @Mapping(target = "formacionesComplementarias", ignore = true)
    InscripcionEty toEntity(InscripcionRequestDto dto);

    @InheritConfiguration(name = "toEntity")
    void actualizarDesde(@MappingTarget InscripcionEty inscripcion, InscripcionRequestDto dto);

    // Respuesta del PUT: la Inscripcion aplanada (toDto()) + sus formaciones complementarias.
    // "formacionesComplementarias" no necesita @Mapping: mismo nombre en ambos lados, la
    // lista la convierte FormacionComplementariaMapper.toDto (uses).
    @Mapping(target = "inscripcion", source = ".")
    InscripcionConFormacionComplementariaDto toDtoConFormaciones(InscripcionEty entidad);
}
