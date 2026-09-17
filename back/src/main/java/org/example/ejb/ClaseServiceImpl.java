package org.example.ejb;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import org.example.builder.ClaseBuilder;
import org.example.dto.ClaseDto;
import org.example.dto.ClaseRequestDto;
import org.example.lib.ClaseRepository;
import org.example.lib.ClaseService;
import org.example.lib.MateriaRepository;
import org.example.lib.MatriculaRepository;
import org.example.lib.ProfesorRepository;
import org.example.lib.ReglaDeNegocioException;
import org.example.mapper.ClaseMapper;
import org.example.model.Clase;
import org.example.model.EstadoMatricula;
import org.example.model.Materia;
import org.example.model.Profesor;

import java.util.List;
import java.util.stream.Collectors;

@Stateless
public class ClaseServiceImpl implements ClaseService {

    private static final int CUPO_MAXIMO = 3;

    @Inject
    private ClaseRepository claseRepository;

    @Inject
    private MateriaRepository materiaRepository;

    @Inject
    private ProfesorRepository profesorRepository;

    // Necesita el repositorio de OTRA entidad para contar cupos ocupados -- logica de
    // negocio, pertenece aqui, no al Repository (mismo criterio que
    // FacturaWriteServiceImpl.crear() en HelloJakarta-variante, que inyecta
    // ProductoRepository por la misma razon).
    @Inject
    private MatriculaRepository matriculaRepository;

    @Inject
    private ClaseMapper claseMapper;

    @Override
    public List<ClaseDto> listar() {
        return claseRepository.findAll()
                .map(this::toDtoConCupos)
                .collect(Collectors.toList());
    }

    @Override
    public ClaseDto buscarPorId(Long id) {
        return claseRepository.findById(id).map(this::toDtoConCupos).orElse(null);
    }

    @Override
    public List<ClaseDto> listarPorMateria(Long materiaId) {
        return claseRepository.findAll()
                .filter(c -> c.getMateria().getId().equals(materiaId))
                .map(this::toDtoConCupos)
                .collect(Collectors.toList());
    }

    @Override
    public ClaseDto crear(ClaseRequestDto dto) {
        Materia materia = materiaRepository.findById(dto.materiaId())
                .orElseThrow(() -> new ReglaDeNegocioException("No existe la materia " + dto.materiaId()));
        Profesor profesor = profesorRepository.findById(dto.profesorId())
                .orElseThrow(() -> new ReglaDeNegocioException("No existe el profesor " + dto.profesorId()));

        // El Builder necesita saber cuantas clases tiene YA el profesor para validar el
        // limite de 3 -- se buscan aqui (el Builder no conoce ningun Repository).
        List<Clase> clasesDelProfesor = claseRepository.findAll()
                .filter(c -> c.getProfesor().getId().equals(profesor.getId()))
                .collect(Collectors.toList());

        Clase clase = new ClaseBuilder()
                .materia(materia)
                .profesor(profesor)
                .clasesActualesDelProfesor(clasesDelProfesor)
                .build();

        return toDtoConCupos(claseRepository.insert(clase));
    }

    // ClaseMapper.toDto() deja "cuposDisponibles" en 0 (no puede contarlo -- ver
    // ClaseMapper) -- se reconstruye el record aqui con el valor real, contando matriculas
    // EN_CURSO de esta clase.
    private ClaseDto toDtoConCupos(Clase clase) {
        ClaseDto base = claseMapper.toDto(clase);
        long ocupados = matriculaRepository.findAll()
                .filter(m -> m.getClase().getId().equals(clase.getId()) && m.getEstado() == EstadoMatricula.EN_CURSO)
                .count();
        return new ClaseDto(base.id(), base.materia(), base.profesor(), (int) (CUPO_MAXIMO - ocupados));
    }
}
