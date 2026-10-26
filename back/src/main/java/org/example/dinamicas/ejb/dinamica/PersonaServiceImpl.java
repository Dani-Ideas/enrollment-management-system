package org.example.dinamicas.ejb.dinamica;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import org.example.dinamicas.dto.dinamica.DireccionDto;
import org.example.dinamicas.dto.dinamica.PersonaDto;
import org.example.dinamicas.lib.dinamica.DireccionRepository;
import org.example.dinamicas.lib.dinamica.PersonaRepository;
import org.example.dinamicas.lib.dinamica.PersonaService;
import org.example.dinamicas.mapper.dinamica.PersonaMapper;

import java.util.List;

@Stateless
public class PersonaServiceImpl implements PersonaService {

    @Inject
    private PersonaRepository personaRepository;
    @Inject
    private DireccionRepository direccionRepository;

    @Inject
    private PersonaMapper mapper;

    @Override
    public List<PersonaDto> listar() {
        return mapper.personasToDto(personaRepository.findAll().toList());
    }

    @Override
    public PersonaDto buscarPorId(Long id) {
        return personaRepository.findById(id).map(mapper::toDto).orElse(null);
    }

    @Override
    public List<DireccionDto> listarDirecciones(Long personaId) {
        return mapper.direccionesToDto(direccionRepository.porPersona(personaId));
    }
}
