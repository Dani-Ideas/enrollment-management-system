package org.example.dinamicas.ejb;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import org.example.dinamicas.dto.PersonaDto;
import org.example.dinamicas.lib.PersonaRepository;
import org.example.dinamicas.lib.PersonaService;
import org.example.dinamicas.mapper.PersonaMapper;

import java.util.List;

@Stateless
public class PersonaServiceImpl implements PersonaService {

    @Inject
    private PersonaRepository personaRepository;

    @Inject
    private PersonaMapper mapper;

    @Override
    public List<PersonaDto> listar() {
        return mapper.toDto(personaRepository.findAll().toList());
    }

    @Override
    public PersonaDto buscarPorId(Long id) {
        return personaRepository.findById(id).map(mapper::toDto).orElse(null);
    }
}
