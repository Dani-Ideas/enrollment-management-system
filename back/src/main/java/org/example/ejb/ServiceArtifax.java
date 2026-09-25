package org.example.ejb;

import jakarta.annotation.PostConstruct;
import jakarta.ejb.DependsOn;
import jakarta.ejb.EJB;
import jakarta.ejb.Lock;
import jakarta.ejb.LockType;
import jakarta.ejb.Singleton;
import jakarta.ejb.Startup;
import jakarta.inject.Inject;
import org.example.dto.FormDto;
import org.example.dto.FormacionComplementariaDto;
import org.example.dto.FormacionComplementariaRequestDto;
import org.example.dto.MiniFormAmbDto;
import org.example.dto.MiniFormEstDto;
import org.example.dto.MiniFormRespDto;
import org.example.dto.MiniFormSisDto;
import org.example.dto.TablasInscripcionDto;
import org.example.lib.ReglaDeNegocioException;
import org.example.mapper.FormacionComplementariaMapper;
import org.example.mapper.FormMapper;
import org.example.mapper.MiniFormAmbMapper;
import org.example.mapper.MiniFormEstMapper;
import org.example.mapper.MiniFormRespMapper;
import org.example.mapper.MiniFormSisMapper;
import org.example.model.Form;
import org.example.model.FormacionComplementaria;
import org.example.model.MiniFormAmb;
import org.example.model.MiniFormEst;
import org.example.model.MiniFormResp;
import org.example.model.MiniFormSis;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

// Reemplaza a MiniFormEstService/MiniFormSisService/MiniFormRespService/MiniFormAmbService
// (y sus *ServiceImpl, borrados) -- mismo patron que HelloJakarta-variante (bitacora #29).
// Es el UNICO service de este trio que usa Mapper: ServiceRead/ServiceCreateModify manejan
// Entity pura, aqui es donde se convierte a DTO. Tambien es la "base de datos artifax" (en
// memoria): los 4 catalogos son datos estaticos (sembrados una vez en DatosInicialesForm,
// sin ningun endpoint de escritura en todo el proyecto), asi que se precargan una sola vez
// y se sirven del mapa, sin ir a la BD en cada listar().
@Singleton
@Startup
@DependsOn("DatosInicialesForm")
public class ServiceArtifax {

    @EJB
    private ServiceRead serviceRead;

    @EJB
    private ServiceCreateModify serviceCreateModify;

    @Inject
    private MiniFormEstMapper miniFormEstMapper;
    @Inject
    private MiniFormSisMapper miniFormSisMapper;
    @Inject
    private MiniFormRespMapper miniFormRespMapper;
    @Inject
    private MiniFormAmbMapper miniFormAmbMapper;
    @Inject
    private FormMapper formMapper;
    @Inject
    private FormacionComplementariaMapper formacionComplementariaMapper;

    private final Map<Long, MiniFormEstDto> estados = new ConcurrentHashMap<>();
    private final Map<Long, MiniFormSisDto> sistemas = new ConcurrentHashMap<>();
    private final Map<Long, MiniFormRespDto> responsables = new ConcurrentHashMap<>();
    private final Map<Long, MiniFormAmbDto> ambientes = new ConcurrentHashMap<>();

    // A diferencia de los 4 catalogos de arriba (que cachean el DTO ya aplanado), aqui se
    // guarda la Entity cruda -- filtrar por estadoId/sistemaId/ambienteId necesita
    // form.getEstado().getId() etc., y esos ids no viajan en FormDto (que sale aplanado a
    // texto a proposito, ver FormDto.java). Se mapea a FormDto recien al final, solo sobre
    // lo que ya paso el filtro.
    private final Map<Long, Form> inscripciones = new ConcurrentHashMap<>();

    // Mismo criterio que "inscripciones" -- se guarda la Entity cruda (no el DTO) porque
    // filtrar "formaciones complementarias de esta inscripcion" necesita
    // formacionComplementaria.getInscripcion().getId().
    private final Map<Long, FormacionComplementaria> formacionesComplementarias = new ConcurrentHashMap<>();

    @PostConstruct
    private void precargar() {
        serviceRead.getList(MiniFormEst.class).forEach(e -> estados.put(e.getId(), miniFormEstMapper.toDto(e)));
        serviceRead.getList(MiniFormSis.class).forEach(s -> sistemas.put(s.getId(), miniFormSisMapper.toDto(s)));
        serviceRead.getList(MiniFormResp.class).forEach(r -> responsables.put(r.getId(), miniFormRespMapper.toDto(r)));
        serviceRead.getList(MiniFormAmb.class).forEach(a -> ambientes.put(a.getId(), miniFormAmbMapper.toDto(a)));
        serviceRead.getList(Form.class).forEach(f -> inscripciones.put(f.getId(), f));
        serviceRead.getList(FormacionComplementaria.class).forEach(e -> formacionesComplementarias.put(e.getId(), e));
    }

    @Lock(LockType.READ)
    public List<MiniFormEstDto> listarEstados() {
        return List.copyOf(estados.values());
    }

    @Lock(LockType.READ)
    public List<MiniFormSisDto> listarSistemas() {
        return List.copyOf(sistemas.values());
    }

    @Lock(LockType.READ)
    public List<MiniFormRespDto> listarResponsables() {
        return List.copyOf(responsables.values());
    }

    @Lock(LockType.READ)
    public List<MiniFormAmbDto> listarAmbientes() {
        return List.copyOf(ambientes.values());
    }

    // "Tablas genericas": UNA sola consulta (en memoria, sin ir a la BD) para los 4
    // catalogos que hoy pide el formulario de inscripcion con 4 GET separados.
    @Lock(LockType.READ)
    public TablasInscripcionDto tablasInscripcion() {
        return new TablasInscripcionDto(
                List.copyOf(estados.values()),
                List.copyOf(sistemas.values()),
                List.copyOf(responsables.values()),
                List.copyOf(ambientes.values())
        );
    }

    // Filtro de la "mini base de datos" en memoria -- cada parametro null significa "no
    // filtrar por este campo" (asi listarInscripciones(null, null, null) devuelve todo,
    // igual que el listar() de antes). Recorre el mapa en vez de ir a la BD -- por eso se
    // apoya en ServiceArtifax y no directo en ServiceRead/el Repository: la gracia es que
    // ya esta todo cargado en memoria.
    @Lock(LockType.READ)
    public List<FormDto> listarInscripciones(Long estadoId, Long sistemaId, Long ambienteId) {
        return inscripciones.values().stream()
                .filter(f -> estadoId == null || Objects.equals(f.getEstado().getId(), estadoId))
                .filter(f -> sistemaId == null || Objects.equals(f.getSistema().getId(), sistemaId))
                .filter(f -> ambienteId == null || Objects.equals(f.getAmbiente().getId(), ambienteId))
                .map(formMapper::toDto)
                .collect(Collectors.toList());
    }

    @Lock(LockType.WRITE)
    public void refrescarInscripcion(Form entidad) {
        inscripciones.put(entidad.getId(), entidad);
    }

    // ===== FormacionComplementaria: 1:N con Inscripcion, por FK (idInscripcion) =====

    // inscripcionId null = todas las formaciones complementarias, de cualquier inscripcion
    // (no se usa hoy desde el front, pero sigue el mismo criterio que listarInscripciones()
    // de arriba: null siempre significa "sin filtrar por este campo").
    @Lock(LockType.READ)
    public List<FormacionComplementariaDto> listarFormacionesComplementariasPorInscripcion(Long inscripcionId) {
        return formacionesComplementarias.values().stream()
                .filter(e -> inscripcionId == null || Objects.equals(e.getInscripcion().getId(), inscripcionId))
                .map(formacionComplementariaMapper::toDto)
                .collect(Collectors.toList());
    }

    // Se llama DESPUES de que la Inscripcion ya existe de verdad (con su id real) -- el
    // front primero crea la Inscripcion, recibe la confirmacion con su id, y recien ahi
    // llama esto una vez por cada formacion complementaria. Por eso inscripcionId siempre
    // debe existir ya (si no, es un 409 limpio, mismo criterio que
    // FormServiceImpl.resolverRelaciones()).
    @Lock(LockType.WRITE)
    public FormacionComplementariaDto crearFormacionComplementaria(FormacionComplementariaRequestDto dto) {
        Form inscripcionReal = serviceRead.getById(Form.class, dto.inscripcionId());
        if (inscripcionReal == null) {
            throw new ReglaDeNegocioException("No existe la inscripción " + dto.inscripcionId());
        }
        // formacionComplementariaMapper.toEntity() deja "inscripcion" como stub (solo id,
        // via FormacionComplementariaMapper.desdeId) -- se pisa aqui con la Form real antes
        // de persistir, mismo motivo que FormServiceImpl.resolverRelaciones().
        FormacionComplementaria entidad = formacionComplementariaMapper.toEntity(dto);
        entidad.setInscripcion(inscripcionReal);
        FormacionComplementaria creado = serviceCreateModify.crear(entidad);
        formacionesComplementarias.put(creado.getId(), creado);
        return formacionComplementariaMapper.toDto(creado);
    }

    @Lock(LockType.WRITE)
    public FormacionComplementariaDto actualizarFormacionComplementaria(Long id, FormacionComplementariaRequestDto dto) {
        FormacionComplementaria existente = serviceRead.getById(FormacionComplementaria.class, id);
        if (existente == null) {
            return null;
        }
        Form inscripcionReal = serviceRead.getById(Form.class, dto.inscripcionId());
        if (inscripcionReal == null) {
            throw new ReglaDeNegocioException("No existe la inscripción " + dto.inscripcionId());
        }
        existente.setDescripcion(dto.descripcion());
        existente.setInscripcion(inscripcionReal);
        FormacionComplementaria actualizado = serviceCreateModify.actualizar(existente);
        formacionesComplementarias.put(actualizado.getId(), actualizado);
        return formacionComplementariaMapper.toDto(actualizado);
    }

    @Lock(LockType.WRITE)
    public boolean eliminarFormacionComplementaria(Long id) {
        boolean eliminado = serviceCreateModify.eliminar(FormacionComplementaria.class, id);
        if (eliminado) {
            formacionesComplementarias.remove(id);
        }
        return eliminado;
    }
}
