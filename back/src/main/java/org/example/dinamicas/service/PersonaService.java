package org.example.dinamicas.service;

import org.example.dinamicas.dto.PersonaDto;

import java.util.List;

public interface PersonaService {

    List<PersonaDto> listar();

    PersonaDto buscarPorId(Long id);
}
