package org.example.lib;

import org.example.dto.FormacionComplementariaDto;
import org.example.dto.InscripcionDto;
import org.example.dto.MiniFormAmbDto;
import org.example.dto.MiniFormEstDto;
import org.example.dto.MiniFormRespDto;
import org.example.dto.MiniFormSisDto;
import org.example.dto.TablasInscripcionDto;
import org.example.model.FormacionComplementariaEty;
import org.example.model.InscripcionEty;

import java.util.List;

// "Base de datos artifax" (en memoria): cache de LECTURA de los 4 catalogos estaticos
// (Estado/Sistema/Responsable/Ambiente), de InscripcionEty (para filtrar por
// estado/sistema/ambiente sin ir a la BD) y de FormacionComplementariaEty (para filtrar por
// inscripcionId). Un cache no tiene metodos de creacion/edicion/eliminacion -- esos viven
// en InscripcionService/FormacionComplementariaService, que escriben de verdad en la base y
// despues avisan ACA (refrescarInscripcion/refrescarFormacionComplementaria/
// removerFormacionComplementaria) para que el mapa en memoria no quede desactualizado.
// Unica implementacion: ServiceArtifaxImpl.
public interface ServiceArtifax {

    List<MiniFormEstDto> listarEstados();

    List<MiniFormSisDto> listarSistemas();

    List<MiniFormRespDto> listarResponsables();

    List<MiniFormAmbDto> listarAmbientes();

    // "Tablas genericas": los 4 catalogos de arriba en un solo bundle -- ver
    // TablasInscripcionDto/CatalogosInscripcionController.
    TablasInscripcionDto tablasInscripcion();

    // Filtro de la "mini base de datos" en memoria -- cada parametro null significa "no
    // filtrar por este campo" (asi listarInscripciones(null, null, null) devuelve todo).
    List<InscripcionDto> listarInscripciones(Long estadoId, Long sistemaId, Long ambienteId);

    // Llamado por InscripcionServiceImpl DESPUES de escribir de verdad en la base.
    void refrescarInscripcion(InscripcionEty entidad);

    // inscripcionId null = todas las formaciones complementarias, de cualquier inscripcion.
    List<FormacionComplementariaDto> listarFormacionesComplementariasPorInscripcion(Long inscripcionId);

    // Llamados por FormacionComplementariaServiceImpl DESPUES de escribir de verdad en la
    // base -- UNICOS puntos de entrada para que una escritura real se refleje en el mapa.
    void refrescarFormacionComplementaria(FormacionComplementariaEty entidad);

    void removerFormacionComplementaria(Long id);
}
