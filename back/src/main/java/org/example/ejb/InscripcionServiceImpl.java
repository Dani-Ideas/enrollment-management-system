package org.example.ejb;

import jakarta.ejb.EJB;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
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
import org.example.mapper.InscripcionMapper;
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
