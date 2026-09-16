package org.example.lib;

import org.example.dto.ProfesorDto;

import java.util.List;

public interface ProfesorService {

    List<ProfesorDto> listar();

    ProfesorDto buscarPorId(Long id);
}
