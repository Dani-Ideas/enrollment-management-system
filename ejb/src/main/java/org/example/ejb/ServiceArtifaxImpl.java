package org.example.ejb;

import jakarta.annotation.PostConstruct;
import jakarta.ejb.Lock;
import jakarta.ejb.LockType;
import jakarta.ejb.Singleton;
import jakarta.ejb.Startup;
import jakarta.inject.Inject;
import org.example.dto.MiniFormAmbDto;
import org.example.dto.MiniFormEstDto;
import org.example.dto.MiniFormRespDto;
import org.example.dto.MiniFormSisDto;
import org.example.dto.TablasInscripcionDto;
import org.example.lib.MiniFormAmbRepository;
import org.example.lib.MiniFormEstRepository;
import org.example.lib.MiniFormRespRepository;
import org.example.lib.MiniFormSisRepository;
import org.example.lib.ServiceArtifax;
import org.example.mapper.MiniFormAmbMapper;
import org.example.mapper.MiniFormEstMapper;
import org.example.mapper.MiniFormRespMapper;
import org.example.mapper.MiniFormSisMapper;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

// Reemplaza a MiniFormEstService/MiniFormSisService/MiniFormRespService/MiniFormAmbService
// (y sus *ServiceImpl, borrados) -- mismo patron que HelloJakarta-variante (bitacora #29).
// Carga los 4 Repository de catalogo y los convierte a DTO aca -- son datos estaticos, se
// precargan una sola vez al desplegar y se sirven del mapa, sin ir a la BD en cada
// listar(). Sin seeder propio -- las filas de MINIFORMEST/SIS/RESP/AMB tienen que existir
// ya en la base (a mano o por fuera de este WAR) antes del primer deploy, si no estos 4
// mapas arrancan vacios.
@Singleton
@Startup
public class ServiceArtifaxImpl implements ServiceArtifax {

    @Inject
    private MiniFormEstRepository miniFormEstRepository;
    @Inject
    private MiniFormSisRepository miniFormSisRepository;
    @Inject
    private MiniFormRespRepository miniFormRespRepository;
    @Inject
    private MiniFormAmbRepository miniFormAmbRepository;

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
        miniFormEstRepository.findAll().forEach(e -> estados.put(e.getId(), miniFormEstMapper.toDto(e)));
        miniFormSisRepository.findAll().forEach(s -> sistemas.put(s.getId(), miniFormSisMapper.toDto(s)));
        miniFormRespRepository.findAll().forEach(r -> responsables.put(r.getId(), miniFormRespMapper.toDto(r)));
        miniFormAmbRepository.findAll().forEach(a -> ambientes.put(a.getId(), miniFormAmbMapper.toDto(a)));
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
}
