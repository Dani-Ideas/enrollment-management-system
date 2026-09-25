package org.example.mapper;

import jakarta.enterprise.context.ApplicationScoped;
import javax.annotation.processing.Generated;
import org.example.dto.FormacionComplementariaDto;
import org.example.dto.FormacionComplementariaRequestDto;
import org.example.model.Form;
import org.example.model.FormacionComplementaria;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-09-25T03:26:03-0600",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.12.1 (Arch Linux)"
)
@ApplicationScoped
public class FormacionComplementariaMapperImpl implements FormacionComplementariaMapper {

    @Override
    public FormacionComplementariaDto toDto(FormacionComplementaria entidad) {
        if ( entidad == null ) {
            return null;
        }

        Long inscripcionId = null;
        Long id = null;
        String descripcion = null;

        inscripcionId = entidadInscripcionId( entidad );
        id = entidad.getId();
        descripcion = entidad.getDescripcion();

        FormacionComplementariaDto formacionComplementariaDto = new FormacionComplementariaDto( id, inscripcionId, descripcion );

        return formacionComplementariaDto;
    }

    @Override
    public FormacionComplementaria toEntity(FormacionComplementariaRequestDto dto) {
        if ( dto == null ) {
            return null;
        }

        FormacionComplementaria formacionComplementaria = new FormacionComplementaria();

        formacionComplementaria.setInscripcion( desdeId( dto.inscripcionId() ) );
        formacionComplementaria.setDescripcion( dto.descripcion() );

        return formacionComplementaria;
    }

    private Long entidadInscripcionId(FormacionComplementaria formacionComplementaria) {
        Form inscripcion = formacionComplementaria.getInscripcion();
        if ( inscripcion == null ) {
            return null;
        }
        return inscripcion.getId();
    }
}
