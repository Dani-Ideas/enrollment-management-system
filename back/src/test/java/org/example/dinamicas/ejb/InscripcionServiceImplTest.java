package org.example.dinamicas.ejb;

import org.example.comun.RecursoNoEncontradoException;
import org.example.comun.ReferenciaInvalidaException;
import org.example.dinamicas.dto.FormacionComplementariaRequestDto;
import org.example.dinamicas.dto.InscripcionConFormacionComplementariaRequestDto;
import org.example.dinamicas.mapper.FormacionComplementariaMapper;
import org.example.dinamicas.mapper.InscripcionMapper;
import org.example.dinamicas.model.FormacionComplementariaEty;
import org.example.dinamicas.model.InscripcionEty;
import org.example.dinamicas.repository.FormacionComplementariaRepository;
import org.example.dinamicas.repository.InscripcionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

// Prueba unitaria: repositorios y mappers simulados (Mockito), sin GlassFish ni base. Cubre
// los caminos de crear()/actualizar(), sobre todo la sincronizacion de formaciones, que ya
// tuvo un bug que borraba datos.
@ExtendWith(MockitoExtension.class)
class InscripcionServiceImplTest {

    @Mock
    private InscripcionRepository inscripcionRepository;
    @Mock
    private FormacionComplementariaRepository formacionComplementariaRepository;
    @Mock
    private FormacionComplementariaMapper formacionComplementariaMapper;
    @Mock
    private InscripcionMapper inscripcionMapper;

    @InjectMocks
    private InscripcionServiceImpl service;

    @Captor
    private ArgumentCaptor<List<FormacionComplementariaEty>> listaCaptor;

    // --- Id inexistente ---

    @Test
    void buscarPorIdInexistenteLanza404() {
        when(inscripcionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class, () -> service.buscarPorId(99L));
    }

    @Test
    void actualizarInexistenteLanza404YNoGuardaNada() {
        when(inscripcionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class,
                () -> service.actualizar(99L, peticion(List.of())));
        verify(inscripcionRepository, never()).update(any());
        verifyNoInteractions(formacionComplementariaRepository);
    }

    // --- crear() ---

    @Test
    void crearAsignaLaInscripcionCreadaACadaFormacion() {
        InscripcionEty creada = inscripcion(10L);
        when(inscripcionRepository.insert(any())).thenReturn(creada);
        FormacionComplementariaEty nueva = new FormacionComplementariaEty();
        when(formacionComplementariaMapper.toEntity(anyList())).thenReturn(List.of(nueva));

        service.crear(peticion(List.of(new FormacionComplementariaRequestDto(null, "Curso"))));

        verify(formacionComplementariaRepository).insertAll(listaCaptor.capture());
        assertSame(creada, listaCaptor.getValue().get(0).getInscripcion());
    }

    @Test
    void crearConListaNullNoFalla() {
        when(inscripcionRepository.insert(any())).thenReturn(inscripcion(10L));

        service.crear(peticion(null));

        verify(formacionComplementariaMapper).toEntity(List.<FormacionComplementariaRequestDto>of());
    }

    // --- actualizar(): sincronizacion de formaciones ---

    @Test
    void listaNullNoTocaLasFormaciones() {
        InscripcionEty existente = inscripcionConFormaciones(1L, 2L);
        prepararActualizar(existente);

        service.actualizar(10L, peticion(null));

        verifyNoInteractions(formacionComplementariaRepository);
        assertEquals(2, existente.getFormacionesComplementarias().size());
    }

    @Test
    void listaVaciaBorraTodasLasFormaciones() {
        InscripcionEty existente = inscripcionConFormaciones(1L, 2L);
        prepararActualizar(existente);

        service.actualizar(10L, peticion(List.of()));

        verify(formacionComplementariaRepository).deleteAll(listaCaptor.capture());
        assertEquals(List.of(1L, 2L), ids(listaCaptor.getValue()));
        verify(formacionComplementariaRepository, never()).updateAll(anyList());
        verify(formacionComplementariaRepository, never()).insertAll(anyList());
    }

    @Test
    void borraLaQueFaltaActualizaLaQueSigueYCreaLaNueva() {
        InscripcionEty existente = inscripcionConFormaciones(1L, 2L);
        prepararActualizar(existente);
        FormacionComplementariaEty nueva = new FormacionComplementariaEty();
        when(formacionComplementariaMapper.toEntity(anyList())).thenReturn(List.of(nueva));
        when(formacionComplementariaRepository.insertAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

        service.actualizar(10L, peticion(List.of(
                new FormacionComplementariaRequestDto(1L, "Texto editado"),
                new FormacionComplementariaRequestDto(null, "Nueva"))));

        verify(formacionComplementariaRepository).deleteAll(listaCaptor.capture());
        assertEquals(List.of(2L), ids(listaCaptor.getValue()));

        verify(formacionComplementariaRepository).updateAll(listaCaptor.capture());
        FormacionComplementariaEty actualizada = listaCaptor.getValue().get(0);
        assertEquals(1L, actualizada.getId());
        assertEquals("Texto editado", actualizada.getDescripcion());

        assertSame(existente, nueva.getInscripcion());
    }

    @Test
    void idDeFormacionAjenoLanza422() {
        prepararActualizar(inscripcionConFormaciones(1L));

        assertThrows(ReferenciaInvalidaException.class, () -> service.actualizar(10L,
                peticion(List.of(new FormacionComplementariaRequestDto(99L, "No es de esta inscripcion")))));
    }

    // --- Helpers ---

    private void prepararActualizar(InscripcionEty existente) {
        when(inscripcionRepository.findById(10L)).thenReturn(Optional.of(existente));
        when(inscripcionRepository.update(existente)).thenReturn(existente);
    }

    // inscripcion = null: el mapper esta simulado, no hace falta un InscripcionRequestDto real.
    private static InscripcionConFormacionComplementariaRequestDto peticion(List<FormacionComplementariaRequestDto> formaciones) {
        return new InscripcionConFormacionComplementariaRequestDto(null, formaciones);
    }

    private static InscripcionEty inscripcion(Long id) {
        InscripcionEty inscripcion = new InscripcionEty();
        inscripcion.setId(id);
        return inscripcion;
    }

    private static InscripcionEty inscripcionConFormaciones(Long... idsFormaciones) {
        InscripcionEty inscripcion = inscripcion(10L);
        List<FormacionComplementariaEty> formaciones = new ArrayList<>();
        for (Long id : idsFormaciones) {
            FormacionComplementariaEty formacion = new FormacionComplementariaEty();
            formacion.setId(id);
            formacion.setDescripcion("Formacion " + id);
            formacion.setInscripcion(inscripcion);
            formaciones.add(formacion);
        }
        inscripcion.setFormacionesComplementarias(formaciones);
        return inscripcion;
    }

    private static List<Long> ids(List<FormacionComplementariaEty> formaciones) {
        return formaciones.stream().map(FormacionComplementariaEty::getId).toList();
    }
}
