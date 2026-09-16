package org.example.mapper;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.example.dto.MateriaDto;
import org.example.dto.ProfesorDto;
import org.example.model.Carrera;
import org.example.model.Materia;
import org.example.model.Profesor;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-09-16T12:31:13-0600",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.12.1 (Arch Linux)"
)
@ApplicationScoped
public class ProfesorMapperImpl implements ProfesorMapper {

    @Inject
    private MateriaMapper materiaMapper;

    @Override
    public ProfesorDto toDto(Profesor profesor) {
        if ( profesor == null ) {
            return null;
        }

        Long carreraId = null;
        String carreraNombre = null;
        Long id = null;
        String nombre = null;
        List<MateriaDto> habilitaciones = null;

        carreraId = profesorCarreraId( profesor );
        carreraNombre = profesorCarreraNombre( profesor );
        id = profesor.getId();
        nombre = profesor.getNombre();
        habilitaciones = materiaListToMateriaDtoList( profesor.getHabilitaciones() );

        ProfesorDto profesorDto = new ProfesorDto( id, nombre, carreraId, carreraNombre, habilitaciones );

        return profesorDto;
    }

    private Long profesorCarreraId(Profesor profesor) {
        Carrera carrera = profesor.getCarrera();
        if ( carrera == null ) {
            return null;
        }
        return carrera.getId();
    }

    private String profesorCarreraNombre(Profesor profesor) {
        Carrera carrera = profesor.getCarrera();
        if ( carrera == null ) {
            return null;
        }
        return carrera.getNombre();
    }

    protected List<MateriaDto> materiaListToMateriaDtoList(List<Materia> list) {
        if ( list == null ) {
            return null;
        }

        List<MateriaDto> list1 = new ArrayList<MateriaDto>( list.size() );
        for ( Materia materia : list ) {
            list1.add( materiaMapper.toDto( materia ) );
        }

        return list1;
    }
}
