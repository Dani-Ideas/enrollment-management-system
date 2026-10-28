package org.example.estaticos.repository;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.estaticos.model.PaisEty;

@Repository
public interface PaisRepository extends CrudRepository<PaisEty, Long> {
}
