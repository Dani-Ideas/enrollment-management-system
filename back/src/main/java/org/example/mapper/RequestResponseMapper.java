package org.example.mapper;

// Contrato generico para mappers ASIMETRICOS -- el DTO de entrada (REQ) y el de salida
// (RES) son clases distintas. Solo EstudianteMapper lo implementa en este proyecto:
// Clase/Matricula tambien tienen esa asimetria, pero su construccion pasa por un Builder
// (necesita entidades completas para validar reglas cruzadas), no por un toEntity()
// puramente estructural -- ver ClaseMapper/MatriculaMapper.
public interface RequestResponseMapper<E, REQ, RES> {

    RES toDto(E entity);

    E toEntity(REQ dto);
}
