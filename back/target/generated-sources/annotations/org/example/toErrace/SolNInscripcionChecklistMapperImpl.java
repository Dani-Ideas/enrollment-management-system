package org.example.toErrace;

import jakarta.enterprise.context.ApplicationScoped;
import javax.annotation.processing.Generated;
import org.example.model.InscripcionEty;
import org.example.model.MiniFormEstEty;
import org.example.model.MiniFormRespEty;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-10-20T11:23:23-0600",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.12.1 (Arch Linux)"
)
@ApplicationScoped
public class SolNInscripcionChecklistMapperImpl implements SolNInscripcionChecklistMapper {

    @Override
    public SolNInscripcionChecklistDto toDto(SolNInscripcionChecklistEty entity) {
        if ( entity == null ) {
            return null;
        }

        String inscripcion = null;
        String etapaInscripcion = null;
        String estado = null;
        String responsable = null;
        Integer id = null;
        String seccion = null;
        String actividad = null;
        String descripcion = null;
        String conexion = null;
        String comentario = null;

        inscripcion = entityIdInscripcionProyecto( entity );
        etapaInscripcion = entityIdEtapaInscripcionNombre( entity );
        estado = entityIdEstadoEstado( entity );
        responsable = entityIdResponsableNombreLargo( entity );
        id = entity.getId();
        seccion = entity.getSeccion();
        actividad = entity.getActividad();
        descripcion = entity.getDescripcion();
        conexion = entity.getConexion();
        comentario = entity.getComentario();

        SolNInscripcionChecklistDto solNInscripcionChecklistDto = new SolNInscripcionChecklistDto( id, inscripcion, etapaInscripcion, estado, responsable, seccion, actividad, descripcion, conexion, comentario );

        return solNInscripcionChecklistDto;
    }

    private String entityIdInscripcionProyecto(SolNInscripcionChecklistEty solNInscripcionChecklistEty) {
        InscripcionEty idInscripcion = solNInscripcionChecklistEty.getIdInscripcion();
        if ( idInscripcion == null ) {
            return null;
        }
        return idInscripcion.getProyecto();
    }

    private String entityIdEtapaInscripcionNombre(SolNInscripcionChecklistEty solNInscripcionChecklistEty) {
        CatEtapaInscripcionEty idEtapaInscripcion = solNInscripcionChecklistEty.getIdEtapaInscripcion();
        if ( idEtapaInscripcion == null ) {
            return null;
        }
        return idEtapaInscripcion.getNombre();
    }

    private String entityIdEstadoEstado(SolNInscripcionChecklistEty solNInscripcionChecklistEty) {
        MiniFormEstEty idEstado = solNInscripcionChecklistEty.getIdEstado();
        if ( idEstado == null ) {
            return null;
        }
        return idEstado.getEstado();
    }

    private String entityIdResponsableNombreLargo(SolNInscripcionChecklistEty solNInscripcionChecklistEty) {
        MiniFormRespEty idResponsable = solNInscripcionChecklistEty.getIdResponsable();
        if ( idResponsable == null ) {
            return null;
        }
        return idResponsable.getNombreLargo();
    }
}
