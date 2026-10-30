package org.example.estaticos.repository;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.estaticos.model.TipoDireccionEty;

@Repository
public interface TipoDireccionRepository extends CrudRepository<TipoDireccionEty, Long> {
}
