package org.example.dinamicas.ejb;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import org.example.comun.RecursoNoEncontradoException;
import org.example.dinamicas.dto.PersonaDto;
import org.example.dinamicas.repository.PersonaRepository;
import org.example.dinamicas.service.PersonaService;
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
        return personaRepository.findById(id)
                .map(mapper::toDto)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe la persona " + id));
    }
}
