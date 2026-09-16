package org.example.mapper;

import org.example.dto.ProfesorDto;
import org.example.model.Profesor;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

// uses = MateriaMapper: para "habilitaciones" (List<Materia> -> List<MateriaDto>),
// MapStruct aplica MateriaMapper.toDto() a cada elemento automaticamente.
@Mapper(componentModel = MappingConstants.ComponentModel.CDI, uses = MateriaMapper.class)
public interface ProfesorMapper {

    @Mapping(target = "carreraId", source = "carrera.id")
    @Mapping(target = "carreraNombre", source = "carrera.nombre")
    ProfesorDto toDto(Profesor profesor);

    // Referencia por id -- ver CarreraMapper.desdeId. La usa ClaseServiceImpl.
    default Profesor desdeId(Long id) {
        if (id == null) {
            return null;
        }
        Profesor profesor = new Profesor();
        profesor.setId(id);
        return profesor;
    }
}
