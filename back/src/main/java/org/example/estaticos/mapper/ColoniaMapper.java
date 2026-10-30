package org.example.estaticos.mapper;

import jakarta.inject.Inject;
import org.example.comun.ReferenciaInvalidaException;
import org.example.comun.RequestResponseMapper;
import org.example.estaticos.dto.ColoniaDto;
import org.example.estaticos.dto.ColoniaRequestDto;
import org.example.estaticos.model.ColoniaEty;
import org.example.estaticos.repository.ColoniaRepository;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

// Clase abstracta (no interfaz) para poder inyectar el Repository: desdeId() resuelve la FK
// contra la base, igual que MiniFormEstMapper, y un id inexistente responde 422.
@Mapper(componentModel = MappingConstants.ComponentModel.CDI,
        uses = MunicipioMapper.class)
public abstract class ColoniaMapper implements RequestResponseMapper<ColoniaEty, ColoniaRequestDto, ColoniaDto> {

    @Inject
    private ColoniaRepository coloniaRepository;

    @Override
    @Mapping(target = "municipio", source = "municipio.nombre")
    public abstract ColoniaDto toDto(ColoniaEty colonia);

    @Override
    @Mapping(target = "municipio", source = "municipioId")
    public abstract ColoniaEty toEntity(ColoniaRequestDto dto);

    public ColoniaEty desdeId(Long id) {
        if (id == null) {
            return null;
        }
        return coloniaRepository.findById(id)
                .orElseThrow(() -> new ReferenciaInvalidaException("No existe la colonia " + id));
    }
}
