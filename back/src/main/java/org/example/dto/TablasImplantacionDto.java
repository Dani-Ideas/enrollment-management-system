package org.example.dto;

import java.io.Serializable;
import java.util.List;

// "Tablas genericas": los 4 catalogos que hoy pide el formulario de implantacion con 4
// GET separados (fetchEstados + fetchSistemas + fetchResponsables + fetchAmbientes) en
// UNA sola respuesta -- mismo patron que TablasFormularioPagoDto en HelloJakarta-variante.
public record TablasImplantacionDto(
        List<MiniFormEstDto> estados,
        List<MiniFormSisDto> sistemas,
        List<MiniFormRespDto> responsables,
        List<MiniFormAmbDto> ambientes
) implements Serializable {
}
