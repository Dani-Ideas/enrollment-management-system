package org.example.estaticos.mapper;

import org.example.estaticos.dto.ColoniaDto;
import org.example.estaticos.dto.EstadoDto;
import org.example.estaticos.dto.MunicipioDto;
import org.example.estaticos.dto.PaisDto;
import org.example.estaticos.dto.TipoDireccionDto;
import org.example.estaticos.model.ColoniaEty;
import org.example.estaticos.model.EstadoEty;
import org.example.estaticos.model.MunicipioEty;
import org.example.estaticos.model.PaisEty;
import org.example.estaticos.model.TipoDireccionEty;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.CDI)
public interface CatalogoGeograficoMapper {

    PaisDto toDto(PaisEty pais);

    List<PaisDto> paisesToDto(List<PaisEty> paises);

    @Mapping(target = "pais", source = "pais.nombre")
    EstadoDto toDto(EstadoEty estado);

    List<EstadoDto> estadosToDto(List<EstadoEty> estados);

    @Mapping(target = "estado", source = "estado.nombre")
    MunicipioDto toDto(MunicipioEty municipio);

    List<MunicipioDto> municipiosToDto(List<MunicipioEty> municipios);

    @Mapping(target = "municipio", source = "municipio.nombre")
    ColoniaDto toDto(ColoniaEty colonia);

    List<ColoniaDto> coloniasToDto(List<ColoniaEty> colonias);

    TipoDireccionDto toDto(TipoDireccionEty tipo);

    List<TipoDireccionDto> tiposToDto(List<TipoDireccionEty> tipos);
}
