package org.example.ejb;

import jakarta.ejb.EJB;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import org.example.dto.FormacionComplementariaDto;
import org.example.dto.FormacionComplementariaRequestDto;
import org.example.lib.FormacionComplementariaService;
import org.example.lib.ReglaDeNegocioException;
import org.example.lib.ServiceArtifax;
import org.example.mapper.FormacionComplementariaMapper;
import org.example.model.FormacionComplementariaEty;
import org.example.model.InscripcionEty;

// Escribe de verdad en la base (via ServiceRead/ServiceCreateModify, el trio generico) y
// despues avisa a ServiceArtifax para que el cache en memoria no quede desactualizado --
// exactamente el mismo patron que InscripcionServiceImpl usa con refrescarInscripcion().
// Antes estas 3 escrituras vivian DENTRO de ServiceArtifax, mezclando "cache de lectura" con
// "servicio de escritura" en la misma clase.
@Stateless
public class FormacionComplementariaServiceImpl implements FormacionComplementariaService {

    @EJB
    private ServiceRead serviceRead;

    @EJB
    private ServiceCreateModify serviceCreateModify;

    @EJB
    private ServiceArtifax serviceArtifax;

    @Inject
    private FormacionComplementariaMapper formacionComplementariaMapper;

    // Se llama DESPUES de que la Inscripcion ya existe de verdad (con su id real) -- ver
    // CatalogosInscripcionServiceImpl.crearInscripcionConFormaciones(), que es quien orquesta
    // el orden. Por eso inscripcionId siempre debe existir ya (si no, 409 limpio, mismo
    // criterio que InscripcionServiceImpl.resolverRelaciones()).
    @Override
    public FormacionComplementariaDto crear(FormacionComplementariaRequestDto dto) {
        InscripcionEty inscripcionReal = serviceRead.getById(InscripcionEty.class, dto.inscripcionId());
        if (inscripcionReal == null) {
            throw new ReglaDeNegocioException("No existe la inscripción " + dto.inscripcionId());
        }
        // formacionComplementariaMapper.toEntity() deja "inscripcion" como stub (solo id, via
        // FormacionComplementariaMapper.desdeId) -- se pisa aqui con la entidad real antes de
        // persistir, mismo motivo que InscripcionServiceImpl.resolverRelaciones().
        FormacionComplementariaEty entidad = formacionComplementariaMapper.toEntity(dto);
        entidad.setInscripcion(inscripcionReal);
        FormacionComplementariaEty creado = serviceCreateModify.crear(entidad);
        serviceArtifax.refrescarFormacionComplementaria(creado);
        return formacionComplementariaMapper.toDto(creado);
    }

    @Override
    public FormacionComplementariaDto actualizar(Long id, FormacionComplementariaRequestDto dto) {
        FormacionComplementariaEty existente = serviceRead.getById(FormacionComplementariaEty.class, id);
        if (existente == null) {
            return null;
        }
        InscripcionEty inscripcionReal = serviceRead.getById(InscripcionEty.class, dto.inscripcionId());
        if (inscripcionReal == null) {
            throw new ReglaDeNegocioException("No existe la inscripción " + dto.inscripcionId());
        }
        existente.setDescripcion(dto.descripcion());
        existente.setInscripcion(inscripcionReal);
        FormacionComplementariaEty actualizado = serviceCreateModify.actualizar(existente);
        serviceArtifax.refrescarFormacionComplementaria(actualizado);
        return formacionComplementariaMapper.toDto(actualizado);
    }

    @Override
    public boolean eliminar(Long id) {
        boolean eliminado = serviceCreateModify.eliminar(FormacionComplementariaEty.class, id);
        if (eliminado) {
            serviceArtifax.removerFormacionComplementaria(id);
        }
        return eliminado;
    }
}
