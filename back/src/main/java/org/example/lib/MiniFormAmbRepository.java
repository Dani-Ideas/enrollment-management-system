package org.example.lib;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.model.MiniFormAmbEty;

@Repository
public interface MiniFormAmbRepository extends CrudRepository<MiniFormAmbEty, Long> {
}
