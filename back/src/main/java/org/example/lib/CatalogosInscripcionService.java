package org.example.lib;

import org.example.dto.InscripcionCompuestaDto;
import org.example.dto.InscripcionCompuestaRequestDto;
import org.example.dto.TablasInscripcionDto;

// Service EXCLUSIVO de CatalogosInscripcionController -- antes ese Controller llamaba
// directo a ServiceArtifax, mezclando "el cache de catalogos" con "quien atiende a este
// Controller puntual".
//
// crearInscripcionConFormaciones() tambien vive aca (a pedido): orquesta, en una sola
// llamada, InscripcionService.crear() + N x FormacionComplementariaService.crear() -- las
// dos escrituras corren dentro de la MISMA transaccion (el @Stateless de la implementacion
// es el limite transaccional), asi que si falla la creacion de alguna formacion
// complementaria, la Inscripcion recien creada tambien se revierte.
public interface CatalogosInscripcionService {

    TablasInscripcionDto tablas();

    InscripcionCompuestaDto crearInscripcionConFormaciones(InscripcionCompuestaRequestDto dto);
}
