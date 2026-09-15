package org.example.dto;

import jakarta.validation.constraints.NotNull;

import java.io.Serializable;

// DTO de ENTRADA para que un admin cree una Clase (asignar profesor a una materia) -- fuera
// del foco "estudiante se matricula", pero necesario para que el sistema sea testeable de
// punta a punta sin depender solo de los datos sembrados en DatosIniciales.
public record ClaseRequestDto(
        @NotNull Long materiaId,
        @NotNull Long profesorId
) implements Serializable {
}
