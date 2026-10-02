package org.example.mapper;

import org.example.dto.InscripcionConFormacionComplementariaDto;
import org.example.dto.InscripcionConFormacionComplementariaRequestDto;
import org.example.dto.InscripcionDto;
import org.example.dto.InscripcionRequestDto;
import org.example.model.FormacionComplementariaEty;
import org.example.model.InscripcionEty;
import org.mapstruct.AfterMapping;
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
// distintos -- un unico metodo alcanza para las 3. FormacionComplementariaMapper se agrega
// para que toDtoConFormaciones() pueda aplanar la lista de hijos sin codigo a mano.
@Mapper(componentModel = MappingConstants.ComponentModel.CDI,
        uses = {MiniFormEstMapper.class, MiniFormSisMapper.class, MiniFormRespMapper.class, MiniFormAmbMapper.class,
                FormacionComplementariaMapper.class})
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
    @Mapping(target = "formacionesComplementarias", ignore = true)
    InscripcionEty toEntity(InscripcionRequestDto dto);

    // Variante "actualizar en el lugar" de toEntity(), para PUT: misma resolucion de
    // campos (@InheritConfiguration copia los @Mapping de toEntity(), una sola fuente de
    // verdad para la lista de campos) pero mutando la entidad ya cargada por
    // InscripcionServiceImpl.actualizar() en vez de crear una instancia nueva.
    @InheritConfiguration(name = "toEntity")
    void actualizarDesde(@MappingTarget InscripcionEty inscripcion, InscripcionRequestDto dto);

    // ===== Creacion compuesta: Inscripcion + N FormacionComplementariaEty en un solo grafo =====
    //
    // Delega los 11 campos propios de "inscripcion" al toEntity() de siempre (mismos
    // @Mapping, cero duplicacion); "formacionesComplementarias" se ignora aqui porque no
    // hay una expresion @Mapping que la resuelva (son Strings sueltos, no otro DTO) -- el
    // @AfterMapping de abajo es quien realmente la construye.
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "estado", source = "inscripcion.estadoId")
    @Mapping(target = "sistema", source = "inscripcion.sistemaId")
    @Mapping(target = "jefeCarrera", source = "inscripcion.jefeCarreraId")
    @Mapping(target = "maestro", source = "inscripcion.maestroId")
    @Mapping(target = "carrera", source = "inscripcion.carreraId")
    @Mapping(target = "ambiente", source = "inscripcion.ambienteId")
    @Mapping(target = "proyecto", source = "inscripcion.proyecto")
    @Mapping(target = "version", source = "inscripcion.version")
    @Mapping(target = "descripcion", source = "inscripcion.descripcion")
    @Mapping(target = "fechaInscripcionPlanteada", source = "inscripcion.fechaInscripcionPlanteada")
    @Mapping(target = "fechaInscripcionReal", source = "inscripcion.fechaInscripcionReal")
    @Mapping(target = "formacionesComplementarias", ignore = true)
    InscripcionEty toEntityConFormaciones(InscripcionConFormacionComplementariaRequestDto dto);

    // Corre automaticamente DESPUES de toEntityConFormaciones() (MapStruct lo detecta por la
    // firma: mismo DTO de entrada + @MappingTarget del mismo tipo que devuelve ese metodo).
    // Arma cada FormacionComplementariaEty a partir de su descripcion y, clave, le setea el
    // back-reference ("inscripcion") a la entidad que se esta armando -- sin esto, el lado
    // "dueño" de la FK (FormacionComplementariaEty.inscripcion, @ManyToOne) quedaria null y
    // EclipseLink no sabria a que padre pertenece cada hijo al persistir en cascada.
    @AfterMapping
    default void agregarFormacionesComplementarias(
            InscripcionConFormacionComplementariaRequestDto dto,
            @MappingTarget InscripcionEty entidad
    ) {
        if (dto.formacionesComplementarias() == null) {
            return;
        }
        for (String descripcion : dto.formacionesComplementarias()) {
            if (descripcion == null || descripcion.trim().isEmpty()) {
                continue;
            }
            FormacionComplementariaEty hijo = new FormacionComplementariaEty();
            hijo.setDescripcion(descripcion.trim());
            hijo.setInscripcion(entidad);
            entidad.getFormacionesComplementarias().add(hijo);
        }
    }

    // Forma de SALIDA -- la Inscripcion recien creada (aplanada, como toDto() de siempre) +
    // sus formaciones complementarias, leidas DIRECTO de la coleccion que EclipseLink ya
    // populo al persistir en cascada (no hace falta volver a pedirlas a la base).
    // "source = \".\"": mapea el InscripcionEty entero al campo "inscripcion" -- MapStruct
    // encuentra solo el toDto(InscripcionEty) de arriba por tipo de retorno.
    @Mapping(target = "inscripcion", source = ".")
    @Mapping(target = "formacionesComplementarias", source = "formacionesComplementarias")
    InscripcionConFormacionComplementariaDto toDtoConFormaciones(InscripcionEty entidad);
}
