package org.example.ejb;

import jakarta.annotation.PostConstruct;
import jakarta.ejb.DependsOn;
import jakarta.ejb.EJB;
import jakarta.ejb.Lock;
import jakarta.ejb.LockType;
import jakarta.ejb.Singleton;
import jakarta.ejb.Startup;
import jakarta.inject.Inject;
import org.example.dto.InscripcionDto;
import org.example.dto.FormacionComplementariaDto;
import org.example.dto.MiniFormAmbDto;
import org.example.dto.MiniFormEstDto;
import org.example.dto.MiniFormRespDto;
import org.example.dto.MiniFormSisDto;
import org.example.dto.TablasInscripcionDto;
import org.example.mapper.FormacionComplementariaMapper;
import org.example.mapper.InscripcionMapper;
import org.example.mapper.MiniFormAmbMapper;
import org.example.mapper.MiniFormEstMapper;
import org.example.mapper.MiniFormRespMapper;
import org.example.mapper.MiniFormSisMapper;
import org.example.model.InscripcionEty;
import org.example.model.FormacionComplementariaEty;
import org.example.model.MiniFormAmbEty;
import org.example.model.MiniFormEstEty;
import org.example.model.MiniFormRespEty;
import org.example.model.MiniFormSisEty;
import org.example.lib.ServiceArtifax;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

// Reemplaza a MiniFormEstService/MiniFormSisService/MiniFormRespService/MiniFormAmbService
// (y sus *ServiceImpl, borrados) -- mismo patron que HelloJakarta-variante (bitacora #29).
// Es el UNICO service de este trio que usa Mapper: ServiceRead/ServiceCreateModify manejan
// Entity pura, aqui es donde se convierte a DTO. Tambien es la "base de datos artifax" (en
// memoria): los 4 catalogos son datos estaticos (sembrados una vez en DatosInicialesInscripcion,
// sin ningun endpoint de escritura en todo el proyecto), asi que se precargan una sola vez
// y se sirven del mapa, sin ir a la BD en cada listar().
@Singleton
@Startup
@DependsOn("DatosInicialesInscripcion")
public class ServiceArtifaxImpl implements ServiceArtifax {

    @EJB
    private ServiceRead serviceRead;

    @Inject
    private MiniFormEstMapper miniFormEstMapper;
    @Inject
    private MiniFormSisMapper miniFormSisMapper;
    @Inject
    private MiniFormRespMapper miniFormRespMapper;
    @Inject
    private MiniFormAmbMapper miniFormAmbMapper;
    @Inject
    private InscripcionMapper inscripcionMapper;
    @Inject
    private FormacionComplementariaMapper formacionComplementariaMapper;

    private final Map<Long, MiniFormEstDto> estados = new ConcurrentHashMap<>();
    private final Map<Long, MiniFormSisDto> sistemas = new ConcurrentHashMap<>();
    private final Map<Long, MiniFormRespDto> responsables = new ConcurrentHashMap<>();
    private final Map<Long, MiniFormAmbDto> ambientes = new ConcurrentHashMap<>();

    // A diferencia de los 4 catalogos de arriba (que cachean el DTO ya aplanado), aqui se
    // guarda la Entity cruda -- filtrar por estadoId/sistemaId/ambienteId necesita
    // inscripcion.getEstado().getId() etc., y esos ids no viajan en InscripcionDto (que sale aplanado a
    // texto a proposito, ver InscripcionDto.java). Se mapea a InscripcionDto recien al final, solo sobre
    // lo que ya paso el filtro.
    private final Map<Long, InscripcionEty> inscripciones = new ConcurrentHashMap<>();

    // Mismo criterio que "inscripciones" -- se guarda la Entity cruda (no el DTO) porque
    // filtrar "formaciones complementarias de esta inscripcion" necesita
    // formacionComplementaria.getInscripcion().getId().
    private final Map<Long, FormacionComplementariaEty> formacionesComplementarias = new ConcurrentHashMap<>();

    @PostConstruct
    private void precargar() {
        serviceRead.getList(MiniFormEstEty.class).forEach(e -> estados.put(e.getId(), miniFormEstMapper.toDto(e)));
        serviceRead.getList(MiniFormSisEty.class).forEach(s -> sistemas.put(s.getId(), miniFormSisMapper.toDto(s)));
        serviceRead.getList(MiniFormRespEty.class).forEach(r -> responsables.put(r.getId(), miniFormRespMapper.toDto(r)));
        serviceRead.getList(MiniFormAmbEty.class).forEach(a -> ambientes.put(a.getId(), miniFormAmbMapper.toDto(a)));
        serviceRead.getList(InscripcionEty.class).forEach(f -> inscripciones.put(f.getId(), f));
        serviceRead.getList(FormacionComplementariaEty.class).forEach(e -> formacionesComplementarias.put(e.getId(), e));
    }

    @Override
    @Lock(LockType.READ)
    public List<MiniFormEstDto> listarEstados() {
        return List.copyOf(estados.values());
    }

    @Override
    @Lock(LockType.READ)
    public List<MiniFormSisDto> listarSistemas() {
        return List.copyOf(sistemas.values());
    }

    @Override
    @Lock(LockType.READ)
    public List<MiniFormRespDto> listarResponsables() {
        return List.copyOf(responsables.values());
    }

    @Override
    @Lock(LockType.READ)
    public List<MiniFormAmbDto> listarAmbientes() {
        return List.copyOf(ambientes.values());
    }

    // "Tablas genericas": UNA sola consulta (en memoria, sin ir a la BD) para los 4
    // catalogos que hoy pide el formulario de inscripcion con 4 GET separados.
    @Override
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
    @Override
    @Lock(LockType.READ)
    public List<InscripcionDto> listarInscripciones(Long estadoId, Long sistemaId, Long ambienteId) {
        return inscripciones.values().stream()
                .filter(f -> estadoId == null || Objects.equals(f.getEstado().getId(), estadoId))
                .filter(f -> sistemaId == null || Objects.equals(f.getSistema().getId(), sistemaId))
                .filter(f -> ambienteId == null || Objects.equals(f.getAmbiente().getId(), ambienteId))
                .map(inscripcionMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Lock(LockType.WRITE)
    public void refrescarInscripcion(InscripcionEty entidad) {
        inscripciones.put(entidad.getId(), entidad);
    }

    // ===== FormacionComplementariaEty: 1:N con Inscripcion, por FK (idInscripcion) =====

    // inscripcionId null = todas las formaciones complementarias, de cualquier inscripcion
    // (no se usa hoy desde el front, pero sigue el mismo criterio que listarInscripciones()
    // de arriba: null siempre significa "sin filtrar por este campo").
    @Override
    @Lock(LockType.READ)
    public List<FormacionComplementariaDto> listarFormacionesComplementariasPorInscripcion(Long inscripcionId) {
        return formacionesComplementarias.values().stream()
                .filter(e -> inscripcionId == null || Objects.equals(e.getInscripcion().getId(), inscripcionId))
                .map(formacionComplementariaMapper::toDto)
                .collect(Collectors.toList());
    }

    // Hooks de refresco -- llamados por FormacionComplementariaServiceImpl DESPUES de que
    // ya escribio de verdad en la base (mismo patron que refrescarInscripcion() de arriba).
    // ServiceArtifax es un CACHE, no una base de datos: nunca llama el mismo a
    // ServiceCreateModify -- por eso estos dos metodos son los UNICOS puntos de entrada
    // para que una escritura real se refleje en el mapa en memoria.
    @Override
    @Lock(LockType.WRITE)
    public void refrescarFormacionComplementaria(FormacionComplementariaEty entidad) {
        formacionesComplementarias.put(entidad.getId(), entidad);
    }

    @Override
    @Lock(LockType.WRITE)
    public void removerFormacionComplementaria(Long id) {
        formacionesComplementarias.remove(id);
    }
}
