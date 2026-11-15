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

// Igual que DiplomaPrimariaMapper: clase abstracta por el @Inject, mas "uses" a
// DiplomaPrimariaMapper para que toEntity()/actualizarDesde() resuelvan "diplomaPrimaria"
// (Long -> entidad real) llamando a DiplomaPrimariaMapper.desdeId(Long) -- mismo mecanismo
// que InscripcionMapper resolviendo sus 6 FK de catalogo, MapStruct lo encuentra por
// nombre/tipo sin @Mapping explicito. desdeId() de esta clase la usa a su vez
// DiplomaUniversidadMapper.
@Mapper(componentModel = MappingConstants.ComponentModel.CDI, uses = {DiplomaPrimariaMapper.class})
public abstract class DiplomaSecundariaMapper implements RequestResponseMapper<DiplomaSecundariaEty, DiplomaSecundariaRequestDto, DiplomaSecundariaDto> {

    @Inject
    private DiplomaSecundariaRepository diplomaSecundariaRepository;

    @Override
    @Mapping(target = "inscripcionSecundariaId", source = "inscripcionSecundaria.id")
    @Mapping(target = "diplomaPrimariaId", source = "diplomaPrimaria.id")
    public abstract DiplomaSecundariaDto toDto(DiplomaSecundariaEty entidad);

    // inscripcionSecundaria: la asigna InscripcionSecundariaServiceImpl. diplomaPrimaria SI se
    // resuelve aca (via "uses"): el service necesita la entidad real, no solo el id, para
    // validar que el diploma de primaria referenciado este completo.
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
