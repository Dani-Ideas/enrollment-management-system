package org.example.builder;

import org.example.model.Clase;
import org.example.model.EstadoMatricula;
import org.example.model.Estudiante;
import org.example.model.Matricula;

import java.time.LocalDate;

// Builder mas simple que ClaseBuilder -- aqui no hay reglas cruzadas que validar (esas ya
// las valida MatriculaServiceImpl antes de llamar a este Builder, porque necesitan el
// Repository para contar cupos/duplicados). Lo que este Builder aporta es no dejar que se
// arme una Matricula a medias: valores por defecto sensatos (estado EN_CURSO, fecha de hoy)
// en un solo lugar, en vez de repetir "new Matricula(); m.setEstado(EN_CURSO); ..." en cada
// caller.
public class MatriculaBuilder {

    private Estudiante estudiante;
    private Clase clase;
    private EstadoMatricula estado = EstadoMatricula.EN_CURSO;
    private LocalDate fechaInscripcion = LocalDate.now();
    private LocalDate fechaCompletada;

    public MatriculaBuilder estudiante(Estudiante estudiante) {
        this.estudiante = estudiante;
        return this;
    }

    public MatriculaBuilder clase(Clase clase) {
        this.clase = clase;
        return this;
    }

    public MatriculaBuilder estado(EstadoMatricula estado) {
        this.estado = estado;
        return this;
    }

    public MatriculaBuilder fechaInscripcion(LocalDate fecha) {
        this.fechaInscripcion = fecha;
        return this;
    }

    public MatriculaBuilder fechaCompletada(LocalDate fecha) {
        this.fechaCompletada = fecha;
        return this;
    }

    public Matricula build() {
        if (estudiante == null) {
            throw new IllegalStateException("estudiante es obligatorio");
        }
        if (clase == null) {
            throw new IllegalStateException("clase es obligatoria");
        }
        Matricula matricula = new Matricula();
        matricula.setEstudiante(estudiante);
        matricula.setClase(clase);
        matricula.setEstado(estado);
        matricula.setFechaInscripcion(fechaInscripcion);
        matricula.setFechaCompletada(fechaCompletada);
        return matricula;
    }
}
