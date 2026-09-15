package org.example.lib;

import org.example.dto.MateriaDto;

import java.util.List;

public interface MateriaService {

    List<MateriaDto> listar();

    MateriaDto buscarPorId(Long id);

    List<MateriaDto> listarPorCarrera(Long carreraId);
}
