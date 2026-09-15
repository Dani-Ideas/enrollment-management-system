package org.example.lib;

import org.example.dto.MatriculaDto;
import org.example.dto.MatriculaRequestDto;

import java.util.List;

// El "corazon" del sistema: la seccion donde el estudiante se matricula en una clase.
public interface MatriculaService {

    MatriculaDto matricular(MatriculaRequestDto dto);

    MatriculaDto completar(Long id);

    List<MatriculaDto> listarPorClase(Long claseId);
}
