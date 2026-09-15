package org.example.builder;

import org.example.lib.ReglaDeNegocioException;
import org.example.model.Clase;
import org.example.model.Materia;
import org.example.model.Profesor;

import java.util.List;

// Builder: junta materia + profesor + "cuantas clases tiene ya asignadas el profesor" y
// valida DOS reglas que cruzan varias entidades antes de construir -- (1) el profesor debe
// estar habilitado para esa materia, (2) un profesor no puede tener mas de 3 clases a la
// vez. Ninguna de las dos vive en un setter de Clase/Profesor por separado porque ninguna
// de esas dos clases por si sola tiene la informacion completa para decidir -- por eso se
// centraliza aqui, en el momento de construccion, en vez de repetir el chequeo en cada
// caller (ClaseServiceImpl.crear(), DatosIniciales, etc.).
public class ClaseBuilder {

    private static final int MAX_CLASES_POR_PROFESOR = 3;

    private Materia materia;
    private Profesor profesor;
    private List<Clase> clasesActualesDelProfesor = List.of();

    public ClaseBuilder materia(Materia materia) {
        this.materia = materia;
        return this;
    }

    public ClaseBuilder profesor(Profesor profesor) {
        this.profesor = profesor;
        return this;
    }

    // El caller (el Service, que tiene acceso al Repository) es quien busca y pasa esta
    // lista -- el Builder no conoce ningun Repository, solo valida con lo que le dan.
    public ClaseBuilder clasesActualesDelProfesor(List<Clase> clases) {
        this.clasesActualesDelProfesor = clases;
        return this;
    }

    public Clase build() {
        if (materia == null) {
            throw new IllegalStateException("materia es obligatoria");
        }
        if (profesor == null) {
            throw new IllegalStateException("profesor es obligatorio");
        }

        boolean habilitado = profesor.getHabilitaciones().stream()
                .anyMatch(m -> m.getId().equals(materia.getId()));
        if (!habilitado) {
            throw new ReglaDeNegocioException(
                    "El profesor '" + profesor.getNombre() + "' no esta habilitado para dictar '"
                            + materia.getNombre() + "'");
        }

        if (clasesActualesDelProfesor.size() >= MAX_CLASES_POR_PROFESOR) {
            throw new ReglaDeNegocioException(
                    "El profesor '" + profesor.getNombre() + "' ya tiene " + MAX_CLASES_POR_PROFESOR
                            + " clases asignadas, no puede tomar otra a la vez");
        }

        Clase clase = new Clase();
        clase.setMateria(materia);
        clase.setProfesor(profesor);
        return clase;
    }
}
