package org.example.dinamicas.ejb;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

// Jakarta Data (JNoSQL en GlassFish) busca el EntityManager como bean de CDI -- dentro del
// EAR nadie lo publica solo, asi que los @Repository fallan con "Found no entity manager".
@ApplicationScoped
public class EntityManagerProducer {

    @Produces
    @PersistenceContext(unitName = "SistemaMatriculasPU")
    private EntityManager em;
}
