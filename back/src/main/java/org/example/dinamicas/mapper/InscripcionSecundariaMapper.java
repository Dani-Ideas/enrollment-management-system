package org.example.dinamicas.mapper;

import org.example.comun.RequestResponseMapper;
import org.example.dinamicas.dto.InscripcionSecundariaConDiplomaDto;
import org.example.dinamicas.dto.InscripcionSecundariaDatosDto;
import org.example.dinamicas.dto.InscripcionSecundariaDto;
import org.example.dinamicas.dto.InscripcionSecundariaRequestDto;
import org.example.dinamicas.model.InscripcionSecundariaEty;
import org.example.estaticos.mapper.MiniFormAmbMapper;
import org.example.estaticos.mapper.MiniFormEstMapper;
import org.example.estaticos.mapper.MiniFormRespMapper;
import org.example.estaticos.mapper.MiniFormSisMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;

// Mismo esqueleto que InscripcionMapper, nivel Secundaria -- con una diferencia clave: "id"
// no es un campo propio (la PK es "diplomaPrimaria", PK compartida con DiplomaPrimariaEty),
// asi que toDto() lo aplana desde "diplomaPrimaria.id". "diplomaPrimaria" en toEntity() SI se
// resuelve via "uses" (DiplomaPrimariaMapper.desdeId, mismo mecanismo que los 4 catalogos) --
// es un campo normal mas en el DTO de entrada, aunque termine siendo la PK de la entidad.
// En el update, en cambio, se ignora: la PK no se puede re-apuntar una vez creada la fila.
@Mapper(componentModel = MappingConstants.ComponentModel.CDI,
        uses = {MiniFormEstMapper.class,
                MiniFormSisMapper.class,
                MiniFormRespMapper.class,
                MiniFormAmbMapper.class,
                DiplomaPrimariaMapper.class,
                DiplomaSecundariaMapper.class})
public interface InscripcionSecundariaMapper extends RequestResponseMapper<InscripcionSecundariaEty, InscripcionSecundariaRequestDto, InscripcionSecundariaDto> {

    @Override
    @Mapping(target = "id", source = "diplomaPrimaria.id")
    @Mapping(target = "estado", source = "estado.estado")
    @Mapping(target = "sistema", source = "sistema.nombre")
    @Mapping(target = "jefeCarrera", source = "jefeCarrera.nombreLargo")
    @Mapping(target = "maestro", source = "maestro.nombreLargo")
    @Mapping(target = "carrera", source = "carrera.nombreLargo")
    @Mapping(target = "ambiente", source = "ambiente.nombre")
    InscripcionSecundariaDto toDto(InscripcionSecundariaEty inscripcion);

    // diplomaPrimaria: resuelto automaticamente via "uses" (Long -> DiplomaPrimariaEty), igual
    // que los 6 catalogos de InscripcionMapper -- MapStruct lo encuentra por tipo, no por
    // nombre de metodo.
    @Override
    @Mapping(target = "diplomaSecundaria", ignore = true)
    InscripcionSecundariaEty toEntity(InscripcionSecundariaRequestDto dto);

    // Update NO puede tocar "diplomaPrimaria": es la PK compartida, inmutable despues de crear.
    @Mapping(target = "diplomaPrimaria", ignore = true)
    @Mapping(target = "diplomaSecundaria", ignore = true)
    void actualizarDesde(@MappingTarget InscripcionSecundariaEty inscripcion, InscripcionSecundariaRequestDto dto);

    @Mapping(target = "inscripcionSecundaria", source = ".")
    InscripcionSecundariaConDiplomaDto toDtoConDiploma(InscripcionSecundariaEty entidad);

    // Usado por CadenaDiplomasServiceImpl: mismos 6 catalogos + escalares, sin "diplomaPrimaria"
    // (fijo a mano por el service, con la fila que se acaba de crear en la misma peticion).
    @Mapping(target = "diplomaPrimaria", ignore = true)
    @Mapping(target = "diplomaSecundaria", ignore = true)
    InscripcionSecundariaEty toEntity(InscripcionSecundariaDatosDto dto);
}
