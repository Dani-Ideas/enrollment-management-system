package org.example.ejb;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import org.example.builder.MatriculaBuilder;
import org.example.dto.MatriculaDto;
import org.example.dto.MatriculaRequestDto;
import org.example.lib.ClaseRepository;
import org.example.lib.EstudianteRepository;
import org.example.lib.MatriculaRepository;
import org.example.lib.MatriculaService;
import org.example.lib.ReglaDeNegocioException;
import org.example.mapper.MatriculaMapper;
import org.example.model.Clase;
import org.example.model.EstadoMatricula;
import org.example.model.Estudiante;
import org.example.model.Matricula;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

// El servicio de "la seccion donde el estudiante se matricula" -- el unico punto de
// escritura verdaderamente dinamico de todo el sistema (el resto es dato estatico sembrado
// en DatosIniciales, o administrativo via ClaseServiceImpl.crear()).
@Stateless
public class MatriculaServiceImpl implements MatriculaService {

    private static final int CUPO_MAXIMO = 3;

    @Inject
    private MatriculaRepository matriculaRepository;

    @Inject
    private EstudianteRepository estudianteRepository;

    @Inject
    private ClaseRepository claseRepository;

    @Inject
    private MatriculaMapper matriculaMapper;

    @Override
    public MatriculaDto matricular(MatriculaRequestDto dto) {
        Estudiante estudiante = estudianteRepository.findById(dto.estudianteId())
                .orElseThrow(() -> new ReglaDeNegocioException("No existe el estudiante " + dto.estudianteId()));
        Clase clase = claseRepository.findById(dto.claseId())
                .orElseThrow(() -> new ReglaDeNegocioException("No existe la clase " + dto.claseId()));

        // Regla: la materia de la clase debe pertenecer a la carrera del estudiante.
        if (!clase.getMateria().getCarrera().getId().equals(estudiante.getCarrera().getId())) {
            throw new ReglaDeNegocioException(
                    "La materia '" + clase.getMateria().getNombre() + "' no pertenece a la carrera del estudiante");
        }

        List<Matricula> matriculasActivasDeLaClase = matriculaRepository.findAll()
                .filter(m -> m.getClase().getId().equals(clase.getId()) && m.getEstado() == EstadoMatricula.EN_CURSO)
                .collect(Collectors.toList());

        // Regla: cupo maximo de 3 estudiantes por clase.
        if (matriculasActivasDeLaClase.size() >= CUPO_MAXIMO) {
            throw new ReglaDeNegocioException("La clase ya tiene el cupo maximo de " + CUPO_MAXIMO + " estudiantes");
        }

        // Regla: el estudiante no puede matricularse dos veces (activo) en la misma clase.
        boolean yaMatriculado = matriculasActivasDeLaClase.stream()
                .anyMatch(m -> m.getEstudiante().getId().equals(estudiante.getId()));
        if (yaMatriculado) {
            throw new ReglaDeNegocioException("El estudiante ya esta matriculado en esta clase");
        }

        // Las 3 reglas de arriba ya se validaron -- el Builder solo ensambla el objeto,
        // no vuelve a chequear nada (a diferencia de ClaseBuilder, que si valida, porque
        // esas dos reglas -- habilitacion y limite del profesor -- son inherentes a
        // "construir una Clase valida", mientras que estas son sobre el ESTADO actual del
        // sistema en el momento de la matricula, no sobre la forma del objeto).
        Matricula matricula = new MatriculaBuilder()
                .estudiante(estudiante)
                .clase(clase)
                .build();

        return matriculaMapper.toDto(matriculaRepository.insert(matricula));
    }

    @Override
    public MatriculaDto completar(Long id) {
        return matriculaRepository.findById(id)
                .map(matricula -> {
                    matricula.setEstado(EstadoMatricula.COMPLETADA);
                    matricula.setFechaCompletada(LocalDate.now());
                    return matriculaMapper.toDto(matriculaRepository.update(matricula));
                })
                .orElse(null);
    }

    @Override
    public List<MatriculaDto> listarPorClase(Long claseId) {
        return matriculaRepository.findAll()
                .filter(m -> m.getClase().getId().equals(claseId))
                .map(matriculaMapper::toDto)
                .collect(Collectors.toList());
    }
}
