package org.example.ejb;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import org.example.dto.MateriaDto;
import org.example.lib.MateriaRepository;
import org.example.lib.MateriaService;
import org.example.mapper.MateriaMapper;

import java.util.List;
import java.util.stream.Collectors;

@Stateless
public class MateriaServiceImpl implements MateriaService {

    @Inject
    private MateriaRepository materiaRepository;

    @Inject
    private MateriaMapper materiaMapper;

    @Override
    public List<MateriaDto> listar() {
        return materiaRepository.findAll()
                .map(materiaMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public MateriaDto buscarPorId(Long id) {
        return materiaRepository.findById(id).map(materiaMapper::toDto).orElse(null);
    }

    @Override
    public List<MateriaDto> listarPorCarrera(Long carreraId) {
        return materiaRepository.findAll()
                .filter(m -> m.getCarrera().getId().equals(carreraId))
                .map(materiaMapper::toDto)
                .collect(Collectors.toList());
    }
}
