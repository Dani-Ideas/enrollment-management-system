package org.example.estaticos.mapper;

import org.example.comun.RequestResponseMapper;
import org.example.estaticos.dto.MunicipioDto;
import org.example.estaticos.dto.MunicipioRequestDto;
import org.example.estaticos.model.MunicipioEty;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.CDI,
        uses = EstadoMapper.class)
public interface MunicipioMapper extends RequestResponseMapper<MunicipioEty, MunicipioRequestDto, MunicipioDto> {

    @Override
    @Mapping(target = "estado", source = "estado.nombre")
    MunicipioDto toDto(MunicipioEty municipio);

    @Override
    @Mapping(target = "estado", source = "estadoId")
    MunicipioEty toEntity(MunicipioRequestDto dto);

    // Referencia por id (stub con solo el id) para resolver FKs en toEntity() de los
    // mappers hijos -- una interfaz no puede inyectar el Repository.
    default MunicipioEty desdeId(Long id) {
        if (id == null) {
            return null;
        }
        MunicipioEty municipio = new MunicipioEty();
        municipio.setId(id);
        return municipio;
    }
}
