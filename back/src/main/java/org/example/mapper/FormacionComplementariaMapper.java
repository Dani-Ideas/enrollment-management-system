package org.example.mapper;

import org.example.dto.FormacionComplementariaDto;
import org.example.dto.FormacionComplementariaRequestDto;
import org.example.model.Form;
import org.example.model.FormacionComplementaria;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.Mapper;

@Mapper(componentModel = MappingConstants.ComponentModel.CDI)
public interface FormacionComplementariaMapper
        extends RequestResponseMapper<FormacionComplementaria, FormacionComplementariaRequestDto, FormacionComplementariaDto> {

    // toDto(): "inscripcion.id" en vez de aplanar a texto (a diferencia de FormMapper,
    // aqui no hay ningun campo legible que mostrar -- el FK apunta a la Inscripcion dueña,
    // no a un catalogo).
    @Override
    @Mapping(target = "inscripcionId", source = "inscripcion.id")
    FormacionComplementariaDto toDto(FormacionComplementaria entidad);

    // toEntity(): id lo genera la base; "inscripcion" llega como stub (solo id, via
    // desdeId() de abajo) a partir de inscripcionId -- igual que FormMapper resuelve sus
    // 6 relaciones. A diferencia de Form, aqui SI hace falta reemplazar el stub por la
    // Form real antes de persistir (ver ServiceArtifax.crearFormacionComplementaria()) --
    // em.persist() de una entidad con una @ManyToOne apuntando a un stub desprendido (solo
    // id, nunca buscado/adjuntado) no es seguro con EclipseLink, mismo motivo por el que
    // FormServiceImpl.resolverRelaciones() nunca persiste sus stubs tal cual.
    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "inscripcion", source = "inscripcionId")
    FormacionComplementaria toEntity(FormacionComplementariaRequestDto dto);

    // Mapeo de REFERENCIA: Long -> Form "stub" (solo id) -- MapStruct lo encuentra solo
    // por tipo de retorno para el @Mapping de "inscripcion" de arriba (unica firma
    // Long -> Form en este Mapper, no hace falta @Named/qualifiedByName).
    default Form desdeId(Long id) {
        if (id == null) {
            return null;
        }
        Form form = new Form();
        form.setId(id);
        return form;
    }
}
