package org.example.dinamicas.mapper;

import jakarta.inject.Inject;
import org.example.comun.ReferenciaInvalidaException;
import org.example.comun.RequestResponseMapper;
import org.example.dinamicas.dto.DiplomaPrimariaDatosDto;
import org.example.dinamicas.dto.DiplomaPrimariaDto;
import org.example.dinamicas.dto.DiplomaPrimariaRequestDto;
import org.example.dinamicas.model.DiplomaPrimariaEty;
import org.example.dinamicas.repository.DiplomaPrimariaRepository;
import org.mapstruct.InheritConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;

// Clase abstracta (no interfaz) porque necesita @Inject, igual que MiniFormEstMapper -- a
// diferencia de esa, aca SI se implementa RequestResponseMapper completo (toEntity +
// actualizarDesde con @InheritConfiguration, igual que InscripcionMapper) porque
// DiplomaPrimariaServiceImpl necesita el ciclo crear/actualizar completo, no solo toDto.
// desdeId() la usa DiplomaSecundariaMapper para resolver la FK de encadenamiento.
@Mapper(componentModel = MappingConstants.ComponentModel.CDI)
public abstract class DiplomaPrimariaMapper implements RequestResponseMapper<DiplomaPrimariaEty, DiplomaPrimariaRequestDto, DiplomaPrimariaDto> {

    @Inject
    private DiplomaPrimariaRepository diplomaPrimariaRepository;

    @Override
    @Mapping(target = "inscripcionId", source = "inscripcion.id")
    public abstract DiplomaPrimariaDto toDto(DiplomaPrimariaEty entidad);

    // inscripcion: la asigna DiplomaPrimariaServiceImpl con la InscripcionEty real.
    // emitido/fechaEmision: los calcula el service, nunca llegan del cliente.
    @Override
    @Mapping(target = "inscripcion", ignore = true)
    @Mapping(target = "emitido", ignore = true)
    @Mapping(target = "fechaEmision", ignore = true)
    public abstract DiplomaPrimariaEty toEntity(DiplomaPrimariaRequestDto dto);

    @InheritConfiguration(name = "toEntity")
    public abstract void actualizarDesde(@MappingTarget DiplomaPrimariaEty entidad, DiplomaPrimariaRequestDto dto);

    // Usado por CadenaDiplomasServiceImpl: mismas firmas, sin "inscripcion" (fija por otro
    // lado, ver DiplomaPrimariaDatosDto) ni emitido/fechaEmision (los calcula el service).
    public abstract DiplomaPrimariaEty toEntity(DiplomaPrimariaDatosDto dto);

    public DiplomaPrimariaEty desdeId(Long id) {
        if (id == null) {
            return null;
        }
        return diplomaPrimariaRepository.findById(id)
                .orElseThrow(() -> new ReferenciaInvalidaException("No existe el diploma de primaria " + id));
    }
}
