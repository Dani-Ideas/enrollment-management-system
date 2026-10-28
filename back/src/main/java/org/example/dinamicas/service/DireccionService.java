package org.example.dinamicas.service;

import org.example.dinamicas.dto.DireccionDto;

import java.util.List;

public interface DireccionService {

    List<DireccionDto> listarPorPersona(Long personaId);
}
