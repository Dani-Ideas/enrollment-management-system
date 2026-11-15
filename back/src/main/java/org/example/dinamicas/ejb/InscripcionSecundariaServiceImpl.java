package org.example.dinamicas.ejb;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import org.example.comun.RecursoNoEncontradoException;
import org.example.comun.ReglaDeNegocioException;
import org.example.dinamicas.dto.InscripcionSecundariaConDiplomaDto;
import org.example.dinamicas.dto.InscripcionSecundariaConDiplomaRequestDto;
import org.example.dinamicas.dto.InscripcionSecundariaDto;
import org.example.dinamicas.mapper.DiplomaSecundariaMapper;
import org.example.dinamicas.mapper.InscripcionSecundariaMapper;
import org.example.dinamicas.model.DiplomaPrimariaEty;
import org.example.dinamicas.model.DiplomaSecundariaEty;
import org.example.dinamicas.model.InscripcionSecundariaEty;
import org.example.dinamicas.model.InscripcionSecundariaId;
import org.example.dinamicas.repository.DiplomaSecundariaRepository;
import org.example.dinamicas.repository.InscripcionSecundariaRepository;
import org.example.dinamicas.service.InscripcionSecundariaService;

import java.time.LocalDateTime;
import java.util.List;

// InscripcionSecundariaEty tiene PK compartida (con DiplomaPrimariaEty, via
// InscripcionSecundariaId) -- no encaja en CrudServiceBase<E,K,...> (pensado para un id Long
// plano, ver DireccionServiceImpl/CatalogoGeograficoServiceImpl para el mismo precedente de
// "servicio que no entra en el molde"). El Long que ve el cliente (URL, DTOs) es siempre el
// mismo valor de linaje; esta clase es la unica que sabe envolverlo/desenvolverlo contra la
// PK compuesta real antes de hablar con el Repository.
@Stateless
public class InscripcionSecundariaServiceImpl implements InscripcionSecundariaService {

    @Inject
    private InscripcionSecundariaRepository inscripcionSecundariaRepository;

    @Inject
    private DiplomaSecundariaRepository diplomaSecundariaRepository;

    @Inject
    private InscripcionSecundariaMapper inscripcionSecundariaMapper;

    @Inject
    private DiplomaSecundariaMapper diplomaSecundariaMapper;

    @Override
    public List<InscripcionSecundariaDto> listar() {
        return inscripcionSecundariaMapper.toDto(inscripcionSecundariaRepository.listarConCatalogos());
    }

    @Override
    public InscripcionSecundariaDto buscarPorId(Long id) {
        return inscripcionSecundariaMapper.toDto(obtener(id));
    }

    @Override
    public InscripcionSecundariaConDiplomaDto buscarConDiploma(Long id) {
        return inscripcionSecundariaMapper.toDtoConDiploma(obtener(id));
    }

    @Override
    public InscripcionSecundariaConDiplomaDto crear(InscripcionSecundariaConDiplomaRequestDto dto) {
        // toEntity() ya resuelve "diplomaPrimaria" (422 si el id no existe) -- esta ES la PK
        // compartida de la fila nueva. La regla de negocio se valida ANTES de insertar nada.
        InscripcionSecundariaEty nuevaInscripcion = inscripcionSecundariaMapper.toEntity(dto.inscripcionSecundaria());
        validarDiplomaPrimariaCompleto(nuevaInscripcion.getDiplomaPrimaria());

        InscripcionSecundariaEty creada = inscripcionSecundariaRepository.insert(nuevaInscripcion);

        DiplomaSecundariaEty nuevoDiploma = diplomaSecundariaMapper.toEntity(dto.diplomaSecundaria());
        nuevoDiploma.setInscripcionSecundaria(creada);
        recomputarEmitido(nuevoDiploma);
        DiplomaSecundariaEty diplomaCreado = diplomaSecundariaRepository.insert(nuevoDiploma);

        return new InscripcionSecundariaConDiplomaDto(
                inscripcionSecundariaMapper.toDto(creada),
                diplomaSecundariaMapper.toDto(diplomaCreado));
    }

    @Override
    public InscripcionSecundariaConDiplomaDto actualizar(Long id, InscripcionSecundariaConDiplomaRequestDto dto) {
        InscripcionSecundariaEty existente = obtener(id);
        // diplomaPrimaria es la PK compartida: no se puede re-apuntar en un update.
        validarDiplomaPrimariaCompleto(existente.getDiplomaPrimaria());

        inscripcionSecundariaMapper.actualizarDesde(existente, dto.inscripcionSecundaria());
        InscripcionSecundariaEty actualizada = inscripcionSecundariaRepository.update(existente);

        DiplomaSecundariaEty diploma = actualizada.getDiplomaSecundaria();
        if (diploma == null) {
            throw new RecursoNoEncontradoException("La inscripción de secundaria " + id + " no tiene diploma creado");
        }
        diplomaSecundariaMapper.actualizarDesde(diploma, dto.diplomaSecundaria());
        recomputarEmitido(diploma);
        DiplomaSecundariaEty diplomaActualizado = diplomaSecundariaRepository.update(diploma);

        return new InscripcionSecundariaConDiplomaDto(
                inscripcionSecundariaMapper.toDto(actualizada),
                diplomaSecundariaMapper.toDto(diplomaActualizado));
    }

    private InscripcionSecundariaEty obtener(Long id) {
        return inscripcionSecundariaRepository.findById(new InscripcionSecundariaId(id))
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe la inscripción de secundaria " + id));
    }

    private void validarDiplomaPrimariaCompleto(DiplomaPrimariaEty diploma) {
        boolean completo = diploma.isFirmaMaestro1ro()
                && diploma.isFirmaMaestro2do()
                && diploma.isFirmaMaestro3ro()
                && diploma.isFirmaMaestro4to()
                && diploma.isFirmaMaestro5to()
                && diploma.isFirmaMaestro6to()
                && diploma.isFirmaDirectorPrimaria()
                && diploma.isEmitido();
        if (!completo) {
            throw new ReglaDeNegocioException(
                    "El diploma de primaria " + diploma.getId() + " no está completo (faltan firmas o no fue emitido); "
                            + "no se puede inscribir en secundaria");
        }
    }

    private void recomputarEmitido(DiplomaSecundariaEty diploma) {
        boolean completo = diploma.isFirmaMaestroPrimerGrado()
                && diploma.isFirmaMaestroSegundoGrado()
                && diploma.isFirmaMaestroTercerGrado()
                && diploma.isFirmaOrientador()
                && diploma.isFirmaDirectorSecundaria();

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
