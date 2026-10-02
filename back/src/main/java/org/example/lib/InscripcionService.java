package org.example.lib;

import org.example.dto.FormacionComplementariaDto;
import org.example.dto.FormacionComplementariaRequestDto;
import org.example.dto.InscripcionConFormacionComplementariaDto;
import org.example.dto.InscripcionConFormacionComplementariaRequestDto;
import org.example.dto.InscripcionDto;
import org.example.dto.InscripcionRequestDto;

import java.util.List;

// Inscripcion y sus FormacionComplementaria son una relacion 1:N (ver InscripcionEty.
// formacionesComplementarias, @OneToMany) -- no hace falta un service separado para el
// lado "N": las escrituras de FormacionComplementaria viven aca tambien, junto a las de su
// padre.
public interface InscripcionService {

    List<InscripcionDto> listar();

    InscripcionDto buscarPorId(Long id);

    InscripcionDto crear(InscripcionRequestDto dto);

    InscripcionDto actualizar(Long id, InscripcionRequestDto dto);

    // UNA sola peticion HTTP: crea la Inscripcion y sus formaciones complementarias juntas,
    // en la misma transaccion -- ver InscripcionMapper.toEntityConFormaciones()
    // (@OneToMany cascade=PERSIST hace que persistir la Inscripcion persista los hijos solo).
    InscripcionConFormacionComplementariaDto crearConFormaciones(InscripcionConFormacionComplementariaRequestDto dto);

    FormacionComplementariaDto crearFormacionComplementaria(FormacionComplementariaRequestDto dto);

    FormacionComplementariaDto actualizarFormacionComplementaria(Long id, FormacionComplementariaRequestDto dto);

    boolean eliminarFormacionComplementaria(Long id);
}
