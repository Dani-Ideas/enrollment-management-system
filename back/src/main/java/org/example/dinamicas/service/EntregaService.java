package org.example.dinamicas.service;

import org.example.dinamicas.dto.EntregaDto;
import org.example.dinamicas.dto.EntregaRequestDto;

import java.util.List;

public interface EntregaService {

    List<EntregaDto> listar();

    EntregaDto crear(EntregaRequestDto dto);
}
