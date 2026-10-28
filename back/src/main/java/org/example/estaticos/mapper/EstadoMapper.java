package org.example.estaticos.mapper;

import jakarta.inject.Inject;
import org.example.comun.ReferenciaInvalidaException;
import org.example.comun.RequestResponseMapper;
import org.example.estaticos.dto.EstadoDto;
import org.example.estaticos.dto.EstadoRequestDto;
import org.example.estaticos.model.EstadoEty;
import org.example.estaticos.repository.EstadoRepository;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

// Clase abstracta (no interfaz) para poder inyectar el Repository: desdeId() resuelve la FK
// contra la base, igual que MiniFormEstMapper, y un id inexistente responde 422.
@Mapper(componentModel = MappingConstants.ComponentModel.CDI,
        uses = PaisMapper.class)
public abstract class EstadoMapper implements RequestResponseMapper<EstadoEty, EstadoRequestDto, EstadoDto> {

    @Inject
    private EstadoRepository estadoRepository;

    @Override
    @Mapping(target = "pais", source = "pais.nombre")
    public abstract EstadoDto toDto(EstadoEty estado);

    @Override
    @Mapping(target = "pais", source = "paisId")
    public abstract EstadoEty toEntity(EstadoRequestDto dto);

    public EstadoEty desdeId(Long id) {
        if (id == null) {
            return null;
        }
        return estadoRepository.findById(id)
                .orElseThrow(() -> new ReferenciaInvalidaException("No existe el estado " + id));
    }
}
