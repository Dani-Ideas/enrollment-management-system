package org.example.lib;

import org.example.dto.EstudianteDto;
import org.example.dto.EstudianteRequestDto;
import org.example.dto.LoginRequestDto;
import org.example.dto.MatriculaDto;

import java.util.List;

public interface EstudianteService {

    EstudianteDto crear(EstudianteRequestDto dto);

    EstudianteDto buscarPorId(Long id);

    // null si el username no existe o la contrasena no coincide -- el Controller decide
    // que codigo HTTP corresponde (401), este metodo no sabe nada de HTTP.
    EstudianteDto login(LoginRequestDto dto);

    // "Historial de cursos completados" -- matriculas con estado COMPLETADA de este
    // estudiante (ver MatriculaRepository, no es un campo de Estudiante).
    List<MatriculaDto> historial(Long id);
}
