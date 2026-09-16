package org.example.mapper;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.time.LocalDate;
import javax.annotation.processing.Generated;
import org.example.dto.ClaseDto;
import org.example.dto.MatriculaDto;
import org.example.model.EstadoMatricula;
import org.example.model.Estudiante;
import org.example.model.Matricula;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-09-16T12:31:13-0600",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.12.1 (Arch Linux)"
)
@ApplicationScoped
public class MatriculaMapperImpl implements MatriculaMapper {

    @Inject
    private ClaseMapper claseMapper;

    @Override
    public MatriculaDto toDto(Matricula matricula) {
        if ( matricula == null ) {
            return null;
        }

        Long estudianteId = null;
        String estudianteUsername = null;
        Long id = null;
        ClaseDto clase = null;
        EstadoMatricula estado = null;
        LocalDate fechaInscripcion = null;
        LocalDate fechaCompletada = null;

        estudianteId = matriculaEstudianteId( matricula );
        estudianteUsername = matriculaEstudianteUsername( matricula );
        id = matricula.getId();
        clase = claseMapper.toDto( matricula.getClase() );
        estado = matricula.getEstado();
        fechaInscripcion = matricula.getFechaInscripcion();
        fechaCompletada = matricula.getFechaCompletada();

        MatriculaDto matriculaDto = new MatriculaDto( id, estudianteId, estudianteUsername, clase, estado, fechaInscripcion, fechaCompletada );

        return matriculaDto;
    }

    private Long matriculaEstudianteId(Matricula matricula) {
        Estudiante estudiante = matricula.getEstudiante();
        if ( estudiante == null ) {
            return null;
        }
        return estudiante.getId();
    }

    private String matriculaEstudianteUsername(Matricula matricula) {
        Estudiante estudiante = matricula.getEstudiante();
        if ( estudiante == null ) {
            return null;
        }
        return estudiante.getUsername();
    }
}
