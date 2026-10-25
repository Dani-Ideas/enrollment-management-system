package org.example.lib;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.model.InscripcionEty;

@Repository
public interface InscripcionRepository extends CrudRepository<InscripcionEty, Long> {
}
