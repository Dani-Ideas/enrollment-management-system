package org.example.dinamicas.ejb;

import jakarta.data.repository.CrudRepository;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import org.example.comun.CrudServiceBase;
import org.example.comun.ReferenciaInvalidaException;
import org.example.comun.ReglaDeNegocioException;
import org.example.comun.RequestResponseMapper;
import org.example.dinamicas.dto.DiplomaPrimariaDto;
import org.example.dinamicas.dto.DiplomaPrimariaRequestDto;
import org.example.dinamicas.mapper.DiplomaPrimariaMapper;
import org.example.dinamicas.model.DiplomaPrimariaEty;
import org.example.dinamicas.model.InscripcionEty;
import org.example.dinamicas.repository.DiplomaPrimariaRepository;
import org.example.dinamicas.repository.InscripcionRepository;
import org.example.dinamicas.service.DiplomaPrimariaService;

import java.time.LocalDateTime;

// InscripcionEty es ahora la "Inscripcion de Primaria" de la cadena Primaria/Secundaria/
// Universidad. Este service es standalone (no colgado de InscripcionController) porque
// InscripcionEty se queda tal cual esta -- no se le agrega un wrapper compuesto nuevo.
@Stateless
public class DiplomaPrimariaServiceImpl extends CrudServiceBase<DiplomaPrimariaEty, Long, DiplomaPrimariaRequestDto, DiplomaPrimariaDto>
        implements DiplomaPrimariaService {

    @Inject
    private DiplomaPrimariaRepository diplomaPrimariaRepository;

    @Inject
    private InscripcionRepository inscripcionRepository;

    @Inject
    private DiplomaPrimariaMapper diplomaPrimariaMapper;

    @Override
    protected CrudRepository<DiplomaPrimariaEty, Long> repository() {
        return diplomaPrimariaRepository;
    }

    @Override
    protected RequestResponseMapper<DiplomaPrimariaEty, DiplomaPrimariaRequestDto, DiplomaPrimariaDto> mapper() {
        return diplomaPrimariaMapper;
    }

    @Override
    protected String mensajeNoEncontrado(Long id) {
        return "No existe el diploma de primaria " + id;
    }

    @Override
    public DiplomaPrimariaDto crear(DiplomaPrimariaRequestDto dto) {
        InscripcionEty inscripcion = inscripcionRepository.findById(dto.inscripcion())
                .orElseThrow(() -> new ReferenciaInvalidaException("No existe la inscripción " + dto.inscripcion()));
        if (inscripcion.getDiplomaPrimaria() != null) {
            throw new ReglaDeNegocioException("La inscripción " + dto.inscripcion() + " ya tiene diploma de primaria");
        }

        DiplomaPrimariaEty nuevo = diplomaPrimariaMapper.toEntity(dto);
        nuevo.setInscripcion(inscripcion);
        recomputarEmitido(nuevo);
        return diplomaPrimariaMapper.toDto(diplomaPrimariaRepository.insert(nuevo));
    }

    @Override
    public DiplomaPrimariaDto actualizar(Long id, DiplomaPrimariaRequestDto dto) {
        DiplomaPrimariaEty existente = obtener(id);
        diplomaPrimariaMapper.actualizarDesde(existente, dto);
        recomputarEmitido(existente);
        return diplomaPrimariaMapper.toDto(diplomaPrimariaRepository.update(existente));
    }

    // "Completo" = las 7 firmas en true. emitido/fechaEmision son server-only: se recalculan
    // en cada crear()/actualizar(), nunca llegan en el DTO de entrada.
    private void recomputarEmitido(DiplomaPrimariaEty diploma) {
        boolean completo = diploma.isFirmaMaestro1ro()
                && diploma.isFirmaMaestro2do()
                && diploma.isFirmaMaestro3ro()
                && diploma.isFirmaMaestro4to()
                && diploma.isFirmaMaestro5to()
                && diploma.isFirmaMaestro6to()
                && diploma.isFirmaDirectorPrimaria();

        if (completo) {
            if (!diploma.isEmitido()) {
                diploma.setEmitido(true);
                diploma.setFechaEmision(LocalDateTime.now());
            }
        } else {
            diploma.setEmitido(false);
            diploma.setFechaEmision(null);
        }
    }
}
