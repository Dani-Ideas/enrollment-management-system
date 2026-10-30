package org.example.dinamicas.mapper;

import org.example.comun.RequestResponseMapper;
import org.example.dinamicas.model.DireccionEty;
import org.example.dinamicas.dto.DireccionDto;
import org.example.dinamicas.dto.DireccionRequestDto;
import org.example.estaticos.mapper.ColoniaMapper;
import org.example.estaticos.mapper.EstadoMapper;
import org.example.estaticos.mapper.MunicipioMapper;
import org.example.estaticos.mapper.PaisMapper;
import org.example.estaticos.mapper.TipoDireccionMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

// Los DTOs anidados (colonia, municipio, estado, pais) y los desdeId() de la PK los ponen
// los mappers de estaticos y PersonaMapper.
@Mapper(componentModel = MappingConstants.ComponentModel.CDI,
        uses = {PersonaMapper.class, ColoniaMapper.class, MunicipioMapper.class, EstadoMapper.class,
                PaisMapper.class, TipoDireccionMapper.class})
public interface DireccionMapper extends RequestResponseMapper<DireccionEty, DireccionRequestDto, DireccionDto> {

    @Override
    @Mapping(target = "personaId", source = "persona")
    @Mapping(target = "tipoId", source = "tipo.id")
    @Mapping(target = "tipo", source = "tipo.descripcion")
    @Mapping(target = "colonia", source = "colonia")
    @Mapping(target = "municipio", source = "colonia.municipio")
    @Mapping(target = "estado", source = "colonia.municipio.estado")
    @Mapping(target = "pais", source = "colonia.municipio.estado.pais")
    DireccionDto toDto(DireccionEty direccion);

    @Override
    @Mapping(target = "persona", source = "personaId")
    @Mapping(target = "colonia", source = "coloniaId")
    @Mapping(target = "tipo", source = "tipoId")
    @Mapping(target = "creadoEn", ignore = true)
    DireccionEty toEntity(DireccionRequestDto dto);
}
