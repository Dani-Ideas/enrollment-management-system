package org.example.dinamicas.mapper;

import jakarta.inject.Inject;
import org.example.comun.ReferenciaInvalidaException;
import org.example.comun.RequestResponseMapper;
import org.example.dinamicas.dto.DiplomaSecundariaDto;
import org.example.dinamicas.dto.DiplomaSecundariaRequestDto;
import org.example.dinamicas.model.DiplomaSecundariaEty;
import org.example.dinamicas.repository.DiplomaSecundariaRepository;
import org.mapstruct.InheritConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;

// Clase abstracta por el @Inject -- a diferencia de la version anterior, ya NO necesita
// "uses" de DiplomaPrimariaMapper: DiplomaSecundariaRequestDto no trae ninguna FK propia (la
// PK compartida la fija InscripcionSecundariaRequestDto.diplomaPrimaria, un nivel arriba).
// desdeId() sigue haciendo falta: la usa InscripcionUniversidadMapper para resolver
// "diplomaSecundaria: Long" (el id de linaje) -> la entidad real.
@Mapper(componentModel = MappingConstants.ComponentModel.CDI)
public abstract class DiplomaSecundariaMapper implements RequestResponseMapper<DiplomaSecundariaEty, DiplomaSecundariaRequestDto, DiplomaSecundariaDto> {

    @Inject
    private DiplomaSecundariaRepository diplomaSecundariaRepository;

    @Override
    @Mapping(target = "id", source = "inscripcionSecundaria.diplomaPrimaria.id")
    public abstract DiplomaSecundariaDto toDto(DiplomaSecundariaEty entidad);

    // inscripcionSecundaria: la asigna InscripcionSecundariaServiceImpl (es la PK compartida).
    @Override
    @Mapping(target = "inscripcionSecundaria", ignore = true)
    @Mapping(target = "emitido", ignore = true)
    @Mapping(target = "fechaEmision", ignore = true)
    public abstract DiplomaSecundariaEty toEntity(DiplomaSecundariaRequestDto dto);

    @InheritConfiguration(name = "toEntity")
    public abstract void actualizarDesde(@MappingTarget DiplomaSecundariaEty entidad, DiplomaSecundariaRequestDto dto);

    public DiplomaSecundariaEty desdeId(Long id) {
        if (id == null) {
            return null;
        }
        return diplomaSecundariaRepository.findById(id)
                .orElseThrow(() -> new ReferenciaInvalidaException("No existe el diploma de secundaria " + id));
    }
}
