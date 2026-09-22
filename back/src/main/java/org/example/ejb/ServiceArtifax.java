package org.example.ejb;

import jakarta.annotation.PostConstruct;
import jakarta.ejb.DependsOn;
import jakarta.ejb.EJB;
import jakarta.ejb.Lock;
import jakarta.ejb.LockType;
import jakarta.ejb.Singleton;
import jakarta.ejb.Startup;
import jakarta.inject.Inject;
import org.example.dto.MiniFormAmbDto;
import org.example.dto.MiniFormEstDto;
import org.example.dto.MiniFormRespDto;
import org.example.dto.MiniFormSisDto;
import org.example.dto.TablasImplantacionDto;
import org.example.mapper.MiniFormAmbMapper;
import org.example.mapper.MiniFormEstMapper;
import org.example.mapper.MiniFormRespMapper;
import org.example.mapper.MiniFormSisMapper;
import org.example.model.MiniFormAmb;
import org.example.model.MiniFormEst;
import org.example.model.MiniFormResp;
import org.example.model.MiniFormSis;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

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

    @Inject
    private MiniFormEstMapper miniFormEstMapper;
    @Inject
    private MiniFormSisMapper miniFormSisMapper;
    @Inject
    private MiniFormRespMapper miniFormRespMapper;
    @Inject
    private MiniFormAmbMapper miniFormAmbMapper;

    private final Map<Long, MiniFormEstDto> estados = new ConcurrentHashMap<>();
    private final Map<Long, MiniFormSisDto> sistemas = new ConcurrentHashMap<>();
    private final Map<Long, MiniFormRespDto> responsables = new ConcurrentHashMap<>();
    private final Map<Long, MiniFormAmbDto> ambientes = new ConcurrentHashMap<>();

    @PostConstruct
    private void precargar() {
        serviceRead.getList(MiniFormEst.class).forEach(e -> estados.put(e.getId(), miniFormEstMapper.toDto(e)));
        serviceRead.getList(MiniFormSis.class).forEach(s -> sistemas.put(s.getId(), miniFormSisMapper.toDto(s)));
        serviceRead.getList(MiniFormResp.class).forEach(r -> responsables.put(r.getId(), miniFormRespMapper.toDto(r)));
        serviceRead.getList(MiniFormAmb.class).forEach(a -> ambientes.put(a.getId(), miniFormAmbMapper.toDto(a)));
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
    // catalogos que hoy pide el formulario de implantacion con 4 GET separados.
    @Lock(LockType.READ)
    public TablasImplantacionDto tablasImplantacion() {
        return new TablasImplantacionDto(
                List.copyOf(estados.values()),
                List.copyOf(sistemas.values()),
                List.copyOf(responsables.values()),
                List.copyOf(ambientes.values())
        );
    }
}
