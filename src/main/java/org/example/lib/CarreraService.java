package org.example.lib;

import org.example.dto.CarreraDto;

import java.util.List;

public interface CarreraService {

    List<CarreraDto> listar();

    CarreraDto buscarPorId(Long id);
}
