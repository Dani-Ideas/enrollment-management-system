package org.example.comun;

import java.util.List;

public interface RequestResponseMapper<E, REQ, RES> {

    RES toDto(E entity);
    E toEntity(REQ dto);
    List<RES> toDto(List<E> entities);
    List<E> toEntity(List<REQ> dtos);

    default void actualizarDesde(E entidad, REQ dto) {
        throw new UnsupportedOperationException(
                getClass().getSimpleName() + " no soporta actualizacion in-place");
    }
}