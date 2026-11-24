package org.example.dinamicas.ejb;

import jakarta.data.repository.CrudRepository;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import org.example.comun.CrudServiceBase;
import org.example.comun.RequestResponseMapper;
import org.example.dinamicas.dto.EntregaDto;
import org.example.dinamicas.dto.EntregaRequestDto;
import org.example.dinamicas.mapper.EntregaMapper;
import org.example.dinamicas.model.EntregaEty;
import org.example.dinamicas.model.EntregaId;
import org.example.dinamicas.repository.EntregaRepository;
import org.example.dinamicas.service.EntregaService;

// listar()/crear() vienen de CrudServiceBase (el crear() de aca era, campo por campo, el
// mismo cuerpo). listarPorId(Long) se queda aparte, sin tocar -- pendiente (PK compuesta,
// ver EntregaController.porID y EntregaRepository.findById(Long)).
@Stateless
public class EntregaServiceImpl extends CrudServiceBase<EntregaEty, EntregaId, EntregaRequestDto, EntregaDto>
        implements EntregaService {

    @Inject
    private EntregaRepository entregaRepository;

    @Inject
    private EntregaMapper entregaMapper;

    @Override
    protected CrudRepository<EntregaEty, EntregaId> repository() {
        return entregaRepository;
    }

    @Override
    protected RequestResponseMapper<EntregaEty, EntregaRequestDto, EntregaDto> mapper() {
        return entregaMapper;
    }

    @Override
    protected String mensajeNoEncontrado(EntregaId id) {
        return "No existe la entrega " + id;
    }

    @Override
    public EntregaDto listarPorId(Long id) {
        return entregaMapper.toDto(entregaRepository.findById(id));
    }
}
