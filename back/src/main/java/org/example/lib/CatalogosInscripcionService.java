package org.example.lib;

import org.example.dto.TablasInscripcionDto;

// Service EXCLUSIVO de CatalogosInscripcionController -- antes ese Controller llamaba
// directo a ServiceArtifax, mezclando "el cache de catalogos" con "quien atiende a este
// Controller puntual". Solo expone los 4 catalogos estaticos (Estado/Sistema/Responsable/
// Ambiente) -- la creacion compuesta de Inscripcion + formaciones complementarias vive en
// InscripcionService, no aca (ese no es un catalogo, es el dominio principal).
public interface CatalogosInscripcionService {

    TablasInscripcionDto tablas();
}
