package org.example.mapper;

import jakarta.annotation.Nonnull;
import org.example.dto.FormacionComplementariaRequestDto;
import org.example.dto.InscripcionConFormacionComplementariaDto;
import org.example.dto.InscripcionConFormacionComplementariaRequestDto;
import org.example.dto.InscripcionDto;
import org.example.dto.InscripcionRequestDto;
import org.example.model.FormacionComplementariaEty;
import org.example.model.InscripcionEty;
import org.mapstruct.InheritConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;

import java.util.List;

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

    default InscripcionEty toEntityConFormaciones(@Nonnull InscripcionConFormacionComplementariaRequestDto dto) {
        InscripcionEty entidad = toEntity(dto.inscripcion());
        List<FormacionComplementariaEty> hijos = mapFormaciones(dto.formacionesComplementarias());
        hijos.forEach(hijo -> hijo.setInscripcion(entidad));
        entidad.getFormacionesComplementarias().addAll(hijos);
        return entidad;
    }

    List<FormacionComplementariaEty> mapFormaciones(List<FormacionComplementariaRequestDto> dtos);

    // Forma de SALIDA -- la Inscripcion recien creada (aplanada, como toDto()) + sus
    // formaciones complementarias, leidas DIRECTO de la coleccion que EclipseLink ya
    // populo al persistir en cascada. "formacionesComplementarias" no necesita @Mapping:
    // mismo nombre de campo en ambos lados, MapStruct resuelve la lista sola via
    // FormacionComplementariaMapper.toDto (uses).
    @Mapping(target = "inscripcion", source = ".")// dice que no puede encotrar el atributo
    InscripcionConFormacionComplementariaDto toDtoConFormaciones(InscripcionEty entidad);
}
