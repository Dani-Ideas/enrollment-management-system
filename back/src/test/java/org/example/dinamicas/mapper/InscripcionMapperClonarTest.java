package org.example.dinamicas.mapper;

import org.example.dinamicas.dto.ClonarInscripcionDto;
import org.example.dinamicas.model.FormacionComplementariaEty;
import org.example.dinamicas.model.InscripcionEty;
import org.example.estaticos.model.MiniFormEstEty;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;

// Sin Mockito: instancia el InscripcionMapperImpl que genera MapStruct de verdad (no hace
// falta CDI/GlassFish -- clonarDesde() solo copia Entidad->Entidad, ningun mapper de
// catalogos de por medio). Prueba el "transformador final" al que convergen toEntity(DTO1)
// y clonarDesde(DTO2): que copie lo comun del origen y resetee lo que SI debe cambiar.
class InscripcionMapperClonarTest {

    private final InscripcionMapper mapper = new InscripcionMapperImpl();

    @Test
    void clonarCopiaCamposComunesPeroResetIdYFormaciones() {
        MiniFormEstEty estado = new MiniFormEstEty();

        InscripcionEty origen = new InscripcionEty();
        origen.setId(10L);
        origen.setProyecto("Proyecto original");
        origen.setVersion("v1.0");
        origen.setEstado(estado);
        origen.setFechaInscripcionPlanteada(LocalDateTime.of(2026, 1, 1, 0, 0));
        origen.setFormacionesComplementarias(List.of(new FormacionComplementariaEty()));

        ClonarInscripcionDto dto = new ClonarInscripcionDto(10L, "Proyecto clonado");

        InscripcionEty clon = mapper.clonarDesde(origen, dto);

        assertNull(clon.getId(), "una fila nueva no hereda el id del origen");
        assertEquals("Proyecto clonado", clon.getProyecto(), "el DTO2 manda sobre el campo que vino a cambiar");
        assertEquals("v1.0", clon.getVersion(), "lo demas SI se copia del origen, sin repetir logica");
        assertSame(estado, clon.getEstado());
        assertTrue(clon.getFormacionesComplementarias().isEmpty(), "las formaciones son hijas del origen, no del clon");
    }
}
