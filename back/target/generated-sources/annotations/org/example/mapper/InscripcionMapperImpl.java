package org.example.mapper;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.example.dto.FormacionComplementariaDto;
import org.example.dto.InscripcionConFormacionComplementariaDto;
import org.example.dto.InscripcionConFormacionComplementariaRequestDto;
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
    date = "2026-10-08T06:40:36-0600",
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

        inscripcionEty.setEstado( miniFormEstMapper.desdeId( dto.estadoId() ) );
        inscripcionEty.setSistema( miniFormSisMapper.desdeId( dto.sistemaId() ) );
        inscripcionEty.setJefeCarrera( miniFormRespMapper.desdeId( dto.jefeCarreraId() ) );
        inscripcionEty.setMaestro( miniFormRespMapper.desdeId( dto.maestroId() ) );
        inscripcionEty.setCarrera( miniFormRespMapper.desdeId( dto.carreraId() ) );
        inscripcionEty.setAmbiente( miniFormAmbMapper.desdeId( dto.ambienteId() ) );
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

        inscripcion.setEstado( miniFormEstMapper.desdeId( dto.estadoId() ) );
        inscripcion.setSistema( miniFormSisMapper.desdeId( dto.sistemaId() ) );
        inscripcion.setJefeCarrera( miniFormRespMapper.desdeId( dto.jefeCarreraId() ) );
        inscripcion.setMaestro( miniFormRespMapper.desdeId( dto.maestroId() ) );
        inscripcion.setCarrera( miniFormRespMapper.desdeId( dto.carreraId() ) );
        inscripcion.setAmbiente( miniFormAmbMapper.desdeId( dto.ambienteId() ) );
        inscripcion.setProyecto( dto.proyecto() );
        inscripcion.setVersion( dto.version() );
        inscripcion.setDescripcion( dto.descripcion() );
        inscripcion.setFechaInscripcionPlanteada( dto.fechaInscripcionPlanteada() );
        inscripcion.setFechaInscripcionReal( dto.fechaInscripcionReal() );
    }

    @Override
    public InscripcionEty toEntityConFormaciones(InscripcionConFormacionComplementariaRequestDto dto) {
        if ( dto == null ) {
            return null;
        }

        InscripcionEty inscripcionEty = new InscripcionEty();

        inscripcionEty.setEstado( miniFormEstMapper.desdeId( dtoInscripcionEstadoId( dto ) ) );
        inscripcionEty.setSistema( miniFormSisMapper.desdeId( dtoInscripcionSistemaId( dto ) ) );
        inscripcionEty.setJefeCarrera( miniFormRespMapper.desdeId( dtoInscripcionJefeCarreraId( dto ) ) );
        inscripcionEty.setMaestro( miniFormRespMapper.desdeId( dtoInscripcionMaestroId( dto ) ) );
        inscripcionEty.setCarrera( miniFormRespMapper.desdeId( dtoInscripcionCarreraId( dto ) ) );
        inscripcionEty.setAmbiente( miniFormAmbMapper.desdeId( dtoInscripcionAmbienteId( dto ) ) );
        inscripcionEty.setProyecto( dtoInscripcionProyecto( dto ) );
        inscripcionEty.setVersion( dtoInscripcionVersion( dto ) );
        inscripcionEty.setDescripcion( dtoInscripcionDescripcion( dto ) );
        inscripcionEty.setFechaInscripcionPlanteada( dtoInscripcionFechaInscripcionPlanteada( dto ) );
        inscripcionEty.setFechaInscripcionReal( dtoInscripcionFechaInscripcionReal( dto ) );

        agregarFormacionesComplementarias( dto, inscripcionEty );

        return inscripcionEty;
    }

    @Override
    public InscripcionConFormacionComplementariaDto toDtoConFormaciones(InscripcionEty entidad) {
        if ( entidad == null ) {
            return null;
        }

        InscripcionDto inscripcion = null;
        List<FormacionComplementariaDto> formacionesComplementarias = null;

        inscripcion = toDto( entidad );
        formacionesComplementarias = formacionComplementariaEtyListToFormacionComplementariaDtoList( entidad.getFormacionesComplementarias() );

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

    private Long dtoInscripcionEstadoId(InscripcionConFormacionComplementariaRequestDto inscripcionConFormacionComplementariaRequestDto) {
        InscripcionRequestDto inscripcion = inscripcionConFormacionComplementariaRequestDto.inscripcion();
        if ( inscripcion == null ) {
            return null;
        }
        return inscripcion.estadoId();
    }

    private Long dtoInscripcionSistemaId(InscripcionConFormacionComplementariaRequestDto inscripcionConFormacionComplementariaRequestDto) {
        InscripcionRequestDto inscripcion = inscripcionConFormacionComplementariaRequestDto.inscripcion();
        if ( inscripcion == null ) {
            return null;
        }
        return inscripcion.sistemaId();
    }

    private Long dtoInscripcionJefeCarreraId(InscripcionConFormacionComplementariaRequestDto inscripcionConFormacionComplementariaRequestDto) {
        InscripcionRequestDto inscripcion = inscripcionConFormacionComplementariaRequestDto.inscripcion();
        if ( inscripcion == null ) {
            return null;
        }
        return inscripcion.jefeCarreraId();
    }

    private Long dtoInscripcionMaestroId(InscripcionConFormacionComplementariaRequestDto inscripcionConFormacionComplementariaRequestDto) {
        InscripcionRequestDto inscripcion = inscripcionConFormacionComplementariaRequestDto.inscripcion();
        if ( inscripcion == null ) {
            return null;
        }
        return inscripcion.maestroId();
    }

    private Long dtoInscripcionCarreraId(InscripcionConFormacionComplementariaRequestDto inscripcionConFormacionComplementariaRequestDto) {
        InscripcionRequestDto inscripcion = inscripcionConFormacionComplementariaRequestDto.inscripcion();
        if ( inscripcion == null ) {
            return null;
        }
        return inscripcion.carreraId();
    }

    private Long dtoInscripcionAmbienteId(InscripcionConFormacionComplementariaRequestDto inscripcionConFormacionComplementariaRequestDto) {
        InscripcionRequestDto inscripcion = inscripcionConFormacionComplementariaRequestDto.inscripcion();
        if ( inscripcion == null ) {
            return null;
        }
        return inscripcion.ambienteId();
    }

    private String dtoInscripcionProyecto(InscripcionConFormacionComplementariaRequestDto inscripcionConFormacionComplementariaRequestDto) {
        InscripcionRequestDto inscripcion = inscripcionConFormacionComplementariaRequestDto.inscripcion();
        if ( inscripcion == null ) {
            return null;
        }
        return inscripcion.proyecto();
    }

    private String dtoInscripcionVersion(InscripcionConFormacionComplementariaRequestDto inscripcionConFormacionComplementariaRequestDto) {
        InscripcionRequestDto inscripcion = inscripcionConFormacionComplementariaRequestDto.inscripcion();
        if ( inscripcion == null ) {
            return null;
        }
        return inscripcion.version();
    }

    private String dtoInscripcionDescripcion(InscripcionConFormacionComplementariaRequestDto inscripcionConFormacionComplementariaRequestDto) {
        InscripcionRequestDto inscripcion = inscripcionConFormacionComplementariaRequestDto.inscripcion();
        if ( inscripcion == null ) {
            return null;
        }
        return inscripcion.descripcion();
    }

    private LocalDateTime dtoInscripcionFechaInscripcionPlanteada(InscripcionConFormacionComplementariaRequestDto inscripcionConFormacionComplementariaRequestDto) {
        InscripcionRequestDto inscripcion = inscripcionConFormacionComplementariaRequestDto.inscripcion();
        if ( inscripcion == null ) {
            return null;
        }
        return inscripcion.fechaInscripcionPlanteada();
    }

    private LocalDateTime dtoInscripcionFechaInscripcionReal(InscripcionConFormacionComplementariaRequestDto inscripcionConFormacionComplementariaRequestDto) {
        InscripcionRequestDto inscripcion = inscripcionConFormacionComplementariaRequestDto.inscripcion();
        if ( inscripcion == null ) {
            return null;
        }
        return inscripcion.fechaInscripcionReal();
    }

    protected List<FormacionComplementariaDto> formacionComplementariaEtyListToFormacionComplementariaDtoList(List<FormacionComplementariaEty> list) {
        if ( list == null ) {
            return null;
        }

        List<FormacionComplementariaDto> list1 = new ArrayList<FormacionComplementariaDto>( list.size() );
        for ( FormacionComplementariaEty formacionComplementariaEty : list ) {
            list1.add( formacionComplementariaMapper.toDto( formacionComplementariaEty ) );
        }

        return list1;
    }
}
