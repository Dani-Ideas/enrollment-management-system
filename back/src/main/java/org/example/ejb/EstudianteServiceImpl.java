package org.example.ejb;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import org.example.dto.EstudianteDto;
import org.example.dto.EstudianteRequestDto;
import org.example.dto.LoginRequestDto;
import org.example.dto.MatriculaDto;
import org.example.lib.CarreraRepository;
import org.example.lib.EstudianteRepository;
import org.example.lib.EstudianteService;
import org.example.lib.MatriculaRepository;
import org.example.lib.PasswordHasher;
import org.example.lib.ReglaDeNegocioException;
import org.example.mapper.EstudianteMapper;
import org.example.mapper.MatriculaMapper;
import org.example.model.Carrera;
import org.example.model.EstadoMatricula;
import org.example.model.Estudiante;

import java.util.List;
import java.util.stream.Collectors;

@Stateless
public class EstudianteServiceImpl implements EstudianteService {

    @Inject
    private EstudianteRepository estudianteRepository;

    @Inject
    private CarreraRepository carreraRepository;

    @Inject
    private MatriculaRepository matriculaRepository;

    @Inject
    private EstudianteMapper estudianteMapper;

    @Inject
    private MatriculaMapper matriculaMapper;

    @Override
    public EstudianteDto crear(EstudianteRequestDto dto) {
        // Normalizado a minusculas ANTES de guardar -- asi la unicidad y el login despues
        // se resuelven con una comparacion exacta en la base (findByUsername), sin
        // necesitar equalsIgnoreCase ni traer toda la tabla a memoria.
        String usernameNormalizado = dto.username().toLowerCase();

        if (estudianteRepository.findByUsername(usernameNormalizado).isPresent()) {
            throw new ReglaDeNegocioException("El username '" + dto.username() + "' ya esta en uso");
        }

        // Se trae la Carrera REAL (no un stub por id, como hace EstudianteMapper.toEntity()
        // internamente) por dos razones: (1) valida que carreraId exista de verdad --antes
        // un id inventado hubiera reventado con una SQLIntegrityConstraintViolationException
        // cruda en vez de un 409 limpio-- y (2) el objeto recien insertado necesita
        // "carrera.nombre" ya poblado para que EstudianteMapper.toDto() arme
        // "carreraNombre" correcto en la respuesta (un stub con solo el id se queda con
        // nombre=null, no se autocompleta solo).
        Carrera carrera = carreraRepository.findById(dto.carreraId())
                .orElseThrow(() -> new ReglaDeNegocioException("No existe la carrera " + dto.carreraId()));

        Estudiante estudiante = estudianteMapper.toEntity(dto);
        estudiante.setUsername(usernameNormalizado);
        estudiante.setCarrera(carrera);
        // El Mapper ignora passwordHash a proposito (ver EstudianteMapper) -- se calcula
        // aqui, nunca se persiste ni se devuelve la contrasena en texto plano.
        estudiante.setPasswordHash(PasswordHasher.hash(dto.password()));

        return estudianteMapper.toDto(estudianteRepository.insert(estudiante));
    }

    @Override
    public EstudianteDto buscarPorId(Long id) {
        return estudianteRepository.findById(id).map(estudianteMapper::toDto).orElse(null);
    }

    @Override
    public EstudianteDto login(LoginRequestDto dto) {
        // SHA-256 sin salt (ver PasswordHasher) => es determinístico, el mismo password
        // siempre da el mismo hash -- por eso ".equals()" es correcto aca. Si algun dia se
        // migra a un algoritmo CON salt (bcrypt/argon2), esta comparacion directa dejaria
        // de servir y haria falta un metodo de verificacion propio del algoritmo elegido.
        String hashIngresado = PasswordHasher.hash(dto.password());
        return estudianteRepository.findByUsername(dto.username().toLowerCase())
                .filter(e -> e.getPasswordHash().equals(hashIngresado))
                .map(estudianteMapper::toDto)
                .orElse(null);
    }

    @Override
    public List<MatriculaDto> historial(Long id) {
        return matriculaRepository.findAll()
                .filter(m -> m.getEstudiante().getId().equals(id) && m.getEstado() == EstadoMatricula.COMPLETADA)
                .map(matriculaMapper::toDto)
                .collect(Collectors.toList());
    }
}
