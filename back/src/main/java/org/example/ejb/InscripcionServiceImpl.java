package org.example.ejb;

import jakarta.ejb.EJB;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import org.example.dto.FormacionComplementariaDto;
import org.example.dto.FormacionComplementariaRequestDto;
import org.example.dto.InscripcionConFormacionComplementariaDto;
import org.example.dto.InscripcionConFormacionComplementariaRequestDto;
import org.example.dto.InscripcionDto;
import org.example.dto.InscripcionRequestDto;
import org.example.lib.InscripcionRepository;
import org.example.lib.InscripcionService;
import org.example.lib.MiniFormAmbRepository;
import org.example.lib.MiniFormEstRepository;
import org.example.lib.MiniFormRespRepository;
import org.example.lib.MiniFormSisRepository;
import org.example.lib.ReglaDeNegocioException;
import org.example.lib.ServiceArtifax;
import org.example.mapper.FormacionComplementariaMapper;
import org.example.mapper.InscripcionMapper;
import org.example.model.FormacionComplementariaEty;
import org.example.model.InscripcionEty;

import java.util.List;
import java.util.stream.Collectors;

@Stateless
public class InscripcionServiceImpl implements InscripcionService {

    @Inject
    private InscripcionRepository inscripcionRepository;

    // ServiceArtifax cachea InscripcionEty en memoria (ver esa clase, listarInscripciones()) para
    // poder filtrar por estado/sistema/ambiente sin ir a la BD -- cada escritura de aqui
    // abajo tiene que avisarle, si no el cache se queda con datos viejos (mismo patron que
    // Producto en HelloJakarta-variante).
    @EJB
    private ServiceArtifax serviceArtifax;

    // Usados solo por el CRUD de FormacionComplementariaEty de mas abajo -- esa entidad no
    // tiene su propio Repository de Jakarta Data (nunca lo necesito), se escribe via el trio
    // generico, igual que antes de este refactor.
    @EJB
    private ServiceRead serviceRead;

    @EJB
    private ServiceCreateModify serviceCreateModify;

    @Inject
    private FormacionComplementariaMapper formacionComplementariaMapper;

    // Necesita los 4 repositorios de catalogo para reemplazar, DESPUES de
    // inscripcionMapper.toEntity()/actualizarDesde(), los stubs por id que arma el Mapper por las
    // entidades REALES -- hacen falta completas (no solo el id) para que
    // InscripcionMapper.toDto() pueda aplanarlas a texto legible en la respuesta, y de paso valida
    // que cada id exista de verdad (409 limpio en vez de una FK constraint cruda).
    @Inject
    private MiniFormEstRepository miniFormEstRepository;

    @Inject
    private MiniFormSisRepository miniFormSisRepository;

    @Inject
    private MiniFormRespRepository miniFormRespRepository;

    @Inject
    private MiniFormAmbRepository miniFormAmbRepository;

    @Inject
    private InscripcionMapper inscripcionMapper;

    @Override
    public List<InscripcionDto> listar() {
        return inscripcionRepository.findAll()
                .map(inscripcionMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public InscripcionDto buscarPorId(Long id) {
        return inscripcionRepository.findById(id).map(inscripcionMapper::toDto).orElse(null);
    }

    @Override
    public InscripcionDto crear(InscripcionRequestDto dto) {
        InscripcionEty inscripcion = inscripcionMapper.toEntity(dto);
        resolverRelaciones(inscripcion, dto);
        InscripcionEty creado = inscripcionRepository.insert(inscripcion);
        serviceArtifax.refrescarInscripcion(creado);
        return inscripcionMapper.toDto(creado);
    }

    @Override
    public InscripcionDto actualizar(Long id, InscripcionRequestDto dto) {
        return inscripcionRepository.findById(id)
                .map(inscripcion -> {
                    inscripcionMapper.actualizarDesde(inscripcion, dto);
                    resolverRelaciones(inscripcion, dto);
                    InscripcionEty actualizado = inscripcionRepository.update(inscripcion);
                    serviceArtifax.refrescarInscripcion(actualizado);
                    return inscripcionMapper.toDto(actualizado);
                })
                .orElse(null);
    }

    // UNA sola peticion HTTP para crear la Inscripcion y sus formaciones complementarias
    // juntas (antes eran 1 + N peticiones separadas). inscripcionMapper.
    // toEntityConFormaciones() arma el grafo completo (InscripcionEty con su lista de
    // FormacionComplementariaEty ya poblada, cada hijo con el back-reference seteado) --
    // resolverRelaciones() de abajo reemplaza los 6 stubs de la Inscripcion como siempre, y
    // un UNICO inscripcionRepository.insert() persiste todo en cascada (ver
    // InscripcionEty.formacionesComplementarias, cascade=PERSIST). Si algo falla a mitad de
    // camino, al ser todo un solo metodo @Stateless (transaccion CMT por defecto), se
    // revierte entero -- no queda una Inscripcion huerfana sin sus formaciones.
    @Override
    public InscripcionConFormacionComplementariaDto crearConFormaciones(InscripcionConFormacionComplementariaRequestDto dto) {
        InscripcionEty inscripcion = inscripcionMapper.toEntityConFormaciones(dto);
        resolverRelaciones(inscripcion, dto.inscripcion());
        InscripcionEty creado = inscripcionRepository.insert(inscripcion);
        serviceArtifax.refrescarInscripcion(creado);
        // La cascada persiste los hijos solos, pero eso no le avisa nada a ServiceArtifax
        // (el cache en memoria de FormacionComplementariaEty) -- sin este loop, un GET
        // /formaciones-complementarias?inscripcionId=X inmediatamente despues de crear
        // devolveria vacio, aunque los hijos ya esten en la base.
        creado.getFormacionesComplementarias().forEach(serviceArtifax::refrescarFormacionComplementaria);
        return inscripcionMapper.toDtoConFormaciones(creado);
    }

    // ===== FormacionComplementariaEty: el lado "N" de la relacion -- sin service propio,
    // ver el comentario de InscripcionService.java. =====

    @Override
    public FormacionComplementariaDto crearFormacionComplementaria(FormacionComplementariaRequestDto dto) {
        InscripcionEty inscripcionReal = serviceRead.getById(InscripcionEty.class, dto.inscripcionId());
        if (inscripcionReal == null) {
            throw new ReglaDeNegocioException("No existe la inscripción " + dto.inscripcionId());
        }
        // formacionComplementariaMapper.toEntity() deja "inscripcion" como stub (solo id, via
        // FormacionComplementariaMapper.desdeId) -- se pisa aqui con la entidad real antes de
        // persistir, mismo motivo que resolverRelaciones() de abajo.
        FormacionComplementariaEty entidad = formacionComplementariaMapper.toEntity(dto);
        entidad.setInscripcion(inscripcionReal);
        FormacionComplementariaEty creado = serviceCreateModify.crear(entidad);
        serviceArtifax.refrescarFormacionComplementaria(creado);
        return formacionComplementariaMapper.toDto(creado);
    }

    @Override
    public FormacionComplementariaDto actualizarFormacionComplementaria(Long id, FormacionComplementariaRequestDto dto) {
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
    public boolean eliminarFormacionComplementaria(Long id) {
        boolean eliminado = serviceCreateModify.eliminar(FormacionComplementariaEty.class, id);
        if (eliminado) {
            serviceArtifax.removerFormacionComplementaria(id);
        }
        return eliminado;
    }

    // Comun a crear() y actualizar() -- el Mapper ya dejo la entidad con los 6 stubs (solo
    // id) y los campos propios copiados; esto los reemplaza por las entidades REALES (con
    // 404/409 limpio si algun id no existe).
    private void resolverRelaciones(InscripcionEty inscripcion, InscripcionRequestDto dto) {
        inscripcion.setEstado(miniFormEstRepository.findById(dto.estadoId())
                .orElseThrow(() -> new ReglaDeNegocioException("No existe el estado " + dto.estadoId())));
        inscripcion.setSistema(miniFormSisRepository.findById(dto.sistemaId())
                .orElseThrow(() -> new ReglaDeNegocioException("No existe el sistema " + dto.sistemaId())));
        inscripcion.setJefeCarrera(miniFormRespRepository.findById(dto.jefeCarreraId())
                .orElseThrow(() -> new ReglaDeNegocioException("No existe el responsable " + dto.jefeCarreraId())));
        inscripcion.setMaestro(miniFormRespRepository.findById(dto.maestroId())
                .orElseThrow(() -> new ReglaDeNegocioException("No existe el responsable " + dto.maestroId())));
        inscripcion.setCarrera(miniFormRespRepository.findById(dto.carreraId())
                .orElseThrow(() -> new ReglaDeNegocioException("No existe el responsable " + dto.carreraId())));
        inscripcion.setAmbiente(miniFormAmbRepository.findById(dto.ambienteId())
                .orElseThrow(() -> new ReglaDeNegocioException("No existe el ambiente " + dto.ambienteId())));
    }
}
