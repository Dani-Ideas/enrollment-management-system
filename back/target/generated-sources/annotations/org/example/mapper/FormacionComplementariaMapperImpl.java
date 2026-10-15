package org.example.mapper;

import jakarta.enterprise.context.ApplicationScoped;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.example.dto.FormacionComplementariaDto;
import org.example.dto.FormacionComplementariaRequestDto;
import org.example.model.FormacionComplementariaEty;
import org.example.model.InscripcionEty;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-10-15T00:59:13-0600",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.12.1 (Arch Linux)"
)
@ApplicationScoped
public class FormacionComplementariaMapperImpl implements FormacionComplementariaMapper {

    @Override
    public List<FormacionComplementariaDto> toDto(List<FormacionComplementariaEty> entities) {
        if ( entities == null ) {
            return null;
        }

        List<FormacionComplementariaDto> list = new ArrayList<FormacionComplementariaDto>( entities.size() );
        for ( FormacionComplementariaEty formacionComplementariaEty : entities ) {
            list.add( toDto( formacionComplementariaEty ) );
        }

        return list;
    }

    @Override
    public List<FormacionComplementariaEty> toEntity(List<FormacionComplementariaRequestDto> dtos) {
        if ( dtos == null ) {
            return null;
        }

        List<FormacionComplementariaEty> list = new ArrayList<FormacionComplementariaEty>( dtos.size() );
        for ( FormacionComplementariaRequestDto formacionComplementariaRequestDto : dtos ) {
            list.add( toEntity( formacionComplementariaRequestDto ) );
        }

        return list;
    }

    @Override
    public FormacionComplementariaDto toDto(FormacionComplementariaEty entidad) {
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
    public FormacionComplementariaEty toEntity(FormacionComplementariaRequestDto dto) {
        if ( dto == null ) {
            return null;
        }

        FormacionComplementariaEty formacionComplementariaEty = new FormacionComplementariaEty();

        formacionComplementariaEty.setInscripcion( desdeId( dto.inscripcionId() ) );
        formacionComplementariaEty.setDescripcion( dto.descripcion() );

        return formacionComplementariaEty;
    }

    private Long entidadInscripcionId(FormacionComplementariaEty formacionComplementariaEty) {
        InscripcionEty inscripcion = formacionComplementariaEty.getInscripcion();
        if ( inscripcion == null ) {
            return null;
        }
        return inscripcion.getId();
    }
}
