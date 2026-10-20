package org.example.toErrace;

import jakarta.enterprise.context.ApplicationScoped;
import javax.annotation.processing.Generated;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-10-20T11:23:23-0600",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.12.1 (Arch Linux)"
)
@ApplicationScoped
public class SolNInscripcionChecklistTemplateMapperImpl implements SolNInscripcionChecklistTemplateMapper {

    @Override
    public SolNInscripcionChecklistTemplateDto toDto(SolNInscripcionChecklistTemplateEty entity) {
        if ( entity == null ) {
            return null;
        }

        Integer idTipoArquitectura = null;
        String tipoArquitectura = null;
        String nombre = null;
        Integer orden = null;
        String etapaInscripcion = null;
        String seccion = null;
        String actividad = null;
        String descripcion = null;
        String conexion = null;
        String comentario = null;

        idTipoArquitectura = entityIdIdTipoArquitectura( entity );
        tipoArquitectura = entityIdTipoArquitecturaNombre( entity );
        nombre = entityIdNombre( entity );
        orden = entityIdOrden( entity );
        etapaInscripcion = entityIdEtapaInscripcionNombre( entity );
        seccion = entity.getSeccion();
        actividad = entity.getActividad();
        descripcion = entity.getDescripcion();
        conexion = entity.getConexion();
        comentario = entity.getComentario();

        SolNInscripcionChecklistTemplateDto solNInscripcionChecklistTemplateDto = new SolNInscripcionChecklistTemplateDto( idTipoArquitectura, tipoArquitectura, nombre, orden, etapaInscripcion, seccion, actividad, descripcion, conexion, comentario );

        return solNInscripcionChecklistTemplateDto;
    }

    private Integer entityIdIdTipoArquitectura(SolNInscripcionChecklistTemplateEty solNInscripcionChecklistTemplateEty) {
        SolNInscripcionChecklistTemplateId id = solNInscripcionChecklistTemplateEty.getId();
        if ( id == null ) {
            return null;
        }
        return id.getIdTipoArquitectura();
    }

    private String entityIdTipoArquitecturaNombre(SolNInscripcionChecklistTemplateEty solNInscripcionChecklistTemplateEty) {
        CatTipoArquitecturaEty idTipoArquitectura = solNInscripcionChecklistTemplateEty.getIdTipoArquitectura();
        if ( idTipoArquitectura == null ) {
            return null;
        }
        return idTipoArquitectura.getNombre();
    }

    private String entityIdNombre(SolNInscripcionChecklistTemplateEty solNInscripcionChecklistTemplateEty) {
        SolNInscripcionChecklistTemplateId id = solNInscripcionChecklistTemplateEty.getId();
        if ( id == null ) {
            return null;
        }
        return id.getNombre();
    }

    private Integer entityIdOrden(SolNInscripcionChecklistTemplateEty solNInscripcionChecklistTemplateEty) {
        SolNInscripcionChecklistTemplateId id = solNInscripcionChecklistTemplateEty.getId();
        if ( id == null ) {
            return null;
        }
        return id.getOrden();
    }

    private String entityIdEtapaInscripcionNombre(SolNInscripcionChecklistTemplateEty solNInscripcionChecklistTemplateEty) {
        CatEtapaInscripcionEty idEtapaInscripcion = solNInscripcionChecklistTemplateEty.getIdEtapaInscripcion();
        if ( idEtapaInscripcion == null ) {
            return null;
        }
        return idEtapaInscripcion.getNombre();
    }
}
