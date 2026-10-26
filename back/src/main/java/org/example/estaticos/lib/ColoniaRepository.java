package org.example.estaticos.lib;

import jakarta.data.repository.By;
import jakarta.data.repository.Find;
import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.estaticos.model.ColoniaEty;

import java.util.List;

@Repository
public interface ColoniaRepository extends CrudRepository<ColoniaEty, Long> {

    @Find
    List<ColoniaEty> porMunicipio(@By("municipio.id") Long municipioId);
}
