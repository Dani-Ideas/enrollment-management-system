package org.example.dinamicas.lib;

import org.example.dinamicas.dto.PersonaDto;

import java.util.List;

public interface PersonaService {

    List<PersonaDto> listar();

    PersonaDto buscarPorId(Long id);
}
