package org.example.mapper;

import org.example.dto.MateriaDto;
import org.example.model.Materia;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.CDI)
public interface MateriaMapper {

    @Mapping(target = "carreraId", source = "carrera.id")
    @Mapping(target = "carreraNombre", source = "carrera.nombre")
    MateriaDto toDto(Materia materia);
}
