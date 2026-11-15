package org.example.dinamicas.repository;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.dinamicas.model.DiplomaPrimariaEty;

@Repository
public interface DiplomaPrimariaRepository extends CrudRepository<DiplomaPrimariaEty, Long> {
}
