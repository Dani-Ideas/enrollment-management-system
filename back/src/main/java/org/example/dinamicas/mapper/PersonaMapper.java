package org.example.dinamicas.mapper;

import jakarta.inject.Inject;
import org.example.comun.ReferenciaInvalidaException;
import org.example.comun.RequestResponseMapper;
import org.example.dinamicas.dto.PersonaDto;
import org.example.dinamicas.dto.PersonaRequestDto;
import org.example.dinamicas.model.PersonaEty;
import org.example.dinamicas.repository.PersonaRepository;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

// Clase abstracta (no interfaz) para poder inyectar el Repository: desdeId() resuelve la FK
// contra la base, igual que MiniFormEstMapper, y un id inexistente responde 422.
@Mapper(componentModel = MappingConstants.ComponentModel.CDI)
public abstract class PersonaMapper implements RequestResponseMapper<PersonaEty, PersonaRequestDto, PersonaDto> {

    @Inject
    private PersonaRepository personaRepository;

    @Override
    public abstract PersonaDto toDto(PersonaEty persona);

    @Override
    public abstract PersonaEty toEntity(PersonaRequestDto dto);

    public PersonaEty desdeId(Long id) {
        if (id == null) {
            return null;
        }
        return personaRepository.findById(id)
                .orElseThrow(() -> new ReferenciaInvalidaException("No existe la persona " + id));
    }
}
