package org.example.comun;

import java.util.List;

// Contrato generico para mappers ASIMETRICOS -- el DTO de entrada (REQ) y el de salida
// (RES) son clases distintas. Implementadores: InscripcionMapper, FormacionComplementariaMapper.
//
// Las dos firmas en lista NO llevan logica propia -- MapStruct genera solas el loop sobre
// toDto(E)/toEntity(REQ) (los de un solo elemento, ya implementados en cada Mapper) para
// cualquier interfaz que extienda esta. Asi insertAll()/toDto() sobre una lista completa no
// necesitan un loop a mano en el service.
public interface RequestResponseMapper<E, REQ, RES> {

    RES toDto(E entity);

    E toEntity(REQ dto);

    List<RES> toDto(List<E> entities);

    List<E> toEntity(List<REQ> dtos);
}
