package org.example.lib;

import org.example.dto.ClaseDto;
import org.example.dto.ClaseRequestDto;

import java.util.List;

public interface ClaseService {

    List<ClaseDto> listar();

    ClaseDto buscarPorId(Long id);

    // Operacion "administrativa" (asignar profesor a materia) -- fuera del foco "estudiante
    // se matricula", pero necesaria para que el sistema sea testeable de punta a punta.
    ClaseDto crear(ClaseRequestDto dto);
}
