package org.example.mapper;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import javax.annotation.processing.Generated;
import org.example.dto.ClaseDto;
import org.example.dto.MateriaDto;
import org.example.dto.ProfesorDto;
import org.example.model.Clase;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-09-15T19:41:21-0600",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.12.1 (Arch Linux)"
)
@ApplicationScoped
public class ClaseMapperImpl implements ClaseMapper {

    @Inject
    private MateriaMapper materiaMapper;
    @Inject
    private ProfesorMapper profesorMapper;

    @Override
    public ClaseDto toDto(Clase clase) {
        if ( clase == null ) {
            return null;
        }

        Long id = null;
        MateriaDto materia = null;
        ProfesorDto profesor = null;

        id = clase.getId();
        materia = materiaMapper.toDto( clase.getMateria() );
        profesor = profesorMapper.toDto( clase.getProfesor() );

        int cuposDisponibles = 0;

        ClaseDto claseDto = new ClaseDto( id, materia, profesor, cuposDisponibles );

        return claseDto;
    }
}
