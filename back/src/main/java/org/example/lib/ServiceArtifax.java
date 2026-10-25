package org.example.lib;

import org.example.dto.MiniFormAmbDto;
import org.example.dto.MiniFormEstDto;
import org.example.dto.MiniFormRespDto;
import org.example.dto.MiniFormSisDto;
import org.example.dto.TablasInscripcionDto;

import java.util.List;

// "Base de datos artifax" (en memoria): cache de LECTURA de los 4 catalogos estaticos
// (Estado/Sistema/Responsable/Ambiente) -- son tablas basicas, estaticas el 99% del
// tiempo, y nunca se escriben desde ningun endpoint de este proyecto.
//
// InscripcionEty y FormacionComplementariaEty NO se cachean aca -- cambian todo el tiempo
// (se crean/editan/borran constantemente), cachear eso deja de ser "una base de datos en
// cache de tablas estaticas" y pasa a ser reimplementar la base de datos en memoria. Esas
// dos leen siempre directo del Repository (InscripcionRepository/
// FormacionComplementariaRepository, via InscripcionService).
//
// Unica implementacion: ServiceArtifaxImpl.
public interface ServiceArtifax {

    List<MiniFormEstDto> listarEstados();

    List<MiniFormSisDto> listarSistemas();

    List<MiniFormRespDto> listarResponsables();

    List<MiniFormAmbDto> listarAmbientes();

    // "Tablas genericas": los 4 catalogos de arriba en un solo bundle -- ver
    // TablasInscripcionDto/CatalogosInscripcionController.
    TablasInscripcionDto tablasInscripcion();
}
