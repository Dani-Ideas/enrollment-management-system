package org.example.dinamicas.lib;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.dinamicas.dinamica.InscripcionEty;

@Repository
public interface InscripcionRepository extends CrudRepository<InscripcionEty, Long> {
}
