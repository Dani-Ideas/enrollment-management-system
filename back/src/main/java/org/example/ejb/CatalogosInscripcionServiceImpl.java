package org.example.ejb;

import jakarta.ejb.EJB;
import jakarta.ejb.Stateless;
import org.example.dto.TablasInscripcionDto;
import org.example.lib.CatalogosInscripcionService;
import org.example.lib.ServiceArtifax;

@Stateless
public class CatalogosInscripcionServiceImpl implements CatalogosInscripcionService {

    // Los 4 catalogos siguen cacheados en ServiceArtifax (son estaticos el 99% del tiempo,
    // ahi es donde corresponde cachearlos) -- este service solo delega, no duplica el cache.
    @EJB
    private ServiceArtifax serviceArtifax;

    @Override
    public TablasInscripcionDto tablas() {
        return serviceArtifax.tablasInscripcion();
    }
}
