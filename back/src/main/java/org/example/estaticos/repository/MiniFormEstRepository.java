package org.example.estaticos.repository;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.estaticos.model.MiniFormEstEty;

@Repository
public interface MiniFormEstRepository extends CrudRepository<MiniFormEstEty, Long> {
}
