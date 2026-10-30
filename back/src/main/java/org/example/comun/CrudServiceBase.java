package org.example.comun;

import jakarta.data.repository.CrudRepository;

import java.util.List;

// Lo que listar()/buscarPorId() hacen en CADA ...ServiceImpl (ir al Repository, mapear a
// DTO, 404 si no existe) es siempre el mismo codigo -- esta clase lo escribe una sola vez.
//
// Polimorfismo de SUBTIPOS (repository()/mapper() son abstractos; cada subclase devuelve
// su propio Repository/Mapper concreto) + GENERICO (<E,K,REQ,RES> mantiene todo tipado, sin
// casts ni Object) -- no el de interface-vs-clase-abstracta: eso decide COMO se declara un
// contrato, esto decide QUE implementacion corre en tiempo de ejecucion.
//
// Un service con logica propia (InscripcionServiceImpl sincroniza sus formaciones hijas)
// extiende esta clase igual: sobreescribe listar() si necesita otra consulta (ver
// InscripcionRepository.listarConCatalogos(), JOIN FETCH) y deja crear()/actualizar() 100%
// a su cargo -- no hace falta que TODO el service sea CRUD puro para aprovechar la parte
// que si lo es.
//
// Deliberadamente NO incluye crear()/actualizar() genericos: ningun service los necesita
// hoy igual entre si (InscripcionServiceImpl inserta hijos aparte, DireccionServiceImpl
// filtra por padre). Agregarlos sin un segundo caso de uso real seria el mismo codigo
// muerto que se limpio en la etapa 1.
public abstract class CrudServiceBase<E, K, REQ, RES> {

    protected abstract CrudRepository<E, K> repository();

    protected abstract RequestResponseMapper<E, REQ, RES> mapper();

    // Cada entidad redacta su propio mensaje ("No existe la persona 5") -- RES/REQ no traen
    // un nombre legible en tiempo de ejecucion (los generics se borran al compilar).
    protected abstract String mensajeNoEncontrado(K id);

    public List<RES> listar() {
        return mapper().toDto(repository().findAll().toList());
    }

    public RES buscarPorId(K id) {
        return mapper().toDto(obtener(id));
    }

    // Protegido, no publico: lo usan los subtipos que necesitan la ENTIDAD (no el DTO) para
    // seguir operando sobre ella -- ver InscripcionServiceImpl.actualizar()/listarFormaciones().
    protected E obtener(K id) {
        return repository().findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(mensajeNoEncontrado(id)));
    }
}
