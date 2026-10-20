package org.example.toErrace;

import java.io.Serializable;

public record CatTipoArquitecturaDto(
        Integer id,
        String nombre
) implements Serializable {
}
