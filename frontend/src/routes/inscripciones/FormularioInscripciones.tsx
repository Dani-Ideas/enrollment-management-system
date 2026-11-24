import { useEffect, useState } from "react"
import { Link } from "@tanstack/react-router"
import { formularioPagoRoute } from "@/router"
import {
  type PasoCadena,
  ALTO_ENCABEZADO_ESCRITORIO,
  modoDe,
  PANEL_RESUMEN,
  PasoConfirmarCadena,
  PasoConfirmarCreacion,
  PasoDatos,
  PasoElegirSolicitud,
  PasoLista,
  PasoPaneles,
  PasosNavegacion,
  PERFIL_PASO,
  ResumenCadena,
  useInscripcionForm,
} from "@/components/inscripcion-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ArrowLeftIcon, PanelLeftCloseIcon, PanelLeftOpenIcon, RotateCcwIcon } from "lucide-react"

// "Fantasma" que se pisa con el rect real del Card del formulario y, un frame despues, con
// el rect real de la fila nueva del Resumen -- la transicion CSS (transition-all) interpola
// posicion/tamaño entre esos dos rects. onTransitionEnd desmonta el fantasma -- para entonces
// la fila real del Resumen ya esta ahi debajo, la ilusion queda completa.
function TransformacionPaso({
  desde,
  hasta,
  onTerminar,
}: {
  desde: DOMRect
  hasta: DOMRect
  onTerminar: () => void
}) {
  const [rect, setRect] = useState(desde)

  useEffect(() => {
    const cuadro = requestAnimationFrame(() => setRect(hasta))
    return () => cancelAnimationFrame(cuadro)
  }, [hasta])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-50 rounded-xl border bg-card shadow-2xl ring-foreground/20 transition-all duration-500 ease-in-out"
      style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
      onTransitionEnd={onTerminar}
    />
  )
}

// Esta pagina NO sabe que pasos existen ni en que orden: eso lo decide el flujo (pasosDe en
// types.ts, segun accion y ambiente) y el hook lo expone ya resuelto en "pasos". Aca solo se
// monta un slide por paso y se le pide a cada uno su pantalla.
//
// Y tampoco hay una pantalla por paso: hay SEIS pantallas que se combinan. Cada paso declara
// en PERFIL_PASO de que tipo es y de que nivel de la cadena habla; el modo (crear/actualizar/
// consultar) sale de la accion. Los 3 niveles comparten las mismas dos pantallas -- "datos" y
// "paneles" -- y lo unico que cambia entre ellos es que estado usan, que lo resuelve
// perfilNivel() en el hook. De ahi que agregar un paso sea tocar una tabla, no este archivo.
export function FormularioInscripciones() {
  // "?accion=...&ambiente=..." -- la ruta ya los valido (ver router.tsx) y el hook los
  // consume: elige la accion una sola vez y precarga el ambiente (crear) o su filtro
  // (actualizar). Aca no queda nada mas que pasarlos.
  const wizard = useInscripcionForm(formularioPagoRoute.useSearch())
  const {
    accion,
    pasos,
    llevaPaneles,
    empezarDeNuevo,
    // Layout: escritorio vs. columna angosta, el panel colapsable del Resumen, y los 2 refs
    // + el rect del "fantasma" que anima cada paso completado hacia su fila del Resumen.
    esEscritorio,
    resumenPanelRef,
    resumenColapsado,
    setResumenColapsado,
    alternarResumen,
    cardRef,
    resumenRef,
    transformacion,
    limpiarTransformacion,
    current,
    maxStep,
    irAPaso,
    anterior,
    setApi,
    cadenaMutation,
    seccionesResumen,
  } = wizard

  function contenidoPaso(paso: PasoCadena) {
    const { tipo, nivel } = PERFIL_PASO[paso]
    const modo = modoDe(accion)

    switch (tipo) {
      case "lista":
        return <PasoLista wizard={wizard} />
      case "elegir":
        return <PasoElegirSolicitud wizard={wizard} />
      case "confirmar-creacion":
        return <PasoConfirmarCreacion wizard={wizard} />
      case "confirmar-cadena":
        return <PasoConfirmarCadena wizard={wizard} />
      case "datos":
        return nivel === null ? null : <PasoDatos wizard={wizard} nivel={nivel} modo={modo} />
      case "paneles":
        return nivel === null ? null : <PasoPaneles wizard={wizard} nivel={nivel} modo={modo} />
    }
  }

  const encabezado = (
    <>
      <Button variant="outline" size="sm" className="mb-4" nativeButton={false} render={<Link to="/" />}>
        <ArrowLeftIcon />
        Volver al menú principal
      </Button>
      <h2>Solicitudes de inscripción</h2>
    </>
  )

  const pasosNavegacion = (
    <PasosNavegacion
      accion={accion}
      conPaneles={llevaPaneles}
      current={current}
      maxStep={maxStep}
      onIrAPaso={irAPaso}
      pasoEnCurso={cadenaMutation.isPending ? current : null}
      bloqueadoGlobalmente={cadenaMutation.isPending}
    />
  )

  const tarjetaFormulario = (
    <Card ref={cardRef} className="h-full min-w-0">
      <CardContent>
        <Carousel setApi={setApi} opts={{ watchDrag: false }} className="w-full" orientation="vertical">
          <CarouselContent className="h-(--alto-pasos-wizard)">
            {/* Un slide por paso del flujo, en el orden del flujo: asi el indice de Embla y
                el de "pasos" son el mismo por construccion, y no hay forma de que se
                desincronicen cuando el ambiente agrega o saca pasos.

                Sin accion elegida todavia no hay flujo: igual se monta un slide vacio, para
                que Embla nunca arranque con el contenedor vacio ni haya que desmontarlo y
                volverlo a montar (eso dejaria un "api" muerto en el hook). */}
            {pasos.length === 0 ? (
              <CarouselItem className="overflow-y-auto" />
            ) : (
              pasos.map((paso) => (
                <CarouselItem key={paso} className="overflow-y-auto">
                  {contenidoPaso(paso)}
                </CarouselItem>
              ))
            )}
          </CarouselContent>
        </Carousel>
      </CardContent>

      <CardFooter className="justify-between">
        <Button variant="outline" onClick={anterior} disabled={current === 0}>
          Atrás
        </Button>
        {accion !== null && (
          <Button variant="outline" onClick={empezarDeNuevo} size="sm">
            <RotateCcwIcon />
            Empezar de nuevo
          </Button>
        )}
      </CardFooter>
    </Card>
  )

  return (
    <section className="mb-12 w-full">
      {esEscritorio ? (
        // ResizablePanelGroup fuerza height:100% por INLINE style (pisa cualquier clase que
        // se le ponga a el mismo) -- la altura real hay que darsela al padre, no al grupo.
        <div className="h-(--alto-wizard-escritorio)">
          <ResizablePanelGroup orientation="horizontal">
            <ResizablePanel
              panelRef={resumenPanelRef}
              collapsible
              collapsedSize={PANEL_RESUMEN.colapsado}
              defaultSize={PANEL_RESUMEN.defecto}
              minSize={PANEL_RESUMEN.minimo}
              maxSize={PANEL_RESUMEN.maximo}
              // El tamaño llega por parametro -- no se le pregunta al handle imperativo
              // (isCollapsed() tira excepcion si el panel todavia/ya no esta registrado,
              // ver alternarResumen en useInscripcionForm). collapsedSize es "0px", asi que
              // "0 pixeles" ES colapsado.
              onResize={(tamano) => setResumenColapsado(tamano.inPixels <= 0)}
            >
              <ResumenCadena ref={resumenRef} secciones={seccionesResumen} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel>
              {/* Division encabezado/formulario fija -- a diferencia de la de arriba, esta
                  NO se arrastra (handle disabled, sin grip): el encabezado es un titulo, no
                  tiene sentido redimensionarlo. */}
              <ResizablePanelGroup orientation="vertical">
                <ResizablePanel defaultSize={ALTO_ENCABEZADO_ESCRITORIO} disabled>
                  <div className="flex h-full items-start justify-between gap-2 overflow-y-auto">
                    <div>{encabezado}</div>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="shrink-0"
                      onClick={alternarResumen}
                      title={resumenColapsado ? "Mostrar resumen" : "Ocultar resumen"}
                    >
                      {resumenColapsado ? <PanelLeftOpenIcon /> : <PanelLeftCloseIcon />}
                    </Button>
                  </div>
                </ResizablePanel>
                <ResizableHandle disabled />
                <ResizablePanel disabled>
                  <div className="flex h-full flex-col gap-4 overflow-y-auto">
                    {pasosNavegacion}
                    {tarjetaFormulario}
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      ) : (
        <div className="w-full">
          {encabezado}
          {pasosNavegacion}
          {tarjetaFormulario}
        </div>
      )}

      {transformacion && (
        <TransformacionPaso
          desde={transformacion.desde}
          hasta={transformacion.hasta}
          onTerminar={limpiarTransformacion}
        />
      )}
    </section>
  )
}
