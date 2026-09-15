package org.example.ejb;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import org.example.dto.ProfesorDto;
import org.example.lib.ProfesorRepository;
import org.example.lib.ProfesorService;
import org.example.mapper.ProfesorMapper;

import java.util.List;
import java.util.stream.Collectors;

@Stateless
public class ProfesorServiceImpl implements ProfesorService {

    @Inject
    private ProfesorRepository profesorRepository;

    @Inject
    private ProfesorMapper profesorMapper;

    @Override
    public List<ProfesorDto> listar() {
        return profesorRepository.findAll()
                .map(profesorMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ProfesorDto buscarPorId(Long id) {
        return profesorRepository.findById(id).map(profesorMapper::toDto).orElse(null);
    }
}
