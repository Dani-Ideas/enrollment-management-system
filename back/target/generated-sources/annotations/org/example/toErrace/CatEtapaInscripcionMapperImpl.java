package org.example.toErrace;

import jakarta.enterprise.context.ApplicationScoped;
import javax.annotation.processing.Generated;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-10-20T11:23:23-0600",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.12.1 (Arch Linux)"
)
@ApplicationScoped
public class CatEtapaInscripcionMapperImpl implements CatEtapaInscripcionMapper {

    @Override
    public CatEtapaInscripcionDto toDto(CatEtapaInscripcionEty entity) {
        if ( entity == null ) {
            return null;
        }

        Integer id = null;
        String nombre = null;

        id = entity.getId();
        nombre = entity.getNombre();

        CatEtapaInscripcionDto catEtapaInscripcionDto = new CatEtapaInscripcionDto( id, nombre );

        return catEtapaInscripcionDto;
    }
}
