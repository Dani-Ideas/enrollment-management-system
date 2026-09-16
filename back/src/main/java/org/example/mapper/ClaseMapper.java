package org.example.mapper;

import org.example.dto.ClaseDto;
import org.example.model.Clase;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

// Sin toEntity(ClaseRequestDto): crear una Clase pasa por ClaseBuilder, que necesita la
// Materia y el Profesor COMPLETOS (para validar habilitacion y el limite de 3 clases) --
// un mapeo estructural por id no alcanza para eso. Ver ClaseServiceImpl.crear().
@Mapper(componentModel = MappingConstants.ComponentModel.CDI, uses = {MateriaMapper.class, ProfesorMapper.class})
public interface ClaseMapper {

    // cuposDisponibles no es un campo de Clase -- requiere contar Matricula, algo que este
    // Mapper no puede ver. Se ignora aqui; ClaseServiceImpl lo completa despues de llamar a
    // toDto(), reconstruyendo el record con el valor real.
    @Mapping(target = "cuposDisponibles", ignore = true)
    ClaseDto toDto(Clase clase);
}
