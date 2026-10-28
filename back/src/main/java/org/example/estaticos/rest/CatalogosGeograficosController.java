package org.example.estaticos.rest;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.example.estaticos.service.CatalogoGeograficoService;

import static org.example.general.ApplicationConfig.Endpoints.CATALOGOS_GEOGRAFICOS;

// Solo lectura, en cascada: paises -> estados?paisId -> municipios?estadoId ->
// colonias?municipioId. El id del padre es obligatorio (@NotNull: 400 si falta).
@RequestScoped
@Path(CATALOGOS_GEOGRAFICOS)
@Produces(MediaType.APPLICATION_JSON)
public class CatalogosGeograficosController {

    @Inject
    private CatalogoGeograficoService service;

    @GET
    @Path("/paises")
    public Response paises() {
        return Response.ok(service.listarPaises()).build();
    }

    @GET
    @Path("/estados")
    public Response estados(@QueryParam("paisId") @NotNull Long paisId) {
        return Response.ok(service.listarEstados(paisId)).build();
    }

    @GET
    @Path("/municipios")
    public Response municipios(@QueryParam("estadoId") @NotNull Long estadoId) {
        return Response.ok(service.listarMunicipios(estadoId)).build();
    }

    @GET
    @Path("/colonias")
    public Response colonias(@QueryParam("municipioId") @NotNull Long municipioId) {
        return Response.ok(service.listarColonias(municipioId)).build();
    }

    @GET
    @Path("/tipos-direccion")
    public Response tiposDireccion() {
        return Response.ok(service.listarTiposDireccion()).build();
    }
}
