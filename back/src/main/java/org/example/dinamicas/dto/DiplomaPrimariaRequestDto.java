package org.example.dinamicas.dto;

import jakarta.validation.constraints.NotNull;

import java.io.Serializable;

// Forma de ENTRADA -- sin "emitido"/"fechaEmision": los calcula el servidor
// (DiplomaPrimariaServiceImpl), nunca llegan del cliente.
public record DiplomaPrimariaRequestDto(
        @NotNull Long inscripcion,
        boolean firmaMaestro1ro,
        boolean firmaMaestro2do,
        boolean firmaMaestro3ro,
        boolean firmaMaestro4to,
        boolean firmaMaestro5to,
        boolean firmaMaestro6to,
        boolean firmaDirectorPrimaria
) implements Serializable {
}
