package org.example.lib;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.model.MiniFormEstEty;

@Repository
public interface MiniFormEstRepository extends CrudRepository<MiniFormEstEty, Long> {
}
