package org.example.estaticos.repository;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.estaticos.model.MiniFormAmbEty;

@Repository
public interface MiniFormAmbRepository extends CrudRepository<MiniFormAmbEty, Long> {
}
