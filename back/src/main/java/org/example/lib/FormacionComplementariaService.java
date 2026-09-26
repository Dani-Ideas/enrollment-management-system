package org.example.lib;

import org.example.dto.FormacionComplementariaDto;
import org.example.dto.FormacionComplementariaRequestDto;

// Escrituras de FormacionComplementariaEty -- separado de ServiceArtifax a proposito: un
// cache no tiene metodos de creacion/edicion/eliminacion, esos viven aca (mismo patron que
// InscripcionService/InscripcionServiceImpl). ServiceArtifax solo se entera de estas
// escrituras despues, via refrescarFormacionComplementaria()/removerFormacionComplementaria().
public interface FormacionComplementariaService {

    FormacionComplementariaDto crear(FormacionComplementariaRequestDto dto);

    FormacionComplementariaDto actualizar(Long id, FormacionComplementariaRequestDto dto);

    boolean eliminar(Long id);
}
