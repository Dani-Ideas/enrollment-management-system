package org.example.mapper;

import org.example.dto.EstudianteDto;
import org.example.dto.EstudianteRequestDto;
import org.example.model.Estudiante;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

// A diferencia de Clase/Matricula, crear un Estudiante NO tiene reglas cruzadas con otras
// entidades (la unica regla -- username unico -- es una consulta simple que hace el
// Service, no necesita la entidad Carrera completa) -- por eso aqui SI tiene sentido que el
// Mapper haga tambien el toEntity(), sin pasar por un Builder.
@Mapper(componentModel = MappingConstants.ComponentModel.CDI, uses = CarreraMapper.class)
public interface EstudianteMapper extends RequestResponseMapper<Estudiante, EstudianteRequestDto, EstudianteDto> {

    @Override
    @Mapping(target = "carreraId", source = "carrera.id")
    @Mapping(target = "carreraNombre", source = "carrera.nombre")
    EstudianteDto toDto(Estudiante estudiante);

    // id: lo genera la base. passwordHash: se ignora aqui a proposito -- el Service lo
    // calcula (PasswordHasher.hash(dto.password())) despues de este mapeo; el Mapper nunca
    // toca contrasenas. carreraId -> carrera: usa CarreraMapper.desdeId (unica firma
    // Long -> Carrera en ese Mapper, MapStruct la resuelve sola).
    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "carrera", source = "carreraId")
    Estudiante toEntity(EstudianteRequestDto dto);
}
