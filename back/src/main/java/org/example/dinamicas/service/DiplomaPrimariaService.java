package org.example.dinamicas.service;

import org.example.dinamicas.dto.DiplomaPrimariaDto;
import org.example.dinamicas.dto.DiplomaPrimariaRequestDto;

import java.util.List;

public interface DiplomaPrimariaService {
    List<DiplomaPrimariaDto> listar();
    DiplomaPrimariaDto buscarPorId(Long id);
    DiplomaPrimariaDto crear(DiplomaPrimariaRequestDto dto);
    DiplomaPrimariaDto actualizar(Long id, DiplomaPrimariaRequestDto dto);
}
