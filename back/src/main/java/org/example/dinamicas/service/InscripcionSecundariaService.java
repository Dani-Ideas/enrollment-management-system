package org.example.dinamicas.service;

import org.example.dinamicas.dto.InscripcionSecundariaConDiplomaDto;
import org.example.dinamicas.dto.InscripcionSecundariaConDiplomaRequestDto;
import org.example.dinamicas.dto.InscripcionSecundariaDto;

import java.util.List;

public interface InscripcionSecundariaService {
    List<InscripcionSecundariaDto> listar();
    InscripcionSecundariaDto buscarPorId(Long id);
    InscripcionSecundariaConDiplomaDto buscarConDiploma(Long id);
    InscripcionSecundariaConDiplomaDto crear(InscripcionSecundariaConDiplomaRequestDto dto);
    InscripcionSecundariaConDiplomaDto actualizar(Long id, InscripcionSecundariaConDiplomaRequestDto dto);
}
