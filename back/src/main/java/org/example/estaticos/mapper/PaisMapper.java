package org.example.estaticos.mapper;

import org.example.comun.RequestResponseMapper;
import org.example.estaticos.dto.PaisDto;
import org.example.estaticos.dto.PaisRequestDto;
import org.example.estaticos.model.PaisEty;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.CDI)
public interface PaisMapper extends RequestResponseMapper<PaisEty, PaisRequestDto, PaisDto> {

    @Override
    PaisDto toDto(PaisEty pais);

    @Override
    PaisEty toEntity(PaisRequestDto dto);

    // Referencia por id (stub con solo el id) para resolver FKs en toEntity() de los
    // mappers hijos -- una interfaz no puede inyectar el Repository.
    default PaisEty desdeId(Long id) {
        if (id == null) {
            return null;
        }
        PaisEty pais = new PaisEty();
        pais.setId(id);
        return pais;
    }
}
