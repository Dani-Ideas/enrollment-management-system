package org.example.lib;

import org.example.dto.InscripcionDto;
import org.example.dto.InscripcionRequestDto;

import java.util.List;

public interface InscripcionService {

    List<InscripcionDto> listar();

    InscripcionDto buscarPorId(Long id);

    InscripcionDto crear(InscripcionRequestDto dto);

    InscripcionDto actualizar(Long id, InscripcionRequestDto dto);
}
