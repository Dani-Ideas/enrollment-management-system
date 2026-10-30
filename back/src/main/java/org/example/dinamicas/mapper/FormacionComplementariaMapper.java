package org.example.dinamicas.mapper;

import org.example.dinamicas.dto.FormacionComplementariaDto;
import org.example.dinamicas.dto.FormacionComplementariaRequestDto;
import org.example.dinamicas.model.FormacionComplementariaEty;
import org.example.comun.RequestResponseMapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.Mapper;

@Mapper(componentModel = MappingConstants.ComponentModel.CDI)
public interface FormacionComplementariaMapper
        extends RequestResponseMapper<FormacionComplementariaEty, FormacionComplementariaRequestDto, FormacionComplementariaDto> {

    // toDto(): "inscripcion.id" en vez de aplanar a texto (a diferencia de InscripcionMapper,
    // aqui no hay ningun campo legible que mostrar -- el FK apunta a la Inscripcion dueña,
    // no a un catalogo).
    @Override
    @Mapping(target = "inscripcionId", source = "inscripcion.id")
    FormacionComplementariaDto toDto(FormacionComplementariaEty entidad);

    // toEntity(): id lo genera la base; "inscripcion" la asigna InscripcionServiceImpl con la
    // InscripcionEty real (la de la URL del PUT o la recien creada en el POST).
    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "inscripcion", ignore = true)
    FormacionComplementariaEty toEntity(FormacionComplementariaRequestDto dto);
}
