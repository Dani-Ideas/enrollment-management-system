package org.example.ejb;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import org.example.dto.EstudianteDto;
import org.example.dto.EstudianteRequestDto;
import org.example.dto.MatriculaDto;
import org.example.lib.EstudianteRepository;
import org.example.lib.EstudianteService;
import org.example.lib.MatriculaRepository;
import org.example.lib.PasswordHasher;
import org.example.lib.ReglaDeNegocioException;
import org.example.mapper.EstudianteMapper;
import org.example.mapper.MatriculaMapper;
import org.example.model.EstadoMatricula;
import org.example.model.Estudiante;

import java.util.List;
import java.util.stream.Collectors;

@Stateless
public class EstudianteServiceImpl implements EstudianteService {

    @Inject
    private EstudianteRepository estudianteRepository;

    @Inject
    private MatriculaRepository matriculaRepository;

    @Inject
    private EstudianteMapper estudianteMapper;

    @Inject
    private MatriculaMapper matriculaMapper;

    @Override
    public EstudianteDto crear(EstudianteRequestDto dto) {
        boolean usernameTomado = estudianteRepository.findAll()
                .anyMatch(e -> e.getUsername().equalsIgnoreCase(dto.username()));
        if (usernameTomado) {
            throw new ReglaDeNegocioException("El username '" + dto.username() + "' ya esta en uso");
        }

        Estudiante estudiante = estudianteMapper.toEntity(dto);
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
    public List<MatriculaDto> historial(Long id) {
        return matriculaRepository.findAll()
                .filter(m -> m.getEstudiante().getId().equals(id) && m.getEstado() == EstadoMatricula.COMPLETADA)
                .map(matriculaMapper::toDto)
                .collect(Collectors.toList());
    }
}
