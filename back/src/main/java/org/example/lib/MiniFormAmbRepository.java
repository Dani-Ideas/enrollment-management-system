package org.example.lib;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.model.MiniFormAmb;

@Repository
public interface MiniFormAmbRepository extends CrudRepository<MiniFormAmb, Long> {
}
