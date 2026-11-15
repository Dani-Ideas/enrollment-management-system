package org.example.dinamicas.ejb;

import jakarta.data.repository.CrudRepository;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import org.example.comun.CrudServiceBase;
import org.example.comun.RecursoNoEncontradoException;
import org.example.comun.ReglaDeNegocioException;
import org.example.comun.RequestResponseMapper;
import org.example.dinamicas.dto.InscripcionSecundariaConDiplomaDto;
import org.example.dinamicas.dto.InscripcionSecundariaConDiplomaRequestDto;
import org.example.dinamicas.dto.InscripcionSecundariaDto;
import org.example.dinamicas.dto.InscripcionSecundariaRequestDto;
import org.example.dinamicas.mapper.DiplomaSecundariaMapper;
import org.example.dinamicas.mapper.InscripcionSecundariaMapper;
import org.example.dinamicas.model.DiplomaPrimariaEty;
import org.example.dinamicas.model.DiplomaSecundariaEty;
import org.example.dinamicas.model.InscripcionSecundariaEty;
import org.example.dinamicas.repository.DiplomaSecundariaRepository;
import org.example.dinamicas.repository.InscripcionSecundariaRepository;
import org.example.dinamicas.service.InscripcionSecundariaService;

import java.time.LocalDateTime;
import java.util.List;

// InscripcionSecundariaEty es una entidad nueva, paralela a InscripcionEty (Primaria) --
// a diferencia de DiplomaPrimariaServiceImpl (standalone), este service SI maneja un wrapper
// compuesto (inscripcion + diploma), igual patron que InscripcionServiceImpl con sus
// formacionesComplementarias, salvo que aca el diploma es obligatorio y 1:1, no una lista
// opcional.
@Stateless
public class InscripcionSecundariaServiceImpl
        extends CrudServiceBase<InscripcionSecundariaEty, Long, InscripcionSecundariaRequestDto, InscripcionSecundariaDto>
        implements InscripcionSecundariaService {

    @Inject
    private InscripcionSecundariaRepository inscripcionSecundariaRepository;

    @Inject
    private DiplomaSecundariaRepository diplomaSecundariaRepository;

    @Inject
    private InscripcionSecundariaMapper inscripcionSecundariaMapper;

    @Inject
    private DiplomaSecundariaMapper diplomaSecundariaMapper;

    @Override
    protected CrudRepository<InscripcionSecundariaEty, Long> repository() {
        return inscripcionSecundariaRepository;
    }

    @Override
    protected RequestResponseMapper<InscripcionSecundariaEty, InscripcionSecundariaRequestDto, InscripcionSecundariaDto> mapper() {
        return inscripcionSecundariaMapper;
    }

    @Override
    protected String mensajeNoEncontrado(Long id) {
        return "No existe la inscripción de secundaria " + id;
    }

    @Override
    public List<InscripcionSecundariaDto> listar() {
        return inscripcionSecundariaMapper.toDto(inscripcionSecundariaRepository.listarConCatalogos());
    }

    @Override
    public InscripcionSecundariaConDiplomaDto buscarConDiploma(Long id) {
        return inscripcionSecundariaMapper.toDtoConDiploma(obtener(id));
    }

    @Override
    public InscripcionSecundariaConDiplomaDto crear(InscripcionSecundariaConDiplomaRequestDto dto) {
        // El diploma se mapea PRIMERO: toEntity() ya resuelve "diplomaPrimaria" (422 si el id
        // no existe) y la regla de negocio se valida ANTES de insertar nada -- si el diploma
        // de primaria referenciado no esta completo, no queda ninguna fila huerfana.
        DiplomaSecundariaEty nuevoDiploma = diplomaSecundariaMapper.toEntity(dto.diplomaSecundaria());
        validarDiplomaPrimariaCompleto(nuevoDiploma.getDiplomaPrimaria());

        InscripcionSecundariaEty creada = inscripcionSecundariaRepository.insert(
                inscripcionSecundariaMapper.toEntity(dto.inscripcionSecundaria()));

        nuevoDiploma.setInscripcionSecundaria(creada);
        recomputarEmitido(nuevoDiploma);
        DiplomaSecundariaEty diplomaCreado = diplomaSecundariaRepository.insert(nuevoDiploma);

        return new InscripcionSecundariaConDiplomaDto(
                inscripcionSecundariaMapper.toDto(creada),
                diplomaSecundariaMapper.toDto(diplomaCreado));
    }

    @Override
    public InscripcionSecundariaConDiplomaDto actualizar(Long id, InscripcionSecundariaConDiplomaRequestDto dto) {
        InscripcionSecundariaEty inscripcion = obtener(id);

        DiplomaSecundariaEty diploma = inscripcion.getDiplomaSecundaria();
        if (diploma == null) {
            throw new RecursoNoEncontradoException("La inscripción de secundaria " + id + " no tiene diploma creado");
        }

        // actualizarDesde() re-resuelve "diplomaPrimaria" por si cambio -- la regla se valida
        // ANTES de guardar nada, igual que en crear().
        diplomaSecundariaMapper.actualizarDesde(diploma, dto.diplomaSecundaria());
        validarDiplomaPrimariaCompleto(diploma.getDiplomaPrimaria());

        inscripcionSecundariaMapper.actualizarDesde(inscripcion, dto.inscripcionSecundaria());
        InscripcionSecundariaEty actualizada = inscripcionSecundariaRepository.update(inscripcion);

        recomputarEmitido(diploma);
        DiplomaSecundariaEty diplomaActualizado = diplomaSecundariaRepository.update(diploma);

        return new InscripcionSecundariaConDiplomaDto(
                inscripcionSecundariaMapper.toDto(actualizada),
                diplomaSecundariaMapper.toDto(diplomaActualizado));
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
