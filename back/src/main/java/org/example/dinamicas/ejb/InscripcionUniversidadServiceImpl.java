package org.example.dinamicas.ejb;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import org.example.comun.RecursoNoEncontradoException;
import org.example.comun.ReglaDeNegocioException;
import org.example.dinamicas.dto.InscripcionUniversidadConDiplomaDto;
import org.example.dinamicas.dto.InscripcionUniversidadConDiplomaRequestDto;
import org.example.dinamicas.dto.InscripcionUniversidadDto;
import org.example.dinamicas.mapper.DiplomaUniversidadMapper;
import org.example.dinamicas.mapper.InscripcionUniversidadMapper;
import org.example.dinamicas.model.DiplomaSecundariaEty;
import org.example.dinamicas.model.DiplomaSecundariaId;
import org.example.dinamicas.model.DiplomaUniversidadEty;
import org.example.dinamicas.model.InscripcionSecundariaId;
import org.example.dinamicas.model.InscripcionUniversidadEty;
import org.example.dinamicas.model.InscripcionUniversidadId;
import org.example.dinamicas.repository.DiplomaUniversidadRepository;
import org.example.dinamicas.repository.InscripcionUniversidadRepository;
import org.example.dinamicas.service.InscripcionUniversidadService;

import java.time.LocalDateTime;
import java.util.List;

// Mismo patron que InscripcionSecundariaServiceImpl, un nivel arriba (PK compartida con
// DiplomaSecundariaEty via InscripcionUniversidadId, que a su vez envuelve DiplomaSecundariaId
// -> InscripcionSecundariaId -> Long).
@Stateless
public class InscripcionUniversidadServiceImpl implements InscripcionUniversidadService {

    @Inject
    private InscripcionUniversidadRepository inscripcionUniversidadRepository;

    @Inject
    private DiplomaUniversidadRepository diplomaUniversidadRepository;

    @Inject
    private InscripcionUniversidadMapper inscripcionUniversidadMapper;

    @Inject
    private DiplomaUniversidadMapper diplomaUniversidadMapper;

    @Override
    public List<InscripcionUniversidadDto> listar() {
        return inscripcionUniversidadMapper.toDto(inscripcionUniversidadRepository.listarConCatalogos());
    }

    @Override
    public InscripcionUniversidadDto buscarPorId(Long id) {
        return inscripcionUniversidadMapper.toDto(obtener(id));
    }

    @Override
    public InscripcionUniversidadConDiplomaDto buscarConDiploma(Long id) {
        return inscripcionUniversidadMapper.toDtoConDiploma(obtener(id));
    }

    @Override
    public InscripcionUniversidadConDiplomaDto crear(InscripcionUniversidadConDiplomaRequestDto dto) {
        InscripcionUniversidadEty nuevaInscripcion = inscripcionUniversidadMapper.toEntity(dto.inscripcionUniversidad());
        validarDiplomaSecundariaCompleto(nuevaInscripcion.getDiplomaSecundaria());

        InscripcionUniversidadEty creada = inscripcionUniversidadRepository.insert(nuevaInscripcion);

        DiplomaUniversidadEty nuevoDiploma = diplomaUniversidadMapper.toEntity(dto.diplomaUniversidad());
        nuevoDiploma.setInscripcionUniversidad(creada);
        recomputarEmitido(nuevoDiploma);
        DiplomaUniversidadEty diplomaCreado = diplomaUniversidadRepository.insert(nuevoDiploma);

        return new InscripcionUniversidadConDiplomaDto(
                inscripcionUniversidadMapper.toDto(creada),
                diplomaUniversidadMapper.toDto(diplomaCreado));
    }

    @Override
    public InscripcionUniversidadConDiplomaDto actualizar(Long id, InscripcionUniversidadConDiplomaRequestDto dto) {
        InscripcionUniversidadEty existente = obtener(id);
        validarDiplomaSecundariaCompleto(existente.getDiplomaSecundaria());

        inscripcionUniversidadMapper.actualizarDesde(existente, dto.inscripcionUniversidad());
        InscripcionUniversidadEty actualizada = inscripcionUniversidadRepository.update(existente);

        DiplomaUniversidadEty diploma = actualizada.getDiplomaUniversidad();
        if (diploma == null) {
            throw new RecursoNoEncontradoException("La inscripción de universidad " + id + " no tiene diploma creado");
        }
        diplomaUniversidadMapper.actualizarDesde(diploma, dto.diplomaUniversidad());
        recomputarEmitido(diploma);
        DiplomaUniversidadEty diplomaActualizado = diplomaUniversidadRepository.update(diploma);

        return new InscripcionUniversidadConDiplomaDto(
                inscripcionUniversidadMapper.toDto(actualizada),
                diplomaUniversidadMapper.toDto(diplomaActualizado));
    }

    private InscripcionUniversidadEty obtener(Long id) {
        InscripcionUniversidadId compuesto = new InscripcionUniversidadId(
                new DiplomaSecundariaId(new InscripcionSecundariaId(id)));
        return inscripcionUniversidadRepository.findById(compuesto)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe la inscripción de universidad " + id));
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
                    "El diploma de secundaria no está completo (faltan firmas o no fue emitido); "
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
