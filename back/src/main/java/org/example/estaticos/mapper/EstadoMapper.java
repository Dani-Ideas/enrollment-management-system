package org.example.estaticos.mapper;

import org.example.comun.RequestResponseMapper;
import org.example.estaticos.dto.EstadoDto;
import org.example.estaticos.dto.EstadoRequestDto;
import org.example.estaticos.model.EstadoEty;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.CDI,
        uses = PaisMapper.class)
public interface EstadoMapper extends RequestResponseMapper<EstadoEty, EstadoRequestDto, EstadoDto> {

    @Override
    @Mapping(target = "pais", source = "pais.nombre")
    EstadoDto toDto(EstadoEty estado);

    @Override
    @Mapping(target = "pais", source = "paisId")
    EstadoEty toEntity(EstadoRequestDto dto);

    // Referencia por id (stub con solo el id) para resolver FKs en toEntity() de los
    // mappers hijos -- una interfaz no puede inyectar el Repository.
    default EstadoEty desdeId(Long id) {
        if (id == null) {
            return null;
        }
        EstadoEty estado = new EstadoEty();
        estado.setId(id);
        return estado;
    }
}
