package org.example.dinamicas.mapper.dinamica;

import org.example.dinamicas.dto.dinamica.DireccionDto;
import org.example.dinamicas.dto.dinamica.PersonaDto;
import org.example.dinamicas.dinamica.DireccionEty;
import org.example.dinamicas.dinamica.PersonaEty;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.CDI)
public interface PersonaMapper {

    PersonaDto toDto(PersonaEty persona);

    List<PersonaDto> personasToDto(List<PersonaEty> personas);

    @Mapping(target = "personaId", source = "id.personaId")
    @Mapping(target = "coloniaId", source = "id.coloniaId")
    @Mapping(target = "tipoId", source = "id.tipoId")
    @Mapping(target = "tipo", source = "tipo.descripcion")
    @Mapping(target = "colonia", source = "colonia.nombre")
    @Mapping(target = "municipio", source = "colonia.municipio.nombre")
    @Mapping(target = "estado", source = "colonia.municipio.estado.nombre")
    @Mapping(target = "pais", source = "colonia.municipio.estado.pais.nombre")
    DireccionDto toDto(DireccionEty direccion);

    List<DireccionDto> direccionesToDto(List<DireccionEty> direcciones);
}
