package org.example.rest;

import jakarta.ws.rs.ApplicationPath;
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
    // OJO: que una constante exista (o este comentada) aqui NUNCA decidio si el endpoint
    // esta activo -- eso lo decide, y solo lo decide, REGISTRO_ACTIVO mas abajo. Las 6
    // constantes del dominio academico se dejan SIN comentar a proposito, aunque ese
    // dominio ya no este activo: CarreraController/MateriaController/... (que siguen
    // existiendo en el arbol de codigo, solo que sin registrar) las importan con
    // "import static" -- comentar la constante rompe la compilacion de esos archivos.
    public static final class Endpoints {
        private Endpoints() {}

        public static final String API = "/api";

        // Dominio academico -- declaradas pero NO en REGISTRO_ACTIVO (por eso no
        // aparecen en listEndpoints() ni responden por HTTP, aunque la constante exista).
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

        // El propio directorio de endpoints activos (ver REGISTRO_ACTIVO/listEndpoints()
        // abajo, y EndpointsController.java).
        public static final String ENDPOINTS = "/endpoints";
    }

    // LA fuente de verdad de que esta activo -- un path solo cuenta como "activo" si esta
    // en este mapa. register() (constructor, abajo) y listEndpoints() (metodo, abajo) leen
    // del MISMO mapa, asi que nunca pueden desincronizarse entre si: antes, comentar o
    // descomentar una constante de Endpoints no cambiaba nada de verdad (el registro real
    // vivia aparte, en las llamadas sueltas a register()) -- con este mapa, "estar en la
    // lista" y "estar registrado" pasan a ser LITERALMENTE lo mismo.
    //
    // Para reactivar el dominio academico: agregar aqui las 6 entradas que faltan
    // (Endpoints.CARRERAS -> CarreraController.class, etc.) -- nada mas hace falta tocar,
    // register() y listEndpoints() las recogen solas.
    private static final Map<String, Class<?>> REGISTRO_ACTIVO = new LinkedHashMap<>();
    static {
        REGISTRO_ACTIVO.put(Endpoints.ESTADOS, MiniFormEstController.class);
        REGISTRO_ACTIVO.put(Endpoints.SISTEMAS, MiniFormSisController.class);
        REGISTRO_ACTIVO.put(Endpoints.RESPONSABLES, MiniFormRespController.class);
        REGISTRO_ACTIVO.put(Endpoints.AMBIENTES, MiniFormAmbController.class);
        REGISTRO_ACTIVO.put(Endpoints.IMPLANTACIONES, FormController.class);
        REGISTRO_ACTIVO.put(Endpoints.CATALOGOS_IMPLANTACION, CatalogosImplantacionController.class);
    }

    // Expuesto por EndpointsController (GET /api/endpoints) -- el front lo consume en
    // client.ts para saber, en tiempo real, que paths existen de verdad, en vez de confiar
    // solo en strings escritos a mano que se pueden desincronizar del backend real.
    public static List<String> listEndpoints() {
        return List.copyOf(REGISTRO_ACTIVO.keySet());
    }

    public ApplicationConfig() {
        // Controllers -- uno por entrada de REGISTRO_ACTIVO (dominio academico queda
        // fuera hasta que se agregue ahi arriba).
        REGISTRO_ACTIVO.values().forEach(this::register);
        // Providers -- mappers de excepcion transversales a todos los Controller, mas el
        // directorio de endpoints. No van en REGISTRO_ACTIVO: son infraestructura, no
        // recursos de dominio que el front mapee 1:1 con un fetchX().
        register(ReglaDeNegocioExceptionMapper.class);
        register(ValidationExceptionMapper.class);
        register(EndpointsController.class);
    }
}
