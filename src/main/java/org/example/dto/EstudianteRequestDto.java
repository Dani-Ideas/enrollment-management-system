package org.example.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;

// DTO de ENTRADA para crear una cuenta de estudiante (registro/signup). "password" viaja en
// texto plano SOLO en este request (HTTPS en un despliegue real) -- el servidor lo hashea
// antes de guardar, nunca se persiste ni se devuelve tal cual (ver
// EstudianteServiceImpl.crear() y PasswordHasher).
public record EstudianteRequestDto(
        @NotNull @Size(min = 3, max = 255)
        String username,
        @NotNull @Size(min = 6)
        String password,
        @NotNull
        Long carreraId
) implements Serializable {
}
