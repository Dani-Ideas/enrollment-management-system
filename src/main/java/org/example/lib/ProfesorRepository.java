package org.example.lib;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.model.Profesor;

@Repository
public interface ProfesorRepository extends CrudRepository<Profesor, Long> {
}
