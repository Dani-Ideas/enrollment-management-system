package org.example.mapper;

import jakarta.enterprise.context.ApplicationScoped;
import javax.annotation.processing.Generated;
import org.example.dto.MiniFormAmbDto;
import org.example.model.MiniFormAmbEty;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-09-25T22:21:53-0600",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.12.1 (Arch Linux)"
)
@ApplicationScoped
public class MiniFormAmbMapperImpl implements MiniFormAmbMapper {

    @Override
    public MiniFormAmbDto toDto(MiniFormAmbEty ambiente) {
        if ( ambiente == null ) {
            return null;
        }

        Long id = null;
        String nombre = null;

        id = ambiente.getId();
        nombre = ambiente.getNombre();

        MiniFormAmbDto miniFormAmbDto = new MiniFormAmbDto( id, nombre );

        return miniFormAmbDto;
    }
}
