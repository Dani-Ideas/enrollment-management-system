package org.example.estaticos.mapper;

import jakarta.inject.Inject;
import org.example.comun.ReferenciaInvalidaException;
import org.example.comun.RequestResponseMapper;
import org.example.estaticos.dto.PaisDto;
import org.example.estaticos.dto.PaisRequestDto;
import org.example.estaticos.model.PaisEty;
import org.example.estaticos.repository.PaisRepository;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

// Clase abstracta (no interfaz) para poder inyectar el Repository: desdeId() resuelve la FK
// contra la base, igual que MiniFormEstMapper, y un id inexistente responde 422.
@Mapper(componentModel = MappingConstants.ComponentModel.CDI)
public abstract class PaisMapper implements RequestResponseMapper<PaisEty, PaisRequestDto, PaisDto> {

    @Inject
    private PaisRepository paisRepository;

    @Override
    public abstract PaisDto toDto(PaisEty pais);

    @Override
    public abstract PaisEty toEntity(PaisRequestDto dto);

    public PaisEty desdeId(Long id) {
        if (id == null) {
            return null;
        }
        return paisRepository.findById(id)
                .orElseThrow(() -> new ReferenciaInvalidaException("No existe el país " + id));
    }
}
