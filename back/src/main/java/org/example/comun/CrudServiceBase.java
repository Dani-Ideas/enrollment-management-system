package org.example.comun;

import jakarta.data.repository.CrudRepository;

import java.util.List;

public abstract class CrudServiceBase<E, K, REQ, RES> {

    protected abstract CrudRepository<E, K> repository();
    protected abstract RequestResponseMapper<E, REQ, RES> mapper();

    public List<RES> listar() {
        return mapper().toDto(repository().findAll().toList());
    }

    public RES buscarPorId(K id) {
        return mapper().toDto(obtener(id));
    }

    // Insert + map, nada mas -- un service con insercion compuesta (InscripcionServiceImpl
    // crea hijos aparte) sobreescribe esto igual que sobreescribe listar().
    public RES crear(REQ dto) {
        return mapper().toDto(repository().insert(mapper().toEntity(dto)));
    }

    // Solo funciona si mapper().actualizarDesde(...) esta sobreescrito (ver su default en
    // RequestResponseMapper): si no, lanza UnsupportedOperationException en vez de un
    // 404/422 falso.
    public RES actualizar(K id, REQ dto) {
        E existente = obtener(id);
        mapper().actualizarDesde(existente, dto);
        return mapper().toDto(repository().update(existente));
    }

    public void eliminar(K id) {
        repository().delete(obtener(id));
    }

    protected abstract String mensajeNoEncontrado(K id);

    protected E obtener(K id) {
        return repository().findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(mensajeNoEncontrado(id)));
    }
}
