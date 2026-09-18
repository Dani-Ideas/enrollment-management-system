package org.example.lib;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.model.MiniFormEst;

@Repository
public interface MiniFormEstRepository extends CrudRepository<MiniFormEst, Long> {
}
