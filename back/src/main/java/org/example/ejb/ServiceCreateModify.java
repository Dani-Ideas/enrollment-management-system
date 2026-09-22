package org.example.ejb;

import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

// UN SOLO service de escritura (POST/PUT/DELETE) para TODOS los Controllers -- mismo
// patron que HelloJakarta-variante. Generico de verdad via EntityManager, sin Mapper ni
// DTO -- recibe y devuelve la Entity tal cual.
//
// @Stateless, no @Singleton: a diferencia de ServiceRead (que ServiceArtifax cachea
// encima), escribir no necesita estado compartido entre llamadas.
@Stateless
public class ServiceCreateModify {

    @PersistenceContext(unitName = "SistemaMatriculasPU")
    private EntityManager em;

    // POST: persist() necesita una entidad NUEVA (sin fila todavia en la BD). Con
    // GenerationType.SEQUENCE (todas las entidades de este proyecto), el id se reserva de
    // la secuencia y queda poblado en el objeto sin flush() manual.
    public <T> T crear(T entidad) {
        em.persist(entidad);
        return entidad;
    }

    // PUT: merge() es el equivalente generico de "buscar por id + copiar campos + guardar".
    public <T> T actualizar(T entidad) {
        return em.merge(entidad);
    }

    // DELETE: em.remove() exige una entidad "managed" -- por eso primero se busca con
    // find(), nunca se le pasa a remove() una entidad "suelta" armada a mano.
    public <T> boolean eliminar(Class<T> tipo, Object id) {
        T entidad = em.find(tipo, id);
        if (entidad == null) {
            return false;
        }
        em.remove(entidad);
        return true;
    }
}
