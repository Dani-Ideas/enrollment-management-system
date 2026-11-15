package org.example.dinamicas.dto;

import jakarta.validation.constraints.NotNull;

import java.io.Serializable;

// "diplomaPrimaria": la FK de encadenamiento -- @NotNull porque sin ella no hay diploma de
// secundaria posible. El service valida que ademas de existir, este completo (409 si no).
public record DiplomaSecundariaRequestDto(
        @NotNull Long diplomaPrimaria,
        boolean firmaMaestroPrimerGrado,
        boolean firmaMaestroSegundoGrado,
        boolean firmaMaestroTercerGrado,
        boolean firmaOrientador,
        boolean firmaDirectorSecundaria
) implements Serializable {
}
