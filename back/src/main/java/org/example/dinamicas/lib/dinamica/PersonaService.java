package org.example.dinamicas.lib.dinamica;

import org.example.dinamicas.dto.dinamica.DireccionDto;
import org.example.dinamicas.dto.dinamica.PersonaDto;

import java.util.List;

public interface PersonaService {

    List<PersonaDto> listar();

    PersonaDto buscarPorId(Long id);

    List<DireccionDto> listarDirecciones(Long personaId);
}
