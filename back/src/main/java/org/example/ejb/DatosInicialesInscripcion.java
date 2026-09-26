package org.example.ejb;

import jakarta.annotation.PostConstruct;
import jakarta.ejb.Singleton;
import jakarta.ejb.Startup;
import jakarta.inject.Inject;
import org.example.lib.InscripcionRepository;
import org.example.lib.MiniFormAmbRepository;
import org.example.lib.MiniFormEstRepository;
import org.example.lib.MiniFormRespRepository;
import org.example.lib.MiniFormSisRepository;
import org.example.model.InscripcionEty;
import org.example.model.MiniFormAmbEty;
import org.example.model.MiniFormEstEty;
import org.example.model.MiniFormRespEty;
import org.example.model.MiniFormSisEty;

import java.time.LocalDateTime;
import java.util.List;

// Siembra 3 filas ficticias por catalogo (MiniFormEstEty/MiniFormSisEty/MiniFormRespEty/MiniFormAmbEty)
// + 3 InscripcionEty combinandolas -- dominio "solicitud/inscripcion", separado del DatosIniciales
// academico (Carrera/Materia/...). @Singleton @Startup aparte, mismo criterio que
// DatosIniciales: corre una sola vez al desplegar.
@Singleton
@Startup
public class DatosInicialesInscripcion {

    @Inject
    private MiniFormEstRepository miniFormEstRepository;

    @Inject
    private MiniFormSisRepository miniFormSisRepository;

    @Inject
    private MiniFormRespRepository miniFormRespRepository;

    @Inject
    private MiniFormAmbRepository miniFormAmbRepository;

    @Inject
    private InscripcionRepository inscripcionRepository;

    @PostConstruct
    private void inicializar() {
        if (miniFormEstRepository.findAll().findAny().isPresent()) {
            return;
        }

        List<MiniFormEstEty> estados = List.of(
                miniFormEstRepository.insert(nuevoEstado("Pendiente")),
                miniFormEstRepository.insert(nuevoEstado("En progreso")),
                miniFormEstRepository.insert(nuevoEstado("Completada"))
        );

        List<MiniFormSisEty> sistemas = List.of(
                miniFormSisRepository.insert(nuevoSistema("Portal de Clientes")),
                miniFormSisRepository.insert(nuevoSistema("Facturacion Electronica")),
                miniFormSisRepository.insert(nuevoSistema("Core Bancario"))
        );

        List<MiniFormRespEty> responsables = List.of(
                miniFormRespRepository.insert(nuevoResponsable("Marta Gimenez")),
                miniFormRespRepository.insert(nuevoResponsable("Carlos Rios")),
                miniFormRespRepository.insert(nuevoResponsable("Laura Fernandez"))
        );

        List<MiniFormAmbEty> ambientes = List.of(
                miniFormAmbRepository.insert(nuevoAmbiente("Desarrollo")),
                miniFormAmbRepository.insert(nuevoAmbiente("QA")),
                miniFormAmbRepository.insert(nuevoAmbiente("Produccion"))
        );

        inscripcionRepository.insert(nuevaInscripcion(
                estados.get(0), sistemas.get(0), responsables.get(0), responsables.get(1), responsables.get(2),
                ambientes.get(1), "Rediseno portal", "1.0.0",
                "Primera version del rediseno del portal de clientes.",
                LocalDateTime.now().plusDays(10), null));

        inscripcionRepository.insert(nuevaInscripcion(
                estados.get(1), sistemas.get(1), responsables.get(1), responsables.get(2), responsables.get(0),
                ambientes.get(2), "Migracion facturacion", "2.3.1",
                "Migracion del motor de facturacion electronica a la nueva version.",
                LocalDateTime.now().minusDays(2), null));

        inscripcionRepository.insert(nuevaInscripcion(
                estados.get(2), sistemas.get(2), responsables.get(2), responsables.get(0), responsables.get(1),
                ambientes.get(2), "Parche seguridad core", "5.1.4",
                "Parche critico de seguridad ya implantado.",
                LocalDateTime.now().minusDays(20), LocalDateTime.now().minusDays(18)));
    }

    private MiniFormEstEty nuevoEstado(String estado) {
        MiniFormEstEty e = new MiniFormEstEty();
        e.setEstado(estado);
        return e;
    }

    private MiniFormSisEty nuevoSistema(String nombre) {
        MiniFormSisEty s = new MiniFormSisEty();
        s.setNombre(nombre);
        return s;
    }

    private MiniFormRespEty nuevoResponsable(String nombreLargo) {
        MiniFormRespEty r = new MiniFormRespEty();
        r.setNombreLargo(nombreLargo);
        return r;
    }

    private MiniFormAmbEty nuevoAmbiente(String nombre) {
        MiniFormAmbEty a = new MiniFormAmbEty();
        a.setNombre(nombre);
        return a;
    }

    private InscripcionEty nuevaInscripcion(
            MiniFormEstEty estado, MiniFormSisEty sistema,
            MiniFormRespEty jefeCarrera, MiniFormRespEty maestro, MiniFormRespEty carrera,
            MiniFormAmbEty ambiente, String proyecto, String version, String descripcion,
            LocalDateTime fechaPlanteada, LocalDateTime fechaReal) {
        InscripcionEty inscripcion = new InscripcionEty();
        inscripcion.setEstado(estado);
        inscripcion.setSistema(sistema);
        inscripcion.setJefeCarrera(jefeCarrera);
        inscripcion.setMaestro(maestro);
        inscripcion.setCarrera(carrera);
        inscripcion.setAmbiente(ambiente);
        inscripcion.setProyecto(proyecto);
        inscripcion.setVersion(version);
        inscripcion.setDescripcion(descripcion);
        inscripcion.setFechaInscripcionPlanteada(fechaPlanteada);
        inscripcion.setFechaInscripcionReal(fechaReal);
        return inscripcion;
    }
}
