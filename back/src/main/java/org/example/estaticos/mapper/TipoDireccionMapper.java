package org.example.estaticos.mapper;

import jakarta.inject.Inject;
import org.example.comun.ReferenciaInvalidaException;
import org.example.comun.RequestResponseMapper;
import org.example.estaticos.dto.TipoDireccionDto;
import org.example.estaticos.dto.TipoDireccionRequestDto;
import org.example.estaticos.model.TipoDireccionEty;
import org.example.estaticos.repository.TipoDireccionRepository;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

// Clase abstracta (no interfaz) para poder inyectar el Repository: desdeId() resuelve la FK
// contra la base, igual que MiniFormEstMapper, y un id inexistente responde 422.
@Mapper(componentModel = MappingConstants.ComponentModel.CDI)
public abstract class TipoDireccionMapper implements RequestResponseMapper<TipoDireccionEty, TipoDireccionRequestDto, TipoDireccionDto> {

    @Inject
    private TipoDireccionRepository tipoDireccionRepository;

    @Override
    public abstract TipoDireccionDto toDto(TipoDireccionEty tipoDireccion);

    @Override
    public abstract TipoDireccionEty toEntity(TipoDireccionRequestDto dto);

    public TipoDireccionEty desdeId(Long id) {
        if (id == null) {
            return null;
        }
        return tipoDireccionRepository.findById(id)
                .orElseThrow(() -> new ReferenciaInvalidaException("No existe el tipo de dirección " + id));
    }
}
