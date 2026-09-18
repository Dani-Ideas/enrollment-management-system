package org.example.mapper;

import jakarta.enterprise.context.ApplicationScoped;
import javax.annotation.processing.Generated;
import org.example.dto.MateriaDto;
import org.example.model.Carrera;
import org.example.model.Materia;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-09-18T02:50:54-0600",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.12.1 (Arch Linux)"
)
@ApplicationScoped
public class MateriaMapperImpl implements MateriaMapper {

    @Override
    public MateriaDto toDto(Materia materia) {
        if ( materia == null ) {
            return null;
        }

        Long carreraId = null;
        String carreraNombre = null;
        Long id = null;
        String nombre = null;
        Integer anio = null;

        carreraId = materiaCarreraId( materia );
        carreraNombre = materiaCarreraNombre( materia );
        id = materia.getId();
        nombre = materia.getNombre();
        anio = materia.getAnio();

        MateriaDto materiaDto = new MateriaDto( id, nombre, anio, carreraId, carreraNombre );

        return materiaDto;
    }

    private Long materiaCarreraId(Materia materia) {
        Carrera carrera = materia.getCarrera();
        if ( carrera == null ) {
            return null;
        }
        return carrera.getId();
    }

    private String materiaCarreraNombre(Materia materia) {
        Carrera carrera = materia.getCarrera();
        if ( carrera == null ) {
            return null;
        }
        return carrera.getNombre();
    }
}
