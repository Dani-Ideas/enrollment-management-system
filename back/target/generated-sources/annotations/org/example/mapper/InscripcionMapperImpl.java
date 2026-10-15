package org.example.mapper;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.example.dto.FormacionComplementariaDto;
import org.example.dto.FormacionComplementariaRequestDto;
import org.example.dto.InscripcionConFormacionComplementariaDto;
import org.example.dto.InscripcionDto;
import org.example.dto.InscripcionRequestDto;
import org.example.model.FormacionComplementariaEty;
import org.example.model.InscripcionEty;
import org.example.model.MiniFormAmbEty;
import org.example.model.MiniFormEstEty;
import org.example.model.MiniFormRespEty;
import org.example.model.MiniFormSisEty;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-10-15T00:59:13-0600",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.12.1 (Arch Linux)"
)
@ApplicationScoped
public class InscripcionMapperImpl implements InscripcionMapper {

    @Inject
    private MiniFormEstMapper miniFormEstMapper;
    @Inject
    private MiniFormSisMapper miniFormSisMapper;
    @Inject
    private MiniFormRespMapper miniFormRespMapper;
    @Inject
    private MiniFormAmbMapper miniFormAmbMapper;
    @Inject
    private FormacionComplementariaMapper formacionComplementariaMapper;

    @Override
    public List<InscripcionDto> toDto(List<InscripcionEty> entities) {
        if ( entities == null ) {
            return null;
        }

        List<InscripcionDto> list = new ArrayList<InscripcionDto>( entities.size() );
        for ( InscripcionEty inscripcionEty : entities ) {
            list.add( toDto( inscripcionEty ) );
        }

        return list;
    }

    @Override
    public List<InscripcionEty> toEntity(List<InscripcionRequestDto> dtos) {
        if ( dtos == null ) {
            return null;
        }

        List<InscripcionEty> list = new ArrayList<InscripcionEty>( dtos.size() );
        for ( InscripcionRequestDto inscripcionRequestDto : dtos ) {
            list.add( toEntity( inscripcionRequestDto ) );
        }

        return list;
    }

    @Override
    public InscripcionDto toDto(InscripcionEty inscripcion) {
        if ( inscripcion == null ) {
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

        estado = inscripcionEstadoEstado( inscripcion );
        sistema = inscripcionSistemaNombre( inscripcion );
        jefeCarrera = inscripcionJefeCarreraNombreLargo( inscripcion );
        maestro = inscripcionMaestroNombreLargo( inscripcion );
        carrera = inscripcionCarreraNombreLargo( inscripcion );
        ambiente = inscripcionAmbienteNombre( inscripcion );
        id = inscripcion.getId();
        proyecto = inscripcion.getProyecto();
        version = inscripcion.getVersion();
        descripcion = inscripcion.getDescripcion();
        fechaInscripcionPlanteada = inscripcion.getFechaInscripcionPlanteada();
        fechaInscripcionReal = inscripcion.getFechaInscripcionReal();

        InscripcionDto inscripcionDto = new InscripcionDto( id, estado, sistema, jefeCarrera, maestro, carrera, ambiente, proyecto, version, descripcion, fechaInscripcionPlanteada, fechaInscripcionReal );

        return inscripcionDto;
    }

    @Override
    public InscripcionEty toEntity(InscripcionRequestDto dto) {
        if ( dto == null ) {
            return null;
        }

        InscripcionEty inscripcionEty = new InscripcionEty();

        inscripcionEty.setEstado( miniFormEstMapper.desdeId( dto.estado() ) );
        inscripcionEty.setSistema( miniFormSisMapper.desdeId( dto.sistema() ) );
        inscripcionEty.setJefeCarrera( miniFormRespMapper.desdeId( dto.jefeCarrera() ) );
        inscripcionEty.setMaestro( miniFormRespMapper.desdeId( dto.maestro() ) );
        inscripcionEty.setCarrera( miniFormRespMapper.desdeId( dto.carrera() ) );
        inscripcionEty.setAmbiente( miniFormAmbMapper.desdeId( dto.ambiente() ) );
        inscripcionEty.setProyecto( dto.proyecto() );
        inscripcionEty.setVersion( dto.version() );
        inscripcionEty.setDescripcion( dto.descripcion() );
        inscripcionEty.setFechaInscripcionPlanteada( dto.fechaInscripcionPlanteada() );
        inscripcionEty.setFechaInscripcionReal( dto.fechaInscripcionReal() );

        return inscripcionEty;
    }

    @Override
    public void actualizarDesde(InscripcionEty inscripcion, InscripcionRequestDto dto) {
        if ( dto == null ) {
            return;
        }

        inscripcion.setEstado( miniFormEstMapper.desdeId( dto.estado() ) );
        inscripcion.setSistema( miniFormSisMapper.desdeId( dto.sistema() ) );
        inscripcion.setJefeCarrera( miniFormRespMapper.desdeId( dto.jefeCarrera() ) );
        inscripcion.setMaestro( miniFormRespMapper.desdeId( dto.maestro() ) );
        inscripcion.setCarrera( miniFormRespMapper.desdeId( dto.carrera() ) );
        inscripcion.setAmbiente( miniFormAmbMapper.desdeId( dto.ambiente() ) );
        inscripcion.setProyecto( dto.proyecto() );
        inscripcion.setVersion( dto.version() );
        inscripcion.setDescripcion( dto.descripcion() );
        inscripcion.setFechaInscripcionPlanteada( dto.fechaInscripcionPlanteada() );
        inscripcion.setFechaInscripcionReal( dto.fechaInscripcionReal() );
    }

    @Override
    public List<FormacionComplementariaEty> mapFormaciones(List<FormacionComplementariaRequestDto> dtos) {
        if ( dtos == null ) {
            return null;
        }

        List<FormacionComplementariaEty> list = new ArrayList<FormacionComplementariaEty>( dtos.size() );
        for ( FormacionComplementariaRequestDto formacionComplementariaRequestDto : dtos ) {
            list.add( formacionComplementariaMapper.toEntity( formacionComplementariaRequestDto ) );
        }

        return list;
    }

    @Override
    public InscripcionConFormacionComplementariaDto toDtoConFormaciones(InscripcionEty entidad) {
        if ( entidad == null ) {
            return null;
        }

        InscripcionDto inscripcion = null;
        List<FormacionComplementariaDto> formacionesComplementarias = null;

        inscripcion = toDto( entidad );
        formacionesComplementarias = formacionComplementariaMapper.toDto( entidad.getFormacionesComplementarias() );

        InscripcionConFormacionComplementariaDto inscripcionConFormacionComplementariaDto = new InscripcionConFormacionComplementariaDto( inscripcion, formacionesComplementarias );

        return inscripcionConFormacionComplementariaDto;
    }

    private String inscripcionEstadoEstado(InscripcionEty inscripcionEty) {
        MiniFormEstEty estado = inscripcionEty.getEstado();
        if ( estado == null ) {
            return null;
        }
        return estado.getEstado();
    }

    private String inscripcionSistemaNombre(InscripcionEty inscripcionEty) {
        MiniFormSisEty sistema = inscripcionEty.getSistema();
        if ( sistema == null ) {
            return null;
        }
        return sistema.getNombre();
    }

    private String inscripcionJefeCarreraNombreLargo(InscripcionEty inscripcionEty) {
        MiniFormRespEty jefeCarrera = inscripcionEty.getJefeCarrera();
        if ( jefeCarrera == null ) {
            return null;
        }
        return jefeCarrera.getNombreLargo();
    }

    private String inscripcionMaestroNombreLargo(InscripcionEty inscripcionEty) {
        MiniFormRespEty maestro = inscripcionEty.getMaestro();
        if ( maestro == null ) {
            return null;
        }
        return maestro.getNombreLargo();
    }

    private String inscripcionCarreraNombreLargo(InscripcionEty inscripcionEty) {
        MiniFormRespEty carrera = inscripcionEty.getCarrera();
        if ( carrera == null ) {
            return null;
        }
        return carrera.getNombreLargo();
    }

    private String inscripcionAmbienteNombre(InscripcionEty inscripcionEty) {
        MiniFormAmbEty ambiente = inscripcionEty.getAmbiente();
        if ( ambiente == null ) {
            return null;
        }
        return ambiente.getNombre();
    }
}
