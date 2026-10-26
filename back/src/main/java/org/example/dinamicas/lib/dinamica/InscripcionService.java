package org.example.dinamicas.lib.dinamica;

import org.example.dinamicas.dto.dinamica.InscripcionConFormacionComplementariaDto;
import org.example.dinamicas.dto.dinamica.InscripcionConFormacionComplementariaRequestDto;
import org.example.dinamicas.dto.dinamica.InscripcionDto;

import java.util.List;

// Inscripcion y sus FormacionComplementaria son una relacion 1:N (ver InscripcionEty.
// formacionesComplementarias, @OneToMany) -- no hace falta un service separado para el
// lado "N": las escrituras de FormacionComplementaria viven aca tambien, junto a las de su
// padre.
public interface InscripcionService {

    // Cada parametro null significa "no filtrar por ese campo" (listar(null, null, null)
    // devuelve todo). Filtra siempre contra InscripcionRepository -- InscripcionEty NO se
    // cachea en ServiceArtifax (esa cache es solo para los 4 catalogos estaticos).
    List<InscripcionDto> listar();

    InscripcionDto buscarPorId(Long id);
    
    // UNA sola peticion HTTP tambien para editar: actualiza los datos propios de la
    // Inscripcion (y sus 6 FK) Y sincroniza la lista completa de FormacionComplementaria
    // contra lo que ya existe en la base (borra lo que el cliente sacó de la lista, actualiza
    // lo que sigue, crea lo nuevo) -- ver InscripcionServiceImpl.
    InscripcionConFormacionComplementariaDto actualizar(Long id, InscripcionConFormacionComplementariaRequestDto datosActualizados);

    // UNA sola peticion HTTP: crea la Inscripcion y sus formaciones complementarias juntas
    // -- ver InscripcionServiceImpl.
    InscripcionConFormacionComplementariaDto crear(InscripcionConFormacionComplementariaRequestDto dto);
}
