package org.example.dinamicas.mapper;

import org.example.dinamicas.dto.ClonarInscripcionDto;
import org.example.dinamicas.dto.InscripcionConFormacionComplementariaDto;
import org.example.dinamicas.dto.InscripcionDto;
import org.example.dinamicas.dto.InscripcionRequestDto;
import org.example.estaticos.mapper.MiniFormAmbMapper;
import org.example.estaticos.mapper.MiniFormEstMapper;
import org.example.estaticos.mapper.MiniFormRespMapper;
import org.example.estaticos.mapper.MiniFormSisMapper;
import org.example.dinamicas.model.InscripcionEty;
import org.example.comun.RequestResponseMapper;
import org.mapstruct.InheritConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = MappingConstants.ComponentModel.CDI,
        uses = {MiniFormEstMapper.class,
                MiniFormSisMapper.class,
                MiniFormRespMapper.class,
                MiniFormAmbMapper.class,
                FormacionComplementariaMapper.class})
public interface InscripcionMapper extends RequestResponseMapper<InscripcionEty, InscripcionRequestDto, InscripcionDto> {

    @Override
    @Mapping(target = "estado", source = "estado.estado")
    @Mapping(target = "sistema", source = "sistema.nombre")
    @Mapping(target = "jefeCarrera", source = "jefeCarrera.nombreLargo")
    @Mapping(target = "maestro", source = "maestro.nombreLargo")
    @Mapping(target = "carrera", source = "carrera.nombreLargo")
    @Mapping(target = "ambiente", source = "ambiente.nombre")
    InscripcionDto toDto(InscripcionEty inscripcion);

    @Override
    @Mapping(target = "formacionesComplementarias", ignore = true)
    InscripcionEty toEntity(InscripcionRequestDto dto);

    @InheritConfiguration(name = "toEntity")
    void actualizarDesde(@MappingTarget InscripcionEty inscripcion, InscripcionRequestDto dto);

    // Respuesta del PUT: la Inscripcion aplanada (toDto()) + sus formaciones complementarias.
    // "formacionesComplementarias" no necesita @Mapping: mismo nombre en ambos lados, la
    // lista la convierte FormacionComplementariaMapper.toDto (uses).
    @Mapping(target = "inscripcion", source = ".")
    InscripcionConFormacionComplementariaDto toDtoConFormaciones(InscripcionEty entidad);

    // DTO2 (ClonarInscripcionDto) como SEGUNDA puerta de entrada hacia InscripcionEty,
    // ademas de toEntity(InscripcionRequestDto) arriba -- este ES el "transformador final":
    // copia los campos comunes de "origen" (MapStruct lo hace solo, mismo nombre en ambos
    // lados, mismo tipo -- no hace falta un mapper de catalogos aca porque no hay DTO de
    // por medio, es Entidad -> Entidad) y aplica el override puntual de este DTO.
    // id: nunca se copia del origen -- es una fila nueva, el id lo pone la secuencia al
    // insertar. formacionesComplementarias: nunca arranca con las del origen -- son hijas
    // de ESA fila, no de la nueva (ver InscripcionServiceImpl.sincronizarFormacionesComplementarias
    // para como se les asigna la inscripcion duena).
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "formacionesComplementarias", ignore = true)
    @Mapping(target = "proyecto", source = "dto.nuevoProyecto")
    InscripcionEty clonarDesde(InscripcionEty origen, ClonarInscripcionDto dto);
}
