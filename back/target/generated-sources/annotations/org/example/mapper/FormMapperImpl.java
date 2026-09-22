package org.example.mapper;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.time.LocalDateTime;
import javax.annotation.processing.Generated;
import org.example.dto.FormDto;
import org.example.dto.FormRequestDto;
import org.example.model.Form;
import org.example.model.MiniFormAmb;
import org.example.model.MiniFormEst;
import org.example.model.MiniFormResp;
import org.example.model.MiniFormSis;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-09-22T10:20:32-0600",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.12.1 (Arch Linux)"
)
@ApplicationScoped
public class FormMapperImpl implements FormMapper {

    @Inject
    private MiniFormEstMapper miniFormEstMapper;
    @Inject
    private MiniFormSisMapper miniFormSisMapper;
    @Inject
    private MiniFormRespMapper miniFormRespMapper;
    @Inject
    private MiniFormAmbMapper miniFormAmbMapper;

    @Override
    public FormDto toDto(Form form) {
        if ( form == null ) {
            return null;
        }

        String estado = null;
        String sistema = null;
        String responsableProyecto = null;
        String responsableDesarrollo = null;
        String responsableImplantacion = null;
        String ambiente = null;
        Long id = null;
        String proyecto = null;
        String version = null;
        String descripcion = null;
        LocalDateTime fechaImplantacionPlanteada = null;
        LocalDateTime fechaImplantacionReal = null;

        estado = formEstadoEstado( form );
        sistema = formSistemaNombre( form );
        responsableProyecto = formResponsableProyectoNombreLargo( form );
        responsableDesarrollo = formResponsableDesarrolloNombreLargo( form );
        responsableImplantacion = formResponsableImplantacionNombreLargo( form );
        ambiente = formAmbienteNombre( form );
        id = form.getId();
        proyecto = form.getProyecto();
        version = form.getVersion();
        descripcion = form.getDescripcion();
        fechaImplantacionPlanteada = form.getFechaImplantacionPlanteada();
        fechaImplantacionReal = form.getFechaImplantacionReal();

        FormDto formDto = new FormDto( id, estado, sistema, responsableProyecto, responsableDesarrollo, responsableImplantacion, ambiente, proyecto, version, descripcion, fechaImplantacionPlanteada, fechaImplantacionReal );

        return formDto;
    }

    @Override
    public Form toEntity(FormRequestDto dto) {
        if ( dto == null ) {
            return null;
        }

        Form form = new Form();

        form.setEstado( miniFormEstMapper.desdeId( dto.estadoId() ) );
        form.setSistema( miniFormSisMapper.desdeId( dto.sistemaId() ) );
        form.setResponsableProyecto( miniFormRespMapper.desdeId( dto.responsableProyectoId() ) );
        form.setResponsableDesarrollo( miniFormRespMapper.desdeId( dto.responsableDesarrolloId() ) );
        form.setResponsableImplantacion( miniFormRespMapper.desdeId( dto.responsableImplantacionId() ) );
        form.setAmbiente( miniFormAmbMapper.desdeId( dto.ambienteId() ) );
        form.setProyecto( dto.proyecto() );
        form.setVersion( dto.version() );
        form.setDescripcion( dto.descripcion() );
        form.setFechaImplantacionPlanteada( dto.fechaImplantacionPlanteada() );
        form.setFechaImplantacionReal( dto.fechaImplantacionReal() );

        return form;
    }

    @Override
    public void actualizarDesde(Form form, FormRequestDto dto) {
        if ( dto == null ) {
            return;
        }

        form.setEstado( miniFormEstMapper.desdeId( dto.estadoId() ) );
        form.setSistema( miniFormSisMapper.desdeId( dto.sistemaId() ) );
        form.setResponsableProyecto( miniFormRespMapper.desdeId( dto.responsableProyectoId() ) );
        form.setResponsableDesarrollo( miniFormRespMapper.desdeId( dto.responsableDesarrolloId() ) );
        form.setResponsableImplantacion( miniFormRespMapper.desdeId( dto.responsableImplantacionId() ) );
        form.setAmbiente( miniFormAmbMapper.desdeId( dto.ambienteId() ) );
        form.setProyecto( dto.proyecto() );
        form.setVersion( dto.version() );
        form.setDescripcion( dto.descripcion() );
        form.setFechaImplantacionPlanteada( dto.fechaImplantacionPlanteada() );
        form.setFechaImplantacionReal( dto.fechaImplantacionReal() );
    }

    private String formEstadoEstado(Form form) {
        MiniFormEst estado = form.getEstado();
        if ( estado == null ) {
            return null;
        }
        return estado.getEstado();
    }

    private String formSistemaNombre(Form form) {
        MiniFormSis sistema = form.getSistema();
        if ( sistema == null ) {
            return null;
        }
        return sistema.getNombre();
    }

    private String formResponsableProyectoNombreLargo(Form form) {
        MiniFormResp responsableProyecto = form.getResponsableProyecto();
        if ( responsableProyecto == null ) {
            return null;
        }
        return responsableProyecto.getNombreLargo();
    }

    private String formResponsableDesarrolloNombreLargo(Form form) {
        MiniFormResp responsableDesarrollo = form.getResponsableDesarrollo();
        if ( responsableDesarrollo == null ) {
            return null;
        }
        return responsableDesarrollo.getNombreLargo();
    }

    private String formResponsableImplantacionNombreLargo(Form form) {
        MiniFormResp responsableImplantacion = form.getResponsableImplantacion();
        if ( responsableImplantacion == null ) {
            return null;
        }
        return responsableImplantacion.getNombreLargo();
    }

    private String formAmbienteNombre(Form form) {
        MiniFormAmb ambiente = form.getAmbiente();
        if ( ambiente == null ) {
            return null;
        }
        return ambiente.getNombre();
    }
}
