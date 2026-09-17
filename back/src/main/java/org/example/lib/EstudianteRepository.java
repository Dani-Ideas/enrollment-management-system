package org.example.lib;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.model.Estudiante;

import java.util.Optional;

@Repository
public interface EstudianteRepository extends CrudRepository<Estudiante, Long> {

    // Metodo derivado por nombre (Jakarta Data arma la query JPQL sola a partir del nombre
    // del metodo) -- evita traer TODA la tabla a memoria solo para buscar un username. No
    // probado antes en este stack (HelloJakarta-variante solo uso los metodos base de
    // CrudRepository) -- se verifica con un deploy real antes de confiar en el.
    Optional<Estudiante> findByUsername(String username);
}
