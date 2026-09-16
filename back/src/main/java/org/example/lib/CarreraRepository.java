package org.example.lib;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.model.Carrera;

@Repository
public interface CarreraRepository extends CrudRepository<Carrera, Long> {
}
