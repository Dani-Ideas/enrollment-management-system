package org.example.estaticos.mapper;

import jakarta.inject.Inject;
import org.example.comun.ReferenciaInvalidaException;
import org.example.comun.RequestResponseMapper;
import org.example.estaticos.dto.MunicipioDto;
import org.example.estaticos.dto.MunicipioRequestDto;
import org.example.estaticos.model.MunicipioEty;
import org.example.estaticos.repository.MunicipioRepository;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

// Clase abstracta (no interfaz) para poder inyectar el Repository: desdeId() resuelve la FK
// contra la base, igual que MiniFormEstMapper, y un id inexistente responde 422.
@Mapper(componentModel = MappingConstants.ComponentModel.CDI,
        uses = EstadoMapper.class)
public abstract class MunicipioMapper implements RequestResponseMapper<MunicipioEty, MunicipioRequestDto, MunicipioDto> {

    @Inject
    private MunicipioRepository municipioRepository;

    @Override
    @Mapping(target = "estado", source = "estado.nombre")
    public abstract MunicipioDto toDto(MunicipioEty municipio);

    @Override
    @Mapping(target = "estado", source = "estadoId")
    public abstract MunicipioEty toEntity(MunicipioRequestDto dto);

    public MunicipioEty desdeId(Long id) {
        if (id == null) {
            return null;
        }
        return municipioRepository.findById(id)
                .orElseThrow(() -> new ReferenciaInvalidaException("No existe el municipio " + id));
    }
}
