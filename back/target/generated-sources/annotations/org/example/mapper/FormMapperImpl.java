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
    date = "2026-09-25T03:26:03-0600",
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
        String jefeCarrera = null;
        String maestro = null;
        String carrera = null;
        String ambiente = null;
        Long id = null;
        String proyecto = null;
        String version = null;
        String descripcion = null;
        LocalDateTime fechaInscripcionPlanteada = null;
        LocalDateTime fechaInscripcionReal = null;

        estado = formEstadoEstado( form );
        sistema = formSistemaNombre( form );
        jefeCarrera = formJefeCarreraNombreLargo( form );
        maestro = formMaestroNombreLargo( form );
        carrera = formCarreraNombreLargo( form );
        ambiente = formAmbienteNombre( form );
        id = form.getId();
        proyecto = form.getProyecto();
        version = form.getVersion();
        descripcion = form.getDescripcion();
        fechaInscripcionPlanteada = form.getFechaInscripcionPlanteada();
        fechaInscripcionReal = form.getFechaInscripcionReal();

        FormDto formDto = new FormDto( id, estado, sistema, jefeCarrera, maestro, carrera, ambiente, proyecto, version, descripcion, fechaInscripcionPlanteada, fechaInscripcionReal );

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
        form.setJefeCarrera( miniFormRespMapper.desdeId( dto.jefeCarreraId() ) );
        form.setMaestro( miniFormRespMapper.desdeId( dto.maestroId() ) );
        form.setCarrera( miniFormRespMapper.desdeId( dto.carreraId() ) );
        form.setAmbiente( miniFormAmbMapper.desdeId( dto.ambienteId() ) );
        form.setProyecto( dto.proyecto() );
        form.setVersion( dto.version() );
        form.setDescripcion( dto.descripcion() );
        form.setFechaInscripcionPlanteada( dto.fechaInscripcionPlanteada() );
        form.setFechaInscripcionReal( dto.fechaInscripcionReal() );

        return form;
    }

    @Override
    public void actualizarDesde(Form form, FormRequestDto dto) {
        if ( dto == null ) {
            return;
        }

        form.setEstado( miniFormEstMapper.desdeId( dto.estadoId() ) );
        form.setSistema( miniFormSisMapper.desdeId( dto.sistemaId() ) );
        form.setJefeCarrera( miniFormRespMapper.desdeId( dto.jefeCarreraId() ) );
        form.setMaestro( miniFormRespMapper.desdeId( dto.maestroId() ) );
        form.setCarrera( miniFormRespMapper.desdeId( dto.carreraId() ) );
        form.setAmbiente( miniFormAmbMapper.desdeId( dto.ambienteId() ) );
        form.setProyecto( dto.proyecto() );
        form.setVersion( dto.version() );
        form.setDescripcion( dto.descripcion() );
        form.setFechaInscripcionPlanteada( dto.fechaInscripcionPlanteada() );
        form.setFechaInscripcionReal( dto.fechaInscripcionReal() );
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

    private String formJefeCarreraNombreLargo(Form form) {
        MiniFormResp jefeCarrera = form.getJefeCarrera();
        if ( jefeCarrera == null ) {
            return null;
        }
        return jefeCarrera.getNombreLargo();
    }

    private String formMaestroNombreLargo(Form form) {
        MiniFormResp maestro = form.getMaestro();
        if ( maestro == null ) {
            return null;
        }
        return maestro.getNombreLargo();
    }

    private String formCarreraNombreLargo(Form form) {
        MiniFormResp carrera = form.getCarrera();
        if ( carrera == null ) {
            return null;
        }
        return carrera.getNombreLargo();
    }

    private String formAmbienteNombre(Form form) {
        MiniFormAmb ambiente = form.getAmbiente();
        if ( ambiente == null ) {
            return null;
        }
        return ambiente.getNombre();
    }
}
