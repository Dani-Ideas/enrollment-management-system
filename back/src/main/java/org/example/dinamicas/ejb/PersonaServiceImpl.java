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

// ANTES de la etapa 6b (CrudServiceBase), este service escribia su propio listar()/
// buscarPorId() -- el mismo codigo, palabra por palabra, que repetia InscripcionServiceImpl:
//
// @Stateless
// public class PersonaServiceImpl implements PersonaService {
//
//     @Inject
//     private PersonaRepository personaRepository;
//
//     @Inject
//     private PersonaMapper mapper;
//
//     @Override
//     public List<PersonaDto> listar() {
//         return mapper.toDto(personaRepository.findAll().toList());
//     }
//
//     @Override
//     public PersonaDto buscarPorId(Long id) {
//         return personaRepository.findById(id)
//                 .map(mapper::toDto)
//                 .orElseThrow(() -> new RecursoNoEncontradoException("No existe la persona " + id));
//     }
// }
//
// AHORA: listar()/buscarPorId() vienen de CrudServiceBase (ver ahi el por que) -- este
// service no tiene logica propia, solo le presta su Repository/Mapper concretos a la base.
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
