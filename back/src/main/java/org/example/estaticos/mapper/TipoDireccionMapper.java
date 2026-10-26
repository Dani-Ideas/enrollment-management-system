package org.example.estaticos.mapper;

import org.example.comun.RequestResponseMapper;
import org.example.estaticos.dto.TipoDireccionDto;
import org.example.estaticos.dto.TipoDireccionRequestDto;
import org.example.estaticos.model.TipoDireccionEty;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.CDI)
public interface TipoDireccionMapper extends RequestResponseMapper<TipoDireccionEty, TipoDireccionRequestDto, TipoDireccionDto> {

    @Override
    TipoDireccionDto toDto(TipoDireccionEty tipoDireccion);

    @Override
    TipoDireccionEty toEntity(TipoDireccionRequestDto dto);

    // Referencia por id (stub con solo el id) para resolver FKs en toEntity() de los
    // mappers hijos -- una interfaz no puede inyectar el Repository.
    default TipoDireccionEty desdeId(Long id) {
        if (id == null) {
            return null;
        }
        TipoDireccionEty tipoDireccion = new TipoDireccionEty();
        tipoDireccion.setId(id);
        return tipoDireccion;
    }
}
