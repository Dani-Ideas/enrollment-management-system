package org.example.ejb;

import jakarta.ejb.EJB;
import jakarta.ejb.Stateless;
import org.example.dto.FormacionComplementariaDto;
import org.example.dto.FormacionComplementariaRequestDto;
import org.example.dto.InscripcionCompuestaDto;
import org.example.dto.InscripcionCompuestaRequestDto;
import org.example.dto.InscripcionDto;
import org.example.dto.TablasInscripcionDto;
import org.example.lib.CatalogosInscripcionService;
import org.example.lib.FormacionComplementariaService;
import org.example.lib.InscripcionService;
import org.example.lib.ServiceArtifax;

import java.util.List;
import java.util.stream.Collectors;

@Stateless
public class CatalogosInscripcionServiceImpl implements CatalogosInscripcionService {

    // Los 4 catalogos siguen cacheados en ServiceArtifax (son estaticos el 99% del tiempo,
    // ahi es donde corresponde cachearlos) -- este service solo delega, no duplica el cache.
    @EJB
    private ServiceArtifax serviceArtifax;

    @EJB
    private InscripcionService inscripcionService;

    @EJB
    private FormacionComplementariaService formacionComplementariaService;

    @Override
    public TablasInscripcionDto tablas() {
        return serviceArtifax.tablasInscripcion();
    }

    // Antes esto eran 2 peticiones HTTP separadas (el front creaba la Inscripcion, esperaba
    // la confirmacion con el id real, y recien ahi mandaba un POST por cada formacion
    // complementaria). Ahora entra todo en una sola llamada: se crea la Inscripcion primero
    // (adentro de InscripcionService.crear(), que ya avisa a ServiceArtifax), y con su id ya
    // real se crea cada formacion complementaria una por una. Al ser un solo metodo @Stateless
    // (transaccion CMT por defecto), si alguna falla (ReglaDeNegocioException es
    // RuntimeException -> el contenedor marca rollback-only) la Inscripcion recien creada
    // se revierte tambien -- no queda una Inscripcion "huerfana" sin sus formaciones.
    @Override
    public InscripcionCompuestaDto crearInscripcionConFormaciones(InscripcionCompuestaRequestDto dto) {
        InscripcionDto inscripcionCreada = inscripcionService.crear(dto.inscripcion());

        List<String> descripciones = dto.formacionesComplementarias() == null
                ? List.of()
                : dto.formacionesComplementarias().stream()
                        .map(String::trim)
                        .filter(descripcion -> !descripcion.isEmpty())
                        .toList();

        List<FormacionComplementariaDto> formacionesCreadas = descripciones.stream()
                .map(descripcion -> formacionComplementariaService.crear(
                        new FormacionComplementariaRequestDto(inscripcionCreada.id(), descripcion)))
                .collect(Collectors.toList());

        return new InscripcionCompuestaDto(inscripcionCreada, formacionesCreadas);
    }
}
