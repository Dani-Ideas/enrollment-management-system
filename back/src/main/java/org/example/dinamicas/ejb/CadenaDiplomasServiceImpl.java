package org.example.dinamicas.ejb;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import org.example.comun.ReferenciaInvalidaException;
import org.example.comun.ReglaDeNegocioException;
import org.example.dinamicas.dto.CadenaDiplomasDto;
import org.example.dinamicas.dto.CadenaDiplomasRequestDto;
import org.example.dinamicas.mapper.DiplomaPrimariaMapper;
import org.example.dinamicas.mapper.DiplomaSecundariaMapper;
import org.example.dinamicas.mapper.DiplomaUniversidadMapper;
import org.example.dinamicas.mapper.InscripcionSecundariaMapper;
import org.example.dinamicas.mapper.InscripcionUniversidadMapper;
import org.example.dinamicas.model.DiplomaPrimariaEty;
import org.example.dinamicas.model.DiplomaSecundariaEty;
import org.example.dinamicas.model.DiplomaUniversidadEty;
import org.example.dinamicas.model.InscripcionEty;
import org.example.dinamicas.model.InscripcionSecundariaEty;
import org.example.dinamicas.model.InscripcionUniversidadEty;
import org.example.dinamicas.repository.DiplomaPrimariaRepository;
import org.example.dinamicas.repository.DiplomaSecundariaRepository;
import org.example.dinamicas.repository.DiplomaUniversidadRepository;
import org.example.dinamicas.repository.InscripcionRepository;
import org.example.dinamicas.repository.InscripcionSecundariaRepository;
import org.example.dinamicas.repository.InscripcionUniversidadRepository;
import org.example.dinamicas.service.CadenaDiplomasService;

import java.time.LocalDateTime;

// Continua la cadena Primaria/Secundaria/Universidad en UNA sola peticion/transaccion a
// partir de una InscripcionEty (Primaria) que ya existe -- ver CadenaDiplomasRequestDto para
// el porque de los campos opcionales-pero-acumulativos. Cada nivel se valida y se inserta en
// el orden de la cadena ANTES de pasar al siguiente -- si un nivel intermedio no esta
// completo (o falta en la peticion), se corta ahi con un 409 y nada de lo que vendria
// despues se llega a insertar (nada tiene id todavia dentro de esta misma transaccion, asi
// que no hay filas huerfanas que limpiar).
//
// A diferencia de DiplomaPrimariaServiceImpl/InscripcionSecundariaServiceImpl/
// InscripcionUniversidadServiceImpl (que resuelven la FK de encadenamiento contra una fila
// YA PERSISTIDA, via mapper.desdeId(Long)), aca el nivel anterior puede haber sido creado
// unas lineas antes en este mismo metodo -- por eso este service no reusa esos otros 3
// services ni sus "uses" de mapper basados en id, y en cambio llama a los metodos
// toEntity(...DatosDto) agregados a cada mapper, seteando la relacion de encadenamiento a
// mano con la entidad recien insertada.
@Stateless
public class CadenaDiplomasServiceImpl implements CadenaDiplomasService {

    @Inject
    private InscripcionRepository inscripcionRepository;
    @Inject
    private DiplomaPrimariaRepository diplomaPrimariaRepository;
    @Inject
    private InscripcionSecundariaRepository inscripcionSecundariaRepository;
    @Inject
    private DiplomaSecundariaRepository diplomaSecundariaRepository;
    @Inject
    private InscripcionUniversidadRepository inscripcionUniversidadRepository;
    @Inject
    private DiplomaUniversidadRepository diplomaUniversidadRepository;

    @Inject
    private DiplomaPrimariaMapper diplomaPrimariaMapper;
    @Inject
    private InscripcionSecundariaMapper inscripcionSecundariaMapper;
    @Inject
    private DiplomaSecundariaMapper diplomaSecundariaMapper;
    @Inject
    private InscripcionUniversidadMapper inscripcionUniversidadMapper;
    @Inject
    private DiplomaUniversidadMapper diplomaUniversidadMapper;

    @Override
    public CadenaDiplomasDto crear(Long inscripcionId, CadenaDiplomasRequestDto dto) {
        InscripcionEty inscripcion = inscripcionRepository.findById(inscripcionId)
                .orElseThrow(() -> new ReferenciaInvalidaException("No existe la inscripción " + inscripcionId));

        DiplomaPrimariaEty diplomaPrimaria = null;
        if (dto.diplomaPrimaria() != null) {
            if (inscripcion.getDiplomaPrimaria() != null) {
                throw new ReglaDeNegocioException(
                        "La inscripción " + inscripcionId + " ya tiene diploma de primaria");
            }
            diplomaPrimaria = diplomaPrimariaMapper.toEntity(dto.diplomaPrimaria());
            diplomaPrimaria.setInscripcion(inscripcion);
            recomputarEmitidoPrimaria(diplomaPrimaria);
            diplomaPrimaria = diplomaPrimariaRepository.insert(diplomaPrimaria);
        }

        InscripcionSecundariaEty inscripcionSecundaria = null;
        if (dto.inscripcionSecundaria() != null) {
            if (diplomaPrimaria == null) {
                throw new ReglaDeNegocioException(
                        "No se puede crear la inscripción de secundaria sin el diploma de primaria en la misma petición");
            }
            validarDiplomaPrimariaCompleto(diplomaPrimaria);
            inscripcionSecundaria = inscripcionSecundariaMapper.toEntity(dto.inscripcionSecundaria());
            inscripcionSecundaria.setDiplomaPrimaria(diplomaPrimaria);
            inscripcionSecundaria = inscripcionSecundariaRepository.insert(inscripcionSecundaria);
        }

        DiplomaSecundariaEty diplomaSecundaria = null;
        if (dto.diplomaSecundaria() != null) {
            if (inscripcionSecundaria == null) {
                throw new ReglaDeNegocioException(
                        "No se puede crear el diploma de secundaria sin la inscripción de secundaria en la misma petición");
            }
            diplomaSecundaria = diplomaSecundariaMapper.toEntity(dto.diplomaSecundaria());
            diplomaSecundaria.setInscripcionSecundaria(inscripcionSecundaria);
            recomputarEmitidoSecundaria(diplomaSecundaria);
            diplomaSecundaria = diplomaSecundariaRepository.insert(diplomaSecundaria);
        }

        InscripcionUniversidadEty inscripcionUniversidad = null;
        if (dto.inscripcionUniversidad() != null) {
            if (diplomaSecundaria == null) {
                throw new ReglaDeNegocioException(
                        "No se puede crear la inscripción de universidad sin el diploma de secundaria en la misma petición");
            }
            validarDiplomaSecundariaCompleto(diplomaSecundaria);
            inscripcionUniversidad = inscripcionUniversidadMapper.toEntity(dto.inscripcionUniversidad());
            inscripcionUniversidad.setDiplomaSecundaria(diplomaSecundaria);
            inscripcionUniversidad = inscripcionUniversidadRepository.insert(inscripcionUniversidad);
        }

        DiplomaUniversidadEty diplomaUniversidad = null;
        if (dto.diplomaUniversidad() != null) {
            if (inscripcionUniversidad == null) {
                throw new ReglaDeNegocioException(
                        "No se puede crear el diploma de universidad sin la inscripción de universidad en la misma petición");
            }
            diplomaUniversidad = diplomaUniversidadMapper.toEntity(dto.diplomaUniversidad());
            diplomaUniversidad.setInscripcionUniversidad(inscripcionUniversidad);
            recomputarEmitidoUniversidad(diplomaUniversidad);
            diplomaUniversidad = diplomaUniversidadRepository.insert(diplomaUniversidad);
        }

        return new CadenaDiplomasDto(
                diplomaPrimaria == null ? null : diplomaPrimariaMapper.toDto(diplomaPrimaria),
                inscripcionSecundaria == null ? null : inscripcionSecundariaMapper.toDto(inscripcionSecundaria),
                diplomaSecundaria == null ? null : diplomaSecundariaMapper.toDto(diplomaSecundaria),
                inscripcionUniversidad == null ? null : inscripcionUniversidadMapper.toDto(inscripcionUniversidad),
                diplomaUniversidad == null ? null : diplomaUniversidadMapper.toDto(diplomaUniversidad));
    }

    // Variante "upsert" de crear(): cada nivel se ACTUALIZA si ya existe, se CREA si no --
    // usada por "actualizar" (PUT), que puede estar retomando una cadena a medio llenar de
    // una sesion anterior. Un nivel que NO viene en el dto se deja tal cual esta (no se
    // borra): la semantica es "guardar lo que venga", no "sincronizar borrando lo que
    // falte" (a diferencia de FormacionComplementaria). Mismo orden/mismas validaciones de
    // completitud que crear().
    @Override
    public CadenaDiplomasDto actualizar(Long inscripcionId, CadenaDiplomasRequestDto dto) {
        InscripcionEty inscripcion = inscripcionRepository.findById(inscripcionId)
                .orElseThrow(() -> new ReferenciaInvalidaException("No existe la inscripción " + inscripcionId));

        DiplomaPrimariaEty diplomaPrimaria = inscripcion.getDiplomaPrimaria();
        if (dto.diplomaPrimaria() != null) {
            boolean esNueva = diplomaPrimaria == null;
            DiplomaPrimariaEty datos = diplomaPrimariaMapper.toEntity(dto.diplomaPrimaria());
            if (esNueva) {
                diplomaPrimaria = datos;
                diplomaPrimaria.setInscripcion(inscripcion);
            } else {
                copiarFirmasPrimaria(diplomaPrimaria, datos);
            }
            recomputarEmitidoPrimaria(diplomaPrimaria);
            diplomaPrimaria = esNueva
                    ? diplomaPrimariaRepository.insert(diplomaPrimaria)
                    : diplomaPrimariaRepository.update(diplomaPrimaria);
        }

        // Las 4 entidades siguientes de la cadena NO tienen un "id" propio -- su PK ES la
        // relacion @Id @OneToOne de encadenamiento (ver InscripcionSecundariaEty, sin
        // getId()). Por eso el lookup de cada una es por "lineageId" (diplomaPrimaria.getId(),
        // el UNICO id real de toda la cadena), no por un id propio que no existe.
        Long lineageId = diplomaPrimaria == null ? null : diplomaPrimaria.getId();
        InscripcionSecundariaEty inscripcionSecundaria = lineageId == null
                ? null
                : inscripcionSecundariaRepository.findById(lineageId).orElse(null);
        if (dto.inscripcionSecundaria() != null) {
            if (diplomaPrimaria == null) {
                throw new ReglaDeNegocioException(
                        "No se puede guardar la inscripción de secundaria sin el diploma de primaria en la misma petición");
            }
            validarDiplomaPrimariaCompleto(diplomaPrimaria);
            boolean esNueva = inscripcionSecundaria == null;
            InscripcionSecundariaEty datos = inscripcionSecundariaMapper.toEntity(dto.inscripcionSecundaria());
            if (esNueva) {
                inscripcionSecundaria = datos;
                inscripcionSecundaria.setDiplomaPrimaria(diplomaPrimaria);
            } else {
                copiarDatosInscripcionSecundaria(inscripcionSecundaria, datos);
            }
            inscripcionSecundaria = esNueva
                    ? inscripcionSecundariaRepository.insert(inscripcionSecundaria)
                    : inscripcionSecundariaRepository.update(inscripcionSecundaria);
        }

        DiplomaSecundariaEty diplomaSecundaria = inscripcionSecundaria == null
                ? null
                : diplomaSecundariaRepository.findById(lineageId).orElse(null);
        if (dto.diplomaSecundaria() != null) {
            if (inscripcionSecundaria == null) {
                throw new ReglaDeNegocioException(
                        "No se puede guardar el diploma de secundaria sin la inscripción de secundaria en la misma petición");
            }
            boolean esNueva = diplomaSecundaria == null;
            DiplomaSecundariaEty datos = diplomaSecundariaMapper.toEntity(dto.diplomaSecundaria());
            if (esNueva) {
                diplomaSecundaria = datos;
                diplomaSecundaria.setInscripcionSecundaria(inscripcionSecundaria);
            } else {
                copiarFirmasSecundaria(diplomaSecundaria, datos);
            }
            recomputarEmitidoSecundaria(diplomaSecundaria);
            diplomaSecundaria = esNueva
                    ? diplomaSecundariaRepository.insert(diplomaSecundaria)
                    : diplomaSecundariaRepository.update(diplomaSecundaria);
        }

        InscripcionUniversidadEty inscripcionUniversidad = diplomaSecundaria == null
                ? null
                : inscripcionUniversidadRepository.findById(lineageId).orElse(null);
        if (dto.inscripcionUniversidad() != null) {
            if (diplomaSecundaria == null) {
                throw new ReglaDeNegocioException(
                        "No se puede guardar la inscripción de universidad sin el diploma de secundaria en la misma petición");
            }
            validarDiplomaSecundariaCompleto(diplomaSecundaria);
            boolean esNueva = inscripcionUniversidad == null;
            InscripcionUniversidadEty datos = inscripcionUniversidadMapper.toEntity(dto.inscripcionUniversidad());
            if (esNueva) {
                inscripcionUniversidad = datos;
                inscripcionUniversidad.setDiplomaSecundaria(diplomaSecundaria);
            } else {
                copiarDatosInscripcionUniversidad(inscripcionUniversidad, datos);
            }
            inscripcionUniversidad = esNueva
                    ? inscripcionUniversidadRepository.insert(inscripcionUniversidad)
                    : inscripcionUniversidadRepository.update(inscripcionUniversidad);
        }

        DiplomaUniversidadEty diplomaUniversidad = inscripcionUniversidad == null
                ? null
                : diplomaUniversidadRepository.findById(lineageId).orElse(null);
        if (dto.diplomaUniversidad() != null) {
            if (inscripcionUniversidad == null) {
                throw new ReglaDeNegocioException(
                        "No se puede guardar el diploma de universidad sin la inscripción de universidad en la misma petición");
            }
            boolean esNueva = diplomaUniversidad == null;
            DiplomaUniversidadEty datos = diplomaUniversidadMapper.toEntity(dto.diplomaUniversidad());
            if (esNueva) {
                diplomaUniversidad = datos;
                diplomaUniversidad.setInscripcionUniversidad(inscripcionUniversidad);
            } else {
                copiarFirmasUniversidad(diplomaUniversidad, datos);
            }
            recomputarEmitidoUniversidad(diplomaUniversidad);
            diplomaUniversidad = esNueva
                    ? diplomaUniversidadRepository.insert(diplomaUniversidad)
                    : diplomaUniversidadRepository.update(diplomaUniversidad);
        }

        return new CadenaDiplomasDto(
                diplomaPrimaria == null ? null : diplomaPrimariaMapper.toDto(diplomaPrimaria),
                inscripcionSecundaria == null ? null : inscripcionSecundariaMapper.toDto(inscripcionSecundaria),
                diplomaSecundaria == null ? null : diplomaSecundariaMapper.toDto(diplomaSecundaria),
                inscripcionUniversidad == null ? null : inscripcionUniversidadMapper.toDto(inscripcionUniversidad),
                diplomaUniversidad == null ? null : diplomaUniversidadMapper.toDto(diplomaUniversidad));
    }

    private void copiarFirmasPrimaria(DiplomaPrimariaEty destino, DiplomaPrimariaEty origen) {
        destino.setFirmaMaestro1ro(origen.isFirmaMaestro1ro());
        destino.setFirmaMaestro2do(origen.isFirmaMaestro2do());
        destino.setFirmaMaestro3ro(origen.isFirmaMaestro3ro());
        destino.setFirmaMaestro4to(origen.isFirmaMaestro4to());
        destino.setFirmaMaestro5to(origen.isFirmaMaestro5to());
        destino.setFirmaMaestro6to(origen.isFirmaMaestro6to());
        destino.setFirmaDirectorPrimaria(origen.isFirmaDirectorPrimaria());
    }

    private void copiarFirmasSecundaria(DiplomaSecundariaEty destino, DiplomaSecundariaEty origen) {
        destino.setFirmaMaestroPrimerGrado(origen.isFirmaMaestroPrimerGrado());
        destino.setFirmaMaestroSegundoGrado(origen.isFirmaMaestroSegundoGrado());
        destino.setFirmaMaestroTercerGrado(origen.isFirmaMaestroTercerGrado());
        destino.setFirmaOrientador(origen.isFirmaOrientador());
        destino.setFirmaDirectorSecundaria(origen.isFirmaDirectorSecundaria());
    }

    private void copiarFirmasUniversidad(DiplomaUniversidadEty destino, DiplomaUniversidadEty origen) {
        destino.setFirmaDecanoFacultad(origen.isFirmaDecanoFacultad());
        destino.setFirmaCoordinadorCarrera(origen.isFirmaCoordinadorCarrera());
        destino.setFirmaSecretarioAcademico(origen.isFirmaSecretarioAcademico());
        destino.setFirmaRector(origen.isFirmaRector());
    }

    private void copiarDatosInscripcionSecundaria(InscripcionSecundariaEty destino, InscripcionSecundariaEty origen) {
        destino.setEstado(origen.getEstado());
        destino.setSistema(origen.getSistema());
        destino.setJefeCarrera(origen.getJefeCarrera());
        destino.setMaestro(origen.getMaestro());
        destino.setCarrera(origen.getCarrera());
        destino.setAmbiente(origen.getAmbiente());
        destino.setProyecto(origen.getProyecto());
        destino.setVersion(origen.getVersion());
        destino.setDescripcion(origen.getDescripcion());
        destino.setFechaInscripcionPlanteada(origen.getFechaInscripcionPlanteada());
        destino.setFechaInscripcionReal(origen.getFechaInscripcionReal());
    }

    private void copiarDatosInscripcionUniversidad(InscripcionUniversidadEty destino, InscripcionUniversidadEty origen) {
        destino.setEstado(origen.getEstado());
        destino.setSistema(origen.getSistema());
        destino.setJefeCarrera(origen.getJefeCarrera());
        destino.setMaestro(origen.getMaestro());
        destino.setCarrera(origen.getCarrera());
        destino.setAmbiente(origen.getAmbiente());
        destino.setProyecto(origen.getProyecto());
        destino.setVersion(origen.getVersion());
        destino.setDescripcion(origen.getDescripcion());
        destino.setFechaInscripcionPlanteada(origen.getFechaInscripcionPlanteada());
        destino.setFechaInscripcionReal(origen.getFechaInscripcionReal());
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
                    "El diploma de primaria no está completo (faltan firmas o no fue emitido); "
                            + "no se puede inscribir en secundaria");
        }
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

    private void recomputarEmitidoPrimaria(DiplomaPrimariaEty diploma) {
        boolean completo = diploma.isFirmaMaestro1ro()
                && diploma.isFirmaMaestro2do()
                && diploma.isFirmaMaestro3ro()
                && diploma.isFirmaMaestro4to()
                && diploma.isFirmaMaestro5to()
                && diploma.isFirmaMaestro6to()
                && diploma.isFirmaDirectorPrimaria();
        marcarEmitido(diploma::isEmitido, diploma::setEmitido, diploma::setFechaEmision, completo);
    }

    private void recomputarEmitidoSecundaria(DiplomaSecundariaEty diploma) {
        boolean completo = diploma.isFirmaMaestroPrimerGrado()
                && diploma.isFirmaMaestroSegundoGrado()
                && diploma.isFirmaMaestroTercerGrado()
                && diploma.isFirmaOrientador()
                && diploma.isFirmaDirectorSecundaria();
        marcarEmitido(diploma::isEmitido, diploma::setEmitido, diploma::setFechaEmision, completo);
    }

    private void recomputarEmitidoUniversidad(DiplomaUniversidadEty diploma) {
        boolean completo = diploma.isFirmaDecanoFacultad()
                && diploma.isFirmaCoordinadorCarrera()
                && diploma.isFirmaSecretarioAcademico()
                && diploma.isFirmaRector();
        marcarEmitido(diploma::isEmitido, diploma::setEmitido, diploma::setFechaEmision, completo);
    }

    private void marcarEmitido(
            java.util.function.BooleanSupplier yaEmitido,
            java.util.function.Consumer<Boolean> setEmitido,
            java.util.function.Consumer<LocalDateTime> setFechaEmision,
            boolean completo) {
        if (completo) {
            if (!yaEmitido.getAsBoolean()) {
                setEmitido.accept(true);
                setFechaEmision.accept(LocalDateTime.now());
            }
        } else {
            setEmitido.accept(false);
            setFechaEmision.accept(null);
        }
    }
}
