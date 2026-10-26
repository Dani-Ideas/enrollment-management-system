package org.example.estaticos.lib;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.estaticos.model.TipoDireccionEty;

@Repository
public interface TipoDireccionRepository extends CrudRepository<TipoDireccionEty, Long> {
}
