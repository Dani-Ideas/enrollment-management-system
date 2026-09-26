package org.example.ejb;

import jakarta.ejb.Singleton;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.List;

// UN SOLO service de lectura para TODOS los Controllers -- mismo patron que
// HelloJakarta-variante (ver su bitacora-fixes.md incidente #29). "Generico" aqui es
// literal: no conoce MiniFormEstEty/MiniFormSisEty/etc., solo Class<T> -- por eso usa
// EntityManager directo en vez de los XRepository de Jakarta Data (esos son uno por
// entidad, no se pueden invocar por reflexion sin volverse fragil).
//
// Devuelve la Entity tal cual, sin DTO ni Mapper -- el unico de este trio que usa Mapper
// es ServiceArtifax.
@Singleton
public class ServiceRead {

    @PersistenceContext(unitName = "SistemaMatriculasPU")
    private EntityManager em;

    public <T> T getById(Class<T> tipo, Object id) {
        return em.find(tipo, id);
    }

    // El nombre de entidad JPQL default es el simple name de la clase -- funciona porque
    // ninguna @Entity de este proyecto fija un @Entity(name = "...") distinto.
    public <T> List<T> getList(Class<T> tipo) {
        return em.createQuery("SELECT e FROM " + tipo.getSimpleName() + " e", tipo)
                .getResultList();
    }
}
