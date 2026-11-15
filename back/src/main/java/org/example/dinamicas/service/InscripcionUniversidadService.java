package org.example.dinamicas.service;

import org.example.dinamicas.dto.InscripcionUniversidadConDiplomaDto;
import org.example.dinamicas.dto.InscripcionUniversidadConDiplomaRequestDto;
import org.example.dinamicas.dto.InscripcionUniversidadDto;

import java.util.List;

public interface InscripcionUniversidadService {
    List<InscripcionUniversidadDto> listar();
    InscripcionUniversidadDto buscarPorId(Long id);
    InscripcionUniversidadConDiplomaDto buscarConDiploma(Long id);
    InscripcionUniversidadConDiplomaDto crear(InscripcionUniversidadConDiplomaRequestDto dto);
    InscripcionUniversidadConDiplomaDto actualizar(Long id, InscripcionUniversidadConDiplomaRequestDto dto);
}
