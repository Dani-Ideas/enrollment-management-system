package org.example.toErrace;

import java.util.List;

public interface CatTipoArquitecturaService {

    List<CatTipoArquitecturaDto> listar();

    CatTipoArquitecturaDto buscarPorId(Integer id);
}
