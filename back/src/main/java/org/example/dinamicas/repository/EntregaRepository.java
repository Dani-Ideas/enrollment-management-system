package org.example.dinamicas.repository;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.dinamicas.model.EntregaEty;
import org.example.dinamicas.model.EntregaId;

@Repository
public interface EntregaRepository extends CrudRepository<EntregaEty, EntregaId> {
}
