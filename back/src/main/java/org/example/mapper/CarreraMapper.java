package org.example.mapper;

import org.example.dto.CarreraDto;
import org.example.model.Carrera;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

// componentModel = CDI: la implementacion generada se registra como bean @ApplicationScoped,
// se inyecta con @Inject en los ServiceImpl -- nunca Mappers.getMapper()/INSTANCE.
@Mapper(componentModel = MappingConstants.ComponentModel.CDI)
public interface CarreraMapper {

    CarreraDto toDto(Carrera carrera);

    // Referencia por id: reconstruye un Carrera "stub" (solo id) para asignar la FK de
    // Estudiante.carrera sin cargar la entidad completa -- mismo patron que
    // ProductoMapper.desdeId en HelloJakarta-variante. Independiente de la forma de
    // CarreraDto, nunca se rompe si el DTO cambia de campos.
    default Carrera desdeId(Long id) {
        if (id == null) {
            return null;
        }
        Carrera carrera = new Carrera();
        carrera.setId(id);
        return carrera;
    }
}
