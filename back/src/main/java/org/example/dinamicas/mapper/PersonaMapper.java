package org.example.dinamicas.mapper;

import org.example.comun.RequestResponseMapper;
import org.example.dinamicas.dinamica.PersonaEty;
import org.example.dinamicas.dto.PersonaDto;
import org.example.dinamicas.dto.PersonaRequestDto;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.CDI)
public interface PersonaMapper extends RequestResponseMapper<PersonaEty, PersonaRequestDto, PersonaDto> {

    @Override
    PersonaDto toDto(PersonaEty persona);

    @Override
    PersonaEty toEntity(PersonaRequestDto dto);

    // Referencia por id (stub con solo el id) para resolver la FK en DireccionMapper.
    default PersonaEty desdeId(Long id) {
        if (id == null) {
            return null;
        }
        PersonaEty persona = new PersonaEty();
        persona.setId(id);
        return persona;
    }
}
