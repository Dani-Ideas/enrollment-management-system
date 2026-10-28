package org.example.dinamicas.mapper;

import org.example.dinamicas.dto.FormacionComplementariaDto;
import org.example.dinamicas.dto.FormacionComplementariaRequestDto;
import org.example.dinamicas.dinamica.InscripcionEty;
import org.example.dinamicas.dinamica.FormacionComplementariaEty;
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

    // toEntity(): id lo genera la base; "inscripcion" queda como stub (solo id, via desdeId())
    // y InscripcionServiceImpl lo reemplaza SIEMPRE por la InscripcionEty real antes del
    // insertAll() -- persistir un stub desprendido no es seguro con EclipseLink.
    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "inscripcion", source = "inscripcionId")
    FormacionComplementariaEty toEntity(FormacionComplementariaRequestDto dto);

    // Mapeo de REFERENCIA: Long -> InscripcionEty "stub" (solo id) -- MapStruct lo encuentra solo
    // por tipo de retorno para el @Mapping de "inscripcion" de arriba (unica firma
    // Long -> InscripcionEty en este Mapper, no hace falta @Named/qualifiedByName).
    default InscripcionEty desdeId(Long id) {
        if (id == null) {
            return null;
        }
        InscripcionEty stub = new InscripcionEty();
        stub.setId(id);
        return stub;
    }
}
