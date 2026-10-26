package org.example.estaticos.lib;

import jakarta.data.repository.Query;
import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.estaticos.model.ColoniaEty;

import java.util.List;

@Repository
public interface ColoniaRepository extends CrudRepository<ColoniaEty, Long> {

    @Query("FROM ColoniaEty WHERE municipio.id = ?1")
    List<ColoniaEty> porMunicipio(Long municipioId);
}
