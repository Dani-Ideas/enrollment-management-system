package org.example.dinamicas.ejb;

import jakarta.data.repository.CrudRepository;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import org.example.comun.CrudServiceBase;
import org.example.comun.RequestResponseMapper;
import org.example.dinamicas.dto.PersonaDto;
import org.example.dinamicas.dto.PersonaRequestDto;
import org.example.dinamicas.mapper.PersonaMapper;
import org.example.dinamicas.model.PersonaEty;
import org.example.dinamicas.repository.PersonaRepository;
import org.example.dinamicas.service.PersonaService;

// listar()/buscarPorId() vienen de CrudServiceBase (ver ahi el por que) -- este service no
// tiene logica propia, solo le presta su Repository/Mapper concretos a la base.
@Stateless
public class PersonaServiceImpl extends CrudServiceBase<PersonaEty, Long, PersonaRequestDto, PersonaDto>
        implements PersonaService {

    @Inject
    private PersonaRepository personaRepository;

    @Inject
    private PersonaMapper personaMapper;

    @Override
    protected CrudRepository<PersonaEty, Long> repository() {
        return personaRepository;
    }

    @Override
    protected RequestResponseMapper<PersonaEty, PersonaRequestDto, PersonaDto> mapper() {
        return personaMapper;
    }

    @Override
    protected String mensajeNoEncontrado(Long id) {
        return "No existe la persona " + id;
    }
}
