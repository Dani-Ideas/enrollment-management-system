package org.example.dinamicas.ejb;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import org.example.dinamicas.dto.FormacionComplementariaDto;
import org.example.dinamicas.dto.FormacionComplementariaRequestDto;
import org.example.dinamicas.dto.InscripcionConFormacionComplementariaDto;
import org.example.dinamicas.dto.InscripcionConFormacionComplementariaRequestDto;
import org.example.dinamicas.dto.InscripcionDto;
import org.example.dinamicas.repository.FormacionComplementariaRepository;
import org.example.dinamicas.repository.InscripcionRepository;
import org.example.dinamicas.service.InscripcionService;
import org.example.comun.RecursoNoEncontradoException;
import org.example.comun.ReferenciaInvalidaException;
import org.example.dinamicas.mapper.FormacionComplementariaMapper;
import org.example.dinamicas.mapper.InscripcionMapper;
import org.example.dinamicas.model.FormacionComplementariaEty;
import org.example.dinamicas.model.InscripcionEty;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Stateless
public class InscripcionServiceImpl implements InscripcionService {

    @Inject
    private InscripcionRepository inscripcionRepository;

    @Inject
    private FormacionComplementariaRepository formacionComplementariaRepository;

    @Inject
    private FormacionComplementariaMapper formacionComplementariaMapper;
    @Inject
    private InscripcionMapper inscripcionMapper;

    @Override
    public List<InscripcionDto> listar() {
        return inscripcionRepository.findAll()
                .map(inscripcionMapper::toDto)
                .toList();
    }

    @Override
    public InscripcionDto buscarPorId(Long id) {
        return inscripcionMapper.toDto(obtener(id));
    }

    @Override
    public List<FormacionComplementariaDto> listarFormaciones(Long id) {
        return formacionComplementariaMapper.toDto(obtener(id).getFormacionesComplementarias());
    }

    private InscripcionEty obtener(Long id) {
        return inscripcionRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe la inscripción " + id));
    }

    // UNA sola peticion HTTP: crea la Inscripcion y sus formaciones complementarias juntas,
    // en dos insert explicitos (nada de cascade) -- toEntity()/toDto() en lista los genera
    // solo MapStruct (RequestResponseMapper.toEntity(List)/toDto(List)), ningun loop a mano.
    //
    // Las formaciones nuevas llegan con inscripcionId null (toEntity() las deja con
    // "inscripcion" null, via FormacionComplementariaMapper.desdeId(null)) -- JPA no
    // sincroniza sola las dos puntas de la relacion, asi que hay que pisar esa FK con la
    // InscripcionEty YA creada (con id real) antes del insertAll().
    @Override
    public InscripcionConFormacionComplementariaDto crear(InscripcionConFormacionComplementariaRequestDto dto) {
        InscripcionEty inscripcionCreada = inscripcionRepository.insert(inscripcionMapper.toEntity(dto.inscripcion()));

        List<FormacionComplementariaRequestDto> entrantes = Objects.requireNonNullElse(dto.formacionesComplementarias(), List.of());
        List<FormacionComplementariaEty> hijos = formacionComplementariaMapper.toEntity(entrantes);
        hijos.forEach(hijo -> hijo.setInscripcion(inscripcionCreada));
        List<FormacionComplementariaEty> formacionesCreadas = formacionComplementariaRepository.insertAll(hijos);

        return new InscripcionConFormacionComplementariaDto(
                inscripcionMapper.toDto(inscripcionCreada),
                formacionComplementariaMapper.toDto(formacionesCreadas)
        );
    }

    @Override
    public InscripcionConFormacionComplementariaDto actualizar(Long id, InscripcionConFormacionComplementariaRequestDto datosActualizados)  {
        InscripcionEty inscripcion = obtener(id);

        inscripcionMapper.actualizarDesde(inscripcion, datosActualizados.inscripcion());
        InscripcionEty actualizado = inscripcionRepository.update(inscripcion);

        // null = el cliente no mando la lista: las formaciones no se tocan. Una lista
        // (aunque sea vacia) es la lista COMPLETA que debe quedar.
        if (datosActualizados.formacionesComplementarias() != null) {
            sincronizarFormacionesComplementarias(actualizado, datosActualizados.formacionesComplementarias());
        }

        return inscripcionMapper.toDtoConFormaciones(actualizado);
    }

    // 3 llamadas al Repository (deleteAll/updateAll/insertAll), no una por fila. Las nuevas
    // se convierten de un saque con formacionComplementariaMapper.toEntity(List), igual que
    // en crear().
    private void sincronizarFormacionesComplementarias(
            InscripcionEty inscripcion,
            List<FormacionComplementariaRequestDto> entrantes
    ) {
        List<FormacionComplementariaEty> existentes = inscripcion.getFormacionesComplementarias();

        Set<Long> idsEntrantes = entrantes.stream()
                .map(FormacionComplementariaRequestDto::id)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // Eliminar: lo que ya no vino en la lista.
        List<FormacionComplementariaEty> aEliminar = existentes.stream()
                .filter(existente -> !idsEntrantes.contains(existente.getId()))
                .toList();
        if (!aEliminar.isEmpty()) {
            formacionComplementariaRepository.deleteAll(aEliminar);
            existentes.removeAll(aEliminar);
        }

        // Actualizar: lo que sigue -- a esta altura "existentes" es EXACTAMENTE lo que
        // coincide con un id entrante (lo que no coincidia ya se borro arriba).
        for (FormacionComplementariaRequestDto entrante : entrantes) {
            if (entrante.id() == null) {
                continue;
            }
            FormacionComplementariaEty existente = existentes.stream()
                    .filter(hijo -> hijo.getId().equals(entrante.id()))
                    .findFirst()
                    .orElseThrow(() -> new ReferenciaInvalidaException(
                            "No existe la formación complementaria " + entrante.id()));
            existente.setDescripcion(entrante.descripcion());
        }
        if (!existentes.isEmpty()) {
            formacionComplementariaRepository.updateAll(existentes);
        }

        // Crear: lo nuevo (entrada sin id), convertido entero de un saque.
        List<FormacionComplementariaRequestDto> nuevosDtos = entrantes.stream()
                .filter(entrante -> entrante.id() == null)
                .toList();
        if (!nuevosDtos.isEmpty()) {
            List<FormacionComplementariaEty> nuevos = formacionComplementariaMapper.toEntity(nuevosDtos);
            nuevos.forEach(hijo -> hijo.setInscripcion(inscripcion));
            List<FormacionComplementariaEty> creadas = formacionComplementariaRepository.insertAll(nuevos);
            existentes.addAll(creadas);
        }
    }
}