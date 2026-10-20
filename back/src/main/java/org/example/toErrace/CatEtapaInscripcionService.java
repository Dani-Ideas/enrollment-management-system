package org.example.toErrace;

import java.util.List;

public interface CatEtapaInscripcionService {

    List<CatEtapaInscripcionDto> listar();

    CatEtapaInscripcionDto buscarPorId(Integer id);
}
