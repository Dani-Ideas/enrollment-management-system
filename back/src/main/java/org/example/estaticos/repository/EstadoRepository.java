package org.example.estaticos.repository;

import jakarta.data.repository.Query;
import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.estaticos.model.EstadoEty;

import java.util.List;

@Repository
public interface EstadoRepository extends CrudRepository<EstadoEty, Long> {

    @Query("FROM EstadoEty WHERE pais.id = ?1")
    List<EstadoEty> porPais(Long paisId);
}
