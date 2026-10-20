package org.example.toErrace;

import java.io.Serializable;

public record CatEtapaInscripcionDto(
        Integer id,
        String nombre
) implements Serializable {
}
