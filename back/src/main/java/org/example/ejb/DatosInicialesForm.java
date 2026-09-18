package org.example.ejb;

import jakarta.annotation.PostConstruct;
import jakarta.ejb.Singleton;
import jakarta.ejb.Startup;
import jakarta.inject.Inject;
import org.example.lib.FormRepository;
import org.example.lib.MiniFormAmbRepository;
import org.example.lib.MiniFormEstRepository;
import org.example.lib.MiniFormRespRepository;
import org.example.lib.MiniFormSisRepository;
import org.example.model.Form;
import org.example.model.MiniFormAmb;
import org.example.model.MiniFormEst;
import org.example.model.MiniFormResp;
import org.example.model.MiniFormSis;

import java.time.LocalDateTime;
import java.util.List;

// Siembra 3 filas ficticias por catalogo (MiniFormEst/MiniFormSis/MiniFormResp/MiniFormAmb)
// + 3 Form combinandolas -- dominio "solicitud/implantacion", separado del DatosIniciales
// academico (Carrera/Materia/...). @Singleton @Startup aparte, mismo criterio que
// DatosIniciales: corre una sola vez al desplegar.
@Singleton
@Startup
public class DatosInicialesForm {

    @Inject
    private MiniFormEstRepository miniFormEstRepository;

    @Inject
    private MiniFormSisRepository miniFormSisRepository;

    @Inject
    private MiniFormRespRepository miniFormRespRepository;

    @Inject
    private MiniFormAmbRepository miniFormAmbRepository;

    @Inject
    private FormRepository formRepository;

    @PostConstruct
    private void inicializar() {
        if (miniFormEstRepository.findAll().findAny().isPresent()) {
            return;
        }

        List<MiniFormEst> estados = List.of(
                miniFormEstRepository.insert(nuevoEstado("Pendiente")),
                miniFormEstRepository.insert(nuevoEstado("En progreso")),
                miniFormEstRepository.insert(nuevoEstado("Completada"))
        );

        List<MiniFormSis> sistemas = List.of(
                miniFormSisRepository.insert(nuevoSistema("Portal de Clientes")),
                miniFormSisRepository.insert(nuevoSistema("Facturacion Electronica")),
                miniFormSisRepository.insert(nuevoSistema("Core Bancario"))
        );

        List<MiniFormResp> responsables = List.of(
                miniFormRespRepository.insert(nuevoResponsable("Marta Gimenez")),
                miniFormRespRepository.insert(nuevoResponsable("Carlos Rios")),
                miniFormRespRepository.insert(nuevoResponsable("Laura Fernandez"))
        );

        List<MiniFormAmb> ambientes = List.of(
                miniFormAmbRepository.insert(nuevoAmbiente("Desarrollo")),
                miniFormAmbRepository.insert(nuevoAmbiente("QA")),
                miniFormAmbRepository.insert(nuevoAmbiente("Produccion"))
        );

        formRepository.insert(nuevoForm(
                estados.get(0), sistemas.get(0), responsables.get(0), responsables.get(1), responsables.get(2),
                ambientes.get(1), "Rediseno portal", "1.0.0",
                "Primera version del rediseno del portal de clientes.",
                LocalDateTime.now().plusDays(10), null));

        formRepository.insert(nuevoForm(
                estados.get(1), sistemas.get(1), responsables.get(1), responsables.get(2), responsables.get(0),
                ambientes.get(2), "Migracion facturacion", "2.3.1",
                "Migracion del motor de facturacion electronica a la nueva version.",
                LocalDateTime.now().minusDays(2), null));

        formRepository.insert(nuevoForm(
                estados.get(2), sistemas.get(2), responsables.get(2), responsables.get(0), responsables.get(1),
                ambientes.get(2), "Parche seguridad core", "5.1.4",
                "Parche critico de seguridad ya implantado.",
                LocalDateTime.now().minusDays(20), LocalDateTime.now().minusDays(18)));
    }

    private MiniFormEst nuevoEstado(String estado) {
        MiniFormEst e = new MiniFormEst();
        e.setEstado(estado);
        return e;
    }

    private MiniFormSis nuevoSistema(String nombre) {
        MiniFormSis s = new MiniFormSis();
        s.setNombre(nombre);
        return s;
    }

    private MiniFormResp nuevoResponsable(String nombreLargo) {
        MiniFormResp r = new MiniFormResp();
        r.setNombreLargo(nombreLargo);
        return r;
    }

    private MiniFormAmb nuevoAmbiente(String nombre) {
        MiniFormAmb a = new MiniFormAmb();
        a.setNombre(nombre);
        return a;
    }

    private Form nuevoForm(
            MiniFormEst estado, MiniFormSis sistema,
            MiniFormResp responsableProyecto, MiniFormResp responsableDesarrollo, MiniFormResp responsableImplantacion,
            MiniFormAmb ambiente, String proyecto, String version, String descripcion,
            LocalDateTime fechaPlanteada, LocalDateTime fechaReal) {
        Form form = new Form();
        form.setEstado(estado);
        form.setSistema(sistema);
        form.setResponsableProyecto(responsableProyecto);
        form.setResponsableDesarrollo(responsableDesarrollo);
        form.setResponsableImplantacion(responsableImplantacion);
        form.setAmbiente(ambiente);
        form.setProyecto(proyecto);
        form.setVersion(version);
        form.setDescripcion(descripcion);
        form.setFechaImplantacionPlanteada(fechaPlanteada);
        form.setFechaImplantacionReal(fechaReal);
        return form;
    }
}
