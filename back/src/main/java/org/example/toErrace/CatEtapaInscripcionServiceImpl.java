package org.example.toErrace;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;

import java.util.List;

@Stateless
public class CatEtapaInscripcionServiceImpl implements CatEtapaInscripcionService {

    @Inject
    private CatEtapaInscripcionRepository catEtapaInscripcionRepository;

    @Inject
    private CatEtapaInscripcionMapper catEtapaInscripcionMapper;

    @Override
    public List<CatEtapaInscripcionDto> listar() {
        return catEtapaInscripcionRepository.findAll()
                .map(catEtapaInscripcionMapper::toDto)
                .toList();
    }

    @Override
    public CatEtapaInscripcionDto buscarPorId(Integer id) {
        return catEtapaInscripcionRepository.findById(id)
                .map(catEtapaInscripcionMapper::toDto)
                .orElse(null);
    }
}
