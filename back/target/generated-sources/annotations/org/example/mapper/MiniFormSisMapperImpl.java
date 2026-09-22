package org.example.mapper;

import jakarta.enterprise.context.ApplicationScoped;
import javax.annotation.processing.Generated;
import org.example.dto.MiniFormSisDto;
import org.example.model.MiniFormSis;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-09-22T09:30:23-0600",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.12.1 (Arch Linux)"
)
@ApplicationScoped
public class MiniFormSisMapperImpl implements MiniFormSisMapper {

    @Override
    public MiniFormSisDto toDto(MiniFormSis sistema) {
        if ( sistema == null ) {
            return null;
        }

        Long id = null;
        String nombre = null;

        id = sistema.getId();
        nombre = sistema.getNombre();

        MiniFormSisDto miniFormSisDto = new MiniFormSisDto( id, nombre );

        return miniFormSisDto;
    }
}
