package org.example.rest;

import jakarta.ws.rs.ApplicationPath;
import org.glassfish.jersey.server.ResourceConfig;

// El "controller de controllers": la puerta de entrada unica (@ApplicationPath("/api"))
// mas el registro EXPLICITO de que Controllers/Providers cuelgan de ella -- si una clase no
// pasa por register(), no se expone, aunque tenga @Path o @Provider. Mismo patron que
// ControllerRegistry en HelloJakarta-variante, adaptado a las entidades reales de este
// proyecto (Carrera/Materia/Profesor/Clase/Estudiante/Matricula, no Producto/Factura/...).
//
// La relacion va en un solo sentido: este registro conoce a cada Controller (los importa,
// los registra), pero ningun Controller conoce a este registro.
//
// Sin CorsFilter a proposito: a diferencia de HelloJakarta-variante, este backend todavia
// no tiene un frontend integrado -- si mas adelante el frontend vive en el mismo WAR
// (mismo origen), no hace falta CORS; si termina siendo un origen distinto, ahi si habria
// que agregar uno.
@ApplicationPath(ApplicationConfig.Endpoints.API)
public class ApplicationConfig extends ResourceConfig {

    // Constantes de path -- una sola fuente de verdad para cada "/algo", en vez de repetir
    // el String literal en cada @Path(...) de cada Controller. Una anotacion solo acepta
    // CONSTANTES DE COMPILACION como valor -- un "public static final String" cuenta como
    // tal, por eso @Path(Endpoints.CARRERAS) seria legal exactamente igual que
    // @Path("/carreras") (los Controllers de este proyecto hoy siguen usando el String
    // literal directo -- si se quiere sincronizarlos con estas constantes, hay que
    // actualizarlos a mano, uno por uno).
    public static final class Endpoints {
        private Endpoints() {}

        public static final String API = "/api";
        public static final String CARRERAS = "/carreras";
        public static final String MATERIAS = "/materias";
        public static final String PROFESORES = "/profesores";
        public static final String CLASES = "/clases";
        public static final String ESTUDIANTES = "/estudiantes";
        public static final String MATRICULAS = "/matriculas";

        // Dominio "solicitud/implantacion" -- separado del academico de arriba, comparte
        // el mismo WAR/base de datos pero es un modulo sin relacion conceptual.
        public static final String ESTADOS = "/estados";
        public static final String SISTEMAS = "/sistemas";
        public static final String RESPONSABLES = "/responsables";
        public static final String AMBIENTES = "/ambientes";
        public static final String IMPLANTACIONES = "/implantaciones";

        // "Tablas genericas" para el formulario de implantacion -- no es un recurso por
        // entidad, es un bundle de los 4 catalogos de arriba en una sola respuesta.
        public static final String CATALOGOS_IMPLANTACION = "/catalogos-implantacion";
    }

    public ApplicationConfig() {
        // Controllers -- dominio academico
        register(CarreraController.class);
        register(MateriaController.class);
        register(ProfesorController.class);
        register(ClaseController.class);
        register(EstudianteController.class);
        register(MatriculaController.class);
        // Controllers -- dominio solicitud/implantacion (tabla/clases renombradas: antes
        // Estado/Sistema/Responsable/Ambiente/Implantacion, ahora MiniFormEst/MiniFormSis/
        // MiniFormResp/MiniFormAmb/Form -- los paths de Endpoints de arriba NO cambiaron)
        register(MiniFormEstController.class);
        register(MiniFormSisController.class);
        register(MiniFormRespController.class);
        register(MiniFormAmbController.class);
        register(FormController.class);
        register(CatalogosImplantacionController.class);
        // Providers -- mappers de excepcion transversales a todos los Controller
        register(ReglaDeNegocioExceptionMapper.class);
        register(ValidationExceptionMapper.class);
    }
}
