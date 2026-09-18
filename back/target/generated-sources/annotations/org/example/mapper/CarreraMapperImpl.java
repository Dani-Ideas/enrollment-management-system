package org.example.mapper;

import jakarta.enterprise.context.ApplicationScoped;
import javax.annotation.processing.Generated;
import org.example.dto.CarreraDto;
import org.example.model.Carrera;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-09-18T02:50:54-0600",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.12.1 (Arch Linux)"
)
@ApplicationScoped
public class CarreraMapperImpl implements CarreraMapper {

    @Override
    public CarreraDto toDto(Carrera carrera) {
        if ( carrera == null ) {
            return null;
        }

        Long id = null;
        String nombre = null;

        id = carrera.getId();
        nombre = carrera.getNombre();

        CarreraDto carreraDto = new CarreraDto( id, nombre );

        return carreraDto;
    }
}
