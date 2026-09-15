package org.example.lib;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.model.Clase;

@Repository
public interface ClaseRepository extends CrudRepository<Clase, Long> {
}
