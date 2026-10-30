package org.example.dinamicas.ejb;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import org.example.dinamicas.dto.DireccionDto;
import org.example.dinamicas.repository.DireccionRepository;
import org.example.dinamicas.service.DireccionService;
import org.example.dinamicas.mapper.DireccionMapper;

import java.util.List;

@Stateless
public class DireccionServiceImpl implements DireccionService {

    @Inject
    private DireccionRepository direccionRepository;

    @Inject
    private DireccionMapper direccionMapper;

    @Override
    public List<DireccionDto> listarPorPersona(Long personaId) {
        return direccionMapper.toDto(direccionRepository.porPersona(personaId));
    }
}
