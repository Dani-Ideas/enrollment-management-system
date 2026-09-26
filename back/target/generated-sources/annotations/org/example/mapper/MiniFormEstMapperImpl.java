package org.example.mapper;

import jakarta.enterprise.context.ApplicationScoped;
import javax.annotation.processing.Generated;
import org.example.dto.MiniFormEstDto;
import org.example.model.MiniFormEstEty;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-09-25T22:21:53-0600",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.12.1 (Arch Linux)"
)
@ApplicationScoped
public class MiniFormEstMapperImpl implements MiniFormEstMapper {

    @Override
    public MiniFormEstDto toDto(MiniFormEstEty estado) {
        if ( estado == null ) {
            return null;
        }

        Long id = null;
        String estado1 = null;

        id = estado.getId();
        estado1 = estado.getEstado();

        MiniFormEstDto miniFormEstDto = new MiniFormEstDto( id, estado1 );

        return miniFormEstDto;
    }
}
