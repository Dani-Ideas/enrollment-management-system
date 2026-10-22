package org.example.ejb;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import org.example.dto.FormacionComplementariaDto;
import org.example.dto.FormacionComplementariaRequestDto;
import org.example.dto.InscripcionConFormacionComplementariaDto;
import org.example.dto.InscripcionConFormacionComplementariaRequestDto;
import org.example.dto.InscripcionDto;
import org.example.lib.FormacionComplementariaRepository;
import org.example.lib.InscripcionRepository;
import org.example.lib.InscripcionService;
import org.example.lib.ReglaDeNegocioException;
import org.example.mapper.FormacionComplementariaMapper;
import org.example.mapper.InscripcionMapper;
import org.example.model.FormacionComplementariaEty;
import org.example.model.InscripcionEty;

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
                .collect(Collectors.toList());
    }

    @Override
    public InscripcionDto buscarPorId(Long id) {
        return inscripcionRepository.findById(id).map(inscripcionMapper::toDto).orElse(null);
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

        List<FormacionComplementariaEty> hijos = formacionComplementariaMapper.toEntity(dto.formacionesComplementarias());
        hijos.forEach(hijo -> hijo.setInscripcion(inscripcionCreada));
        List<FormacionComplementariaEty> formacionesCreadas = formacionComplementariaRepository.insertAll(hijos);

        return new InscripcionConFormacionComplementariaDto(
                inscripcionMapper.toDto(inscripcionCreada),
                formacionComplementariaMapper.toDto(formacionesCreadas)
        );
    }

    @Override
    public InscripcionConFormacionComplementariaDto actualizar(Long id, InscripcionConFormacionComplementariaRequestDto datosActualizados)  {
        InscripcionEty inscripcion = inscripcionRepository.findById(id).orElse(null);
        if (inscripcion == null) {
            return null;
        }

        inscripcionMapper.actualizarDesde(inscripcion, datosActualizados.inscripcion());
        InscripcionEty actualizado = inscripcionRepository.update(inscripcion);

        sincronizarFormacionesComplementarias(actualizado, datosActualizados.formacionesComplementarias());

        return inscripcionMapper.toDtoConFormaciones(actualizado);
    }


    // 3 llamadas al Repository (deleteAll/updateAll/insertAll), no una por fila -- crear()
    // usa formacionComplementariaMapper.toEntity(List) para convertir las nuevas de un
    // saque (RequestResponseMapper.toEntity(List), MapStruct), igual que crear().
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
                .collect(Collectors.toList());
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
                    .orElseThrow(() -> new ReglaDeNegocioException(
                            "No existe la formación complementaria " + entrante.id()));
            existente.setDescripcion(entrante.descripcion());
        }
        if (!existentes.isEmpty()) {
            formacionComplementariaRepository.updateAll(existentes);
        }

        // Crear: lo nuevo (entrada sin id), convertido entero de un saque.
        List<FormacionComplementariaRequestDto> nuevosDtos = entrantes.stream()
                .filter(entrante -> entrante.id() == null)
                .collect(Collectors.toList());
        if (!nuevosDtos.isEmpty()) {
            List<FormacionComplementariaEty> nuevos = formacionComplementariaMapper.toEntity(nuevosDtos);
            nuevos.forEach(hijo -> hijo.setInscripcion(inscripcion));
            List<FormacionComplementariaEty> creadas = formacionComplementariaRepository.insertAll(nuevos);
            existentes.addAll(creadas);
        }
    }
}