package org.example.dinamicas.ejb;

import jakarta.data.repository.CrudRepository;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import org.example.comun.CrudServiceBase;
import org.example.comun.RecursoNoEncontradoException;
import org.example.comun.ReglaDeNegocioException;
import org.example.comun.RequestResponseMapper;
import org.example.dinamicas.dto.InscripcionUniversidadConDiplomaDto;
import org.example.dinamicas.dto.InscripcionUniversidadConDiplomaRequestDto;
import org.example.dinamicas.dto.InscripcionUniversidadDto;
import org.example.dinamicas.dto.InscripcionUniversidadRequestDto;
import org.example.dinamicas.mapper.DiplomaUniversidadMapper;
import org.example.dinamicas.mapper.InscripcionUniversidadMapper;
import org.example.dinamicas.model.DiplomaSecundariaEty;
import org.example.dinamicas.model.DiplomaUniversidadEty;
import org.example.dinamicas.model.InscripcionUniversidadEty;
import org.example.dinamicas.repository.DiplomaUniversidadRepository;
import org.example.dinamicas.repository.InscripcionUniversidadRepository;
import org.example.dinamicas.service.InscripcionUniversidadService;

import java.time.LocalDateTime;
import java.util.List;

// Mismo patron que InscripcionSecundariaServiceImpl, un nivel arriba: valida contra
// DiplomaSecundariaEty en vez de DiplomaPrimariaEty.
@Stateless
public class InscripcionUniversidadServiceImpl
        extends CrudServiceBase<InscripcionUniversidadEty, Long, InscripcionUniversidadRequestDto, InscripcionUniversidadDto>
        implements InscripcionUniversidadService {

    @Inject
    private InscripcionUniversidadRepository inscripcionUniversidadRepository;

    @Inject
    private DiplomaUniversidadRepository diplomaUniversidadRepository;

    @Inject
    private InscripcionUniversidadMapper inscripcionUniversidadMapper;

    @Inject
    private DiplomaUniversidadMapper diplomaUniversidadMapper;

    @Override
    protected CrudRepository<InscripcionUniversidadEty, Long> repository() {
        return inscripcionUniversidadRepository;
    }

    @Override
    protected RequestResponseMapper<InscripcionUniversidadEty, InscripcionUniversidadRequestDto, InscripcionUniversidadDto> mapper() {
        return inscripcionUniversidadMapper;
    }

    @Override
    protected String mensajeNoEncontrado(Long id) {
        return "No existe la inscripción de universidad " + id;
    }

    @Override
    public List<InscripcionUniversidadDto> listar() {
        return inscripcionUniversidadMapper.toDto(inscripcionUniversidadRepository.listarConCatalogos());
    }

    @Override
    public InscripcionUniversidadConDiplomaDto buscarConDiploma(Long id) {
        return inscripcionUniversidadMapper.toDtoConDiploma(obtener(id));
    }

    @Override
    public InscripcionUniversidadConDiplomaDto crear(InscripcionUniversidadConDiplomaRequestDto dto) {
        DiplomaUniversidadEty nuevoDiploma = diplomaUniversidadMapper.toEntity(dto.diplomaUniversidad());
        validarDiplomaSecundariaCompleto(nuevoDiploma.getDiplomaSecundaria());

        InscripcionUniversidadEty creada = inscripcionUniversidadRepository.insert(
                inscripcionUniversidadMapper.toEntity(dto.inscripcionUniversidad()));

        nuevoDiploma.setInscripcionUniversidad(creada);
        recomputarEmitido(nuevoDiploma);
        DiplomaUniversidadEty diplomaCreado = diplomaUniversidadRepository.insert(nuevoDiploma);

        return new InscripcionUniversidadConDiplomaDto(
                inscripcionUniversidadMapper.toDto(creada),
                diplomaUniversidadMapper.toDto(diplomaCreado));
    }

    @Override
    public InscripcionUniversidadConDiplomaDto actualizar(Long id, InscripcionUniversidadConDiplomaRequestDto dto) {
        InscripcionUniversidadEty inscripcion = obtener(id);

        DiplomaUniversidadEty diploma = inscripcion.getDiplomaUniversidad();
        if (diploma == null) {
            throw new RecursoNoEncontradoException("La inscripción de universidad " + id + " no tiene diploma creado");
        }

        diplomaUniversidadMapper.actualizarDesde(diploma, dto.diplomaUniversidad());
        validarDiplomaSecundariaCompleto(diploma.getDiplomaSecundaria());

        inscripcionUniversidadMapper.actualizarDesde(inscripcion, dto.inscripcionUniversidad());
        InscripcionUniversidadEty actualizada = inscripcionUniversidadRepository.update(inscripcion);

        recomputarEmitido(diploma);
        DiplomaUniversidadEty diplomaActualizado = diplomaUniversidadRepository.update(diploma);

        return new InscripcionUniversidadConDiplomaDto(
                inscripcionUniversidadMapper.toDto(actualizada),
                diplomaUniversidadMapper.toDto(diplomaActualizado));
    }

    private void validarDiplomaSecundariaCompleto(DiplomaSecundariaEty diploma) {
        boolean completo = diploma.isFirmaMaestroPrimerGrado()
                && diploma.isFirmaMaestroSegundoGrado()
                && diploma.isFirmaMaestroTercerGrado()
                && diploma.isFirmaOrientador()
                && diploma.isFirmaDirectorSecundaria()
                && diploma.isEmitido();
        if (!completo) {
            throw new ReglaDeNegocioException(
                    "El diploma de secundaria " + diploma.getId() + " no está completo (faltan firmas o no fue emitido); "
                            + "no se puede inscribir en universidad");
        }
    }

    private void recomputarEmitido(DiplomaUniversidadEty diploma) {
        boolean completo = diploma.isFirmaDecanoFacultad()
                && diploma.isFirmaCoordinadorCarrera()
                && diploma.isFirmaSecretarioAcademico()
                && diploma.isFirmaRector();

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
