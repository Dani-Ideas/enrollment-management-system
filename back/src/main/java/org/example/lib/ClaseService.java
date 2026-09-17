package org.example.lib;

import org.example.dto.ClaseDto;
import org.example.dto.ClaseRequestDto;

import java.util.List;

public interface ClaseService {

    List<ClaseDto> listar();

    ClaseDto buscarPorId(Long id);

    // Para el flujo de inscripcion: dado que el estudiante eligio una Materia, mostrar las
    // Clase(s) disponibles para esa materia (con su profesor y cupos) antes de matricularse.
    List<ClaseDto> listarPorMateria(Long materiaId);

    // Operacion "administrativa" (asignar profesor a materia) -- fuera del foco "estudiante
    // se matricula", pero necesaria para que el sistema sea testeable de punta a punta.
    ClaseDto crear(ClaseRequestDto dto);
}
