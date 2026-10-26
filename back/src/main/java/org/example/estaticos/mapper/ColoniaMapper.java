package org.example.estaticos.mapper;

import org.example.comun.RequestResponseMapper;
import org.example.estaticos.dto.ColoniaDto;
import org.example.estaticos.dto.ColoniaRequestDto;
import org.example.estaticos.model.ColoniaEty;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.CDI,
        uses = MunicipioMapper.class)
public interface ColoniaMapper extends RequestResponseMapper<ColoniaEty, ColoniaRequestDto, ColoniaDto> {

    @Override
    @Mapping(target = "municipio", source = "municipio.nombre")
    ColoniaDto toDto(ColoniaEty colonia);

    @Override
    @Mapping(target = "municipio", source = "municipioId")
    ColoniaEty toEntity(ColoniaRequestDto dto);

    // Referencia por id (stub con solo el id) para resolver FKs en toEntity() de los
    // mappers hijos -- una interfaz no puede inyectar el Repository.
    default ColoniaEty desdeId(Long id) {
        if (id == null) {
            return null;
        }
        ColoniaEty colonia = new ColoniaEty();
        colonia.setId(id);
        return colonia;
    }
}
