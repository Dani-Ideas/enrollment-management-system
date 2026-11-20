package org.example.general;

import jakarta.ws.rs.ApplicationPath;
import org.example.estaticos.rest.*;
import org.example.dinamicas.rest.InscripcionController;
import org.example.dinamicas.rest.SolNInscripcionController;
import org.example.dinamicas.rest.InscripcionChecklistController;
import org.example.dinamicas.rest.InscripcionPruebaController;
import org.example.dinamicas.rest.InscripcionDocumentoController;
import org.example.dinamicas.rest.InscripcionAvisoVersionController;
import org.example.dinamicas.rest.NotificacionCorreoController;
import org.example.dinamicas.rest.DireccionController;
import org.example.dinamicas.rest.PersonaController;
import org.example.dinamicas.rest.EntregaController;
import org.glassfish.jersey.server.ResourceConfig;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

// El "controller de controllers": la puerta de entrada unica (@ApplicationPath("/api"))
// mas el registro EXPLICITO de que Controllers/Providers cuelgan de ella -- si una clase no
// pasa por register(), no se expone, aunque tenga @Path o @Provider. Mismo patron que
// ControllerRegistry en HelloJakarta-variante.
//
// La relacion va en un solo sentido: este registro conoce a cada Controller (los importa,
// los registra), pero ningun Controller conoce a este registro.
@ApplicationPath(ApplicationConfig.Endpoints.API)
public class ApplicationConfig extends ResourceConfig {

    // Constantes de path -- una sola fuente de verdad para cada "/algo". Una anotacion solo
    // acepta CONSTANTES DE COMPILACION como valor -- un "public static final String" cuenta
    // como tal.
    //
    // OJO: que una constante exista aca NUNCA decide si el endpoint esta activo -- eso lo
    // decide, y solo lo decide, REGISTRO_ACTIVO mas abajo.
    public static final class Endpoints {
        private Endpoints() {}

        public static final String API = "/api";

        // Dominio "solicitud/inscripcion".
        public static final String ESTADOS = "/estados";
        public static final String SISTEMAS = "/sistemas";
        public static final String RESPONSABLES = "/responsables";
        public static final String AMBIENTES = "/ambientes";
        // INSCRIPCIONES (arriba) queda solo para leer/editar lo creado antes de este cambio
        // (legacy, "Primaria" de la vieja cadena de diplomas). Para altas nuevas de
        // CUALQUIER nivel (Primaria/Secundaria/Universidad) se usa SOLICITUDES, que
        // reemplaza por completo al viejo diseño de columnas booleanas fijas por nivel
        // (Diploma*Ety/InscripcionSecundaria/UniversidadEty/CadenaDiplomas*).
        public static final String INSCRIPCIONES = "/inscripciones";

        public static final String ETAPAS_INSCRIPCION = "/etapas-inscripcion";
        public static final String TIPOS_PRUEBA = "/tipos-prueba";
        public static final String SOLICITUDES = "/solicitudes";
        public static final String SOLICITUDES_CHECKLIST = "/solicitudes/{solicitudId}/checklist";
        public static final String SOLICITUDES_PRUEBAS = "/solicitudes/{solicitudId}/pruebas";
        public static final String SOLICITUDES_DOCUMENTO = "/solicitudes/{solicitudId}/documento";
        public static final String SOLICITUDES_AVISO_VERSIONES = "/solicitudes/{solicitudId}/aviso-versiones";
        // Correo de aviso al confirmar un nivel del stepper (crear/actualizar, nunca
        // consultar) -- destinatario fijo configurado en GlassFish, ver
        // NotificacionCorreoServiceImpl.
        public static final String SOLICITUDES_NOTIFICAR = "/solicitudes/{solicitudId}/notificar-confirmacion";

        // "Tablas genericas" para el formulario de inscripcion -- no es un recurso por
        // entidad, es un bundle de los catalogos de arriba en una sola respuesta.
        public static final String CATALOGOS_INSCRIPCION = "/catalogos-inscripcion";

        // Direcciones: catalogos geograficos (cat) y personas con sus direcciones (dinamica).
        public static final String CATALOGOS_GEOGRAFICOS = "/catalogos-geograficos";
        public static final String PERSONAS = "/personas";
        public static final String DIRECCIONES = "/direcciones";

        // Ejercicio: PK compartida con la PK de Direccion (ver EntregaEty/EntregaId).
        public static final String ENTREGAS = "/entregas";

        // El propio directorio de endpoints activos (ver REGISTRO_ACTIVO/listEndpoints()
        // abajo, y EndpointsController.java).
        public static final String ENDPOINTS = "/endpoints";
    }

    // LA fuente de verdad de que esta activo: un path solo cuenta como "activo" si esta en
    // este mapa. register() (constructor) y listEndpoints() leen del MISMO mapa, asi que
    // "estar en la lista" y "estar registrado" son literalmente lo mismo.
    private static final Map<String, Class<?>> REGISTRO_ACTIVO = new LinkedHashMap<>();
    static {
        REGISTRO_ACTIVO.put(Endpoints.ESTADOS, MiniFormEstController.class);
        REGISTRO_ACTIVO.put(Endpoints.SISTEMAS, MiniFormSisController.class);
        REGISTRO_ACTIVO.put(Endpoints.RESPONSABLES, MiniFormRespController.class);
        REGISTRO_ACTIVO.put(Endpoints.AMBIENTES, MiniFormAmbController.class);
        REGISTRO_ACTIVO.put(Endpoints.INSCRIPCIONES, InscripcionController.class);
        REGISTRO_ACTIVO.put(Endpoints.ETAPAS_INSCRIPCION, CatEtapaInscripcionController.class);
        REGISTRO_ACTIVO.put(Endpoints.TIPOS_PRUEBA, CatTipoPruebaController.class);
        REGISTRO_ACTIVO.put(Endpoints.SOLICITUDES, SolNInscripcionController.class);
        REGISTRO_ACTIVO.put(Endpoints.SOLICITUDES_CHECKLIST, InscripcionChecklistController.class);
        REGISTRO_ACTIVO.put(Endpoints.SOLICITUDES_PRUEBAS, InscripcionPruebaController.class);
        REGISTRO_ACTIVO.put(Endpoints.SOLICITUDES_DOCUMENTO, InscripcionDocumentoController.class);
        REGISTRO_ACTIVO.put(Endpoints.SOLICITUDES_AVISO_VERSIONES, InscripcionAvisoVersionController.class);
        REGISTRO_ACTIVO.put(Endpoints.SOLICITUDES_NOTIFICAR, NotificacionCorreoController.class);
        REGISTRO_ACTIVO.put(Endpoints.CATALOGOS_INSCRIPCION, CatalogosInscripcionController.class);
        REGISTRO_ACTIVO.put(Endpoints.CATALOGOS_GEOGRAFICOS, CatalogosGeograficosController.class);
        REGISTRO_ACTIVO.put(Endpoints.PERSONAS, PersonaController.class);
        REGISTRO_ACTIVO.put(Endpoints.DIRECCIONES, DireccionController.class);
        REGISTRO_ACTIVO.put(Endpoints.ENTREGAS, EntregaController.class);
    }

    // Expuesto por EndpointsController (GET /api/endpoints) -- el front lo consume en
    // client.ts para saber, en tiempo real, que paths existen de verdad, en vez de confiar
    // solo en strings escritos a mano que se pueden desincronizar del backend real.
    public static List<String> listEndpoints() {
        return List.copyOf(REGISTRO_ACTIVO.keySet());
    }

    public ApplicationConfig() {
        // Controllers -- uno por entrada de REGISTRO_ACTIVO.
        REGISTRO_ACTIVO.values().forEach(this::register);
        // Providers -- mappers de excepcion transversales a todos los Controller, mas el
        // directorio de endpoints. No van en REGISTRO_ACTIVO: son infraestructura, no
        // recursos de dominio que el front mapee 1:1 con un fetchX().
        register(ReglaDeNegocioExceptionMapper.class);
        register(RecursoNoEncontradoExceptionMapper.class);
        register(ReferenciaInvalidaExceptionMapper.class);
        register(ValidationExceptionMapper.class);
        register(ExcepcionNoControladaMapper.class);
        register(EndpointsController.class);
    }
}
