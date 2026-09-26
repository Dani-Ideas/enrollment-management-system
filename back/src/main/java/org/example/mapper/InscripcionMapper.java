package org.example.mapper;

import org.example.dto.InscripcionDto;
import org.example.dto.InscripcionRequestDto;
import org.example.model.InscripcionEty;
import org.mapstruct.InheritConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;

// Asimetrico (REQ != RES) y SIN reglas cruzadas entre entidades (a diferencia de
// Clase/Matricula, que necesitan un Builder) -- resolver las 6 FK es la misma situacion
// que EstudianteMapper.carreraId -> Carrera, asi que sigue el mismo contrato:
// RequestResponseMapper + toEntity() armado con submappers (uses), no codigo a mano.
//
// MiniFormEstMapper/MiniFormSisMapper/MiniFormRespMapper/MiniFormAmbMapper aportan cada
// uno su "desdeId(Long)" (mismo patron que CarreraMapper.desdeId): MapStruct los resuelve
// solo por tipo, incluida la relacion MiniFormRespEty que se repite 3 veces con roles
// distintos -- un unico metodo alcanza para las 3.
@Mapper(componentModel = MappingConstants.ComponentModel.CDI,
        uses = {MiniFormEstMapper.class, MiniFormSisMapper.class, MiniFormRespMapper.class, MiniFormAmbMapper.class})
public interface InscripcionMapper extends RequestResponseMapper<InscripcionEty, InscripcionRequestDto, InscripcionDto> {

    // toDto(): el mapper "lo mas limpio posible" que se pidio -- una sola declaracion, 6
    // @Mapping de aplanado (dot-notation), CERO codigo escrito a mano.
    @Override
    @Mapping(target = "estado", source = "estado.estado")
    @Mapping(target = "sistema", source = "sistema.nombre")
    @Mapping(target = "jefeCarrera", source = "jefeCarrera.nombreLargo")
    @Mapping(target = "maestro", source = "maestro.nombreLargo")
    @Mapping(target = "carrera", source = "carrera.nombreLargo")
    @Mapping(target = "ambiente", source = "ambiente.nombre")
    InscripcionDto toDto(InscripcionEty inscripcion);

    // id: lo genera la base. Las 6 relaciones llegan como STUB (solo id, via los
    // "desdeId" de arriba) -- proyecto/version/descripcion/fechas se copian solos
    // (mismo nombre de campo en ambos lados, MapStruct no necesita @Mapping para esos).
    // InscripcionServiceImpl reemplaza los 6 stubs por las entidades reales antes de guardar.
    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "estado", source = "estadoId")
    @Mapping(target = "sistema", source = "sistemaId")
    @Mapping(target = "jefeCarrera", source = "jefeCarreraId")
    @Mapping(target = "maestro", source = "maestroId")
    @Mapping(target = "carrera", source = "carreraId")
    @Mapping(target = "ambiente", source = "ambienteId")
    InscripcionEty toEntity(InscripcionRequestDto dto);

    // Variante "actualizar en el lugar" de toEntity(), para PUT: misma resolucion de
    // campos (@InheritConfiguration copia los @Mapping de toEntity(), una sola fuente de
    // verdad para la lista de campos) pero mutando la entidad ya cargada por
    // InscripcionServiceImpl.actualizar() en vez de crear una instancia nueva.
    @InheritConfiguration(name = "toEntity")
    void actualizarDesde(@MappingTarget InscripcionEty inscripcion, InscripcionRequestDto dto);
}
