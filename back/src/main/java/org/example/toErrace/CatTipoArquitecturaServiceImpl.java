package org.example.toErrace;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;

import java.util.List;

@Stateless
public class CatTipoArquitecturaServiceImpl implements CatTipoArquitecturaService {

    @Inject
    private CatTipoArquitecturaRepository catTipoArquitecturaRepository;

    @Inject
    private CatTipoArquitecturaMapper catTipoArquitecturaMapper;

    @Override
    public List<CatTipoArquitecturaDto> listar() {
        return catTipoArquitecturaRepository.findAll()
                .map(catTipoArquitecturaMapper::toDto)
                .toList();
    }

    @Override
    public CatTipoArquitecturaDto buscarPorId(Integer id) {
        return catTipoArquitecturaRepository.findById(id)
                .map(catTipoArquitecturaMapper::toDto)
                .orElse(null);
    }
}
