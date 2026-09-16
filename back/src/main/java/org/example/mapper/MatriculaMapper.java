package org.example.mapper;

import org.example.dto.MatriculaDto;
import org.example.model.Matricula;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

// Sin toEntity(MatriculaRequestDto): matricular a un estudiante pasa por MatriculaBuilder,
// con el Estudiante y la Clase reales ya validados por MatriculaServiceImpl (cupo,
// duplicados, misma carrera) -- mismo motivo que ClaseMapper.
@Mapper(componentModel = MappingConstants.ComponentModel.CDI, uses = ClaseMapper.class)
public interface MatriculaMapper {

    @Mapping(target = "estudianteId", source = "estudiante.id")
    @Mapping(target = "estudianteUsername", source = "estudiante.username")
    MatriculaDto toDto(Matricula matricula);
}
