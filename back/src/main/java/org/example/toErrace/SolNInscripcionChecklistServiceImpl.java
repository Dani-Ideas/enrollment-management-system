package org.example.toErrace;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;

import java.util.List;

@Stateless
public class SolNInscripcionChecklistServiceImpl implements SolNInscripcionChecklistService {

    @Inject
    private SolNInscripcionChecklistRepository solNInscripcionChecklistRepository;

    @Inject
    private SolNInscripcionChecklistMapper solNInscripcionChecklistMapper;

    @Override
    public List<SolNInscripcionChecklistDto> listar() {
        return solNInscripcionChecklistRepository.findAll()
                .map(solNInscripcionChecklistMapper::toDto)
                .toList();
    }

    @Override
    public SolNInscripcionChecklistDto buscarPorId(Integer id) {
        return solNInscripcionChecklistRepository.findById(id)
                .map(solNInscripcionChecklistMapper::toDto)
                .orElse(null);
    }
}
