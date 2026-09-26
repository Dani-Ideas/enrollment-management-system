package org.example.mapper;

import jakarta.enterprise.context.ApplicationScoped;
import javax.annotation.processing.Generated;
import org.example.dto.MiniFormRespDto;
import org.example.model.MiniFormRespEty;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-09-25T22:21:53-0600",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.12.1 (Arch Linux)"
)
@ApplicationScoped
public class MiniFormRespMapperImpl implements MiniFormRespMapper {

    @Override
    public MiniFormRespDto toDto(MiniFormRespEty responsable) {
        if ( responsable == null ) {
            return null;
        }

        Long id = null;
        String nombreLargo = null;

        id = responsable.getId();
        nombreLargo = responsable.getNombreLargo();

        MiniFormRespDto miniFormRespDto = new MiniFormRespDto( id, nombreLargo );

        return miniFormRespDto;
    }
}
