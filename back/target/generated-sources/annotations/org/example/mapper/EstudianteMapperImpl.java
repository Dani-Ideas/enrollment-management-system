package org.example.mapper;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import javax.annotation.processing.Generated;
import org.example.dto.EstudianteDto;
import org.example.dto.EstudianteRequestDto;
import org.example.model.Carrera;
import org.example.model.Estudiante;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-09-22T10:30:47-0600",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.12.1 (Arch Linux)"
)
@ApplicationScoped
public class EstudianteMapperImpl implements EstudianteMapper {

    @Inject
    private CarreraMapper carreraMapper;

    @Override
    public EstudianteDto toDto(Estudiante estudiante) {
        if ( estudiante == null ) {
            return null;
        }

        Long carreraId = null;
        String carreraNombre = null;
        Long id = null;
        String username = null;

        carreraId = estudianteCarreraId( estudiante );
        carreraNombre = estudianteCarreraNombre( estudiante );
        id = estudiante.getId();
        username = estudiante.getUsername();

        EstudianteDto estudianteDto = new EstudianteDto( id, username, carreraId, carreraNombre );

        return estudianteDto;
    }

    @Override
    public Estudiante toEntity(EstudianteRequestDto dto) {
        if ( dto == null ) {
            return null;
        }

        Estudiante estudiante = new Estudiante();

        estudiante.setCarrera( carreraMapper.desdeId( dto.carreraId() ) );
        estudiante.setUsername( dto.username() );

        return estudiante;
    }

    private Long estudianteCarreraId(Estudiante estudiante) {
        Carrera carrera = estudiante.getCarrera();
        if ( carrera == null ) {
            return null;
        }
        return carrera.getId();
    }

    private String estudianteCarreraNombre(Estudiante estudiante) {
        Carrera carrera = estudiante.getCarrera();
        if ( carrera == null ) {
            return null;
        }
        return carrera.getNombre();
    }
}
