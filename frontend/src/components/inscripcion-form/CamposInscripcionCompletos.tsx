import { useRef, useState } from "react"
import { CheckCircle2Icon, CircleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FieldGroup, FieldLabel, FieldSeparator, FieldSet } from "@/components/ui/field"
import { Progress } from "@/components/ui/progress"
import { CampoCatalogo } from "./CampoCatalogo"
import { CampoResponsables } from "./CampoResponsables"
import { CampoDatosProyecto } from "./CampoDatosProyecto"
import { FormacionesComplementariasEditor } from "./FormacionesComplementariasEditor"
import type { FormacionComplementariaEditable } from "./types"
import type { InscripcionFormApi } from "./useInscripcionForm"

interface Catalogo {
  data: { id: number; estado?: string; nombre?: string }[] | undefined
  isLoading: boolean
}
interface CatalogoResponsable {
  data: { id: number; nombreLargo: string }[] | undefined
  isLoading: boolean
}

// Junta los 4 grupos de campos (Catalogo/Responsables/Datos del proyecto/Formaciones
// complementarias) en UNA sola pantalla -- antes vivian repartidos en pasos separados del
// Carousel (uno por grupo), cada uno con su propio boton "Siguiente". Usado tanto por
// "crear" (paso "Datos de la solicitud", antes de la Confirmacion) como por "actualizar"
// (paso "Editar campos") -- el llamador sigue siendo dueño del boton de accion final
// (Siguiente/Guardar cambios): este componente solo INTERCEPTA ese click para avisar si
// falta algo, en vez de dejar que el boton quede deshabilitado sin explicacion ("no ocultar
// informacion, solo asistir").
//
// Navegacion sin pasos: el indicador de arriba (sticky) no es un stepper -- es un ancla a
// cada sub-seccion (scrollIntoView), asi que ir "para atras" es tan fluido como ir para
// adelante, sin depender de botones "anterior/siguiente".
export function CamposInscripcionCompletos({
  form,
  idPrefix,
  estadosQuery,
  sistemasQuery,
  responsablesQuery,
  ambientesQuery,
  mostrarPlaceholder = true,
  mostrarEjemplos = true,
  formaciones,
  onAgregarFormacion,
  onCambiarFormacion,
  onQuitarFormacion,
  descripcionAyudaFormaciones,
  formacionesCargando = false,
  catalogoCompleto,
  responsablesCompletos,
  datosProyectoCompletos,
  etiquetaAccion,
  onAccion,
  deshabilitarAccion = false,
}: {
  form: InscripcionFormApi["form"]
  idPrefix: string
  estadosQuery: Catalogo
  sistemasQuery: Catalogo
  responsablesQuery: CatalogoResponsable
  ambientesQuery: Catalogo
  mostrarPlaceholder?: boolean
  mostrarEjemplos?: boolean
  formaciones: FormacionComplementariaEditable[]
  onAgregarFormacion: () => void
  onCambiarFormacion: (indice: number, valor: string) => void
  onQuitarFormacion: (indice: number) => void
  descripcionAyudaFormaciones: string
  formacionesCargando?: boolean
  catalogoCompleto: boolean
  responsablesCompletos: boolean
  datosProyectoCompletos: boolean
  etiquetaAccion: string
  onAccion: () => void
  deshabilitarAccion?: boolean
}) {
  const refCatalogo = useRef<HTMLDivElement>(null)
  const refResponsables = useRef<HTMLDivElement>(null)
  const refDatosProyecto = useRef<HTMLDivElement>(null)
  const refFormaciones = useRef<HTMLDivElement>(null)

  // "intento" queda en true para siempre una vez que se dispara -- asi la barra de
  // progreso no desaparece de nuevo si el usuario completa y despues vacia un campo.
  const [intento, setIntento] = useState(false)

  const secciones = [
    { id: "catalogo", etiqueta: "Catálogo", ref: refCatalogo, completo: catalogoCompleto },
    { id: "responsables", etiqueta: "Responsables", ref: refResponsables, completo: responsablesCompletos },
    { id: "proyecto", etiqueta: "Datos del proyecto", ref: refDatosProyecto, completo: datosProyectoCompletos },
  ]
  const completadas = secciones.filter((s) => s.completo).length
  const progreso = Math.round((completadas / secciones.length) * 100)
  const formularioCompleto = completadas === secciones.length
  const mostrarProgreso = intento || progreso > 0

  function irA(ref: React.RefObject<HTMLDivElement | null>) {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  function manejarAccion() {
    if (!formularioCompleto) {
      setIntento(true)
      irA(secciones.find((s) => !s.completo)?.ref ?? refCatalogo)
      return
    }
    onAccion()
  }

  return (
    <div className="space-y-4">
      {/* Sticky: queda visible aunque el usuario ya haya bajado hasta "Formaciones" --
          volver a una seccion anterior es un click, no hay que scrollear a mano. Sin
          margen negativo: eso empujaba el ancho real mas alla del padding-box del
          contenedor (CarouselItem, que solo tiene overflow-y-auto) y aparecia scroll en X. */}
      <div className="sticky top-0 z-10 space-y-2 bg-background pb-2">
        <div className="flex flex-wrap gap-2">
          {secciones.map((s) => (
            <Button
              key={s.id}
              type="button"
              variant={s.completo ? "secondary" : "outline"}
              size="sm"
              onClick={() => irA(s.ref)}
            >
              {s.completo ? (
                <CheckCircle2Icon className="text-primary" />
              ) : (
                <CircleIcon className="text-muted-foreground" />
              )}
              {s.etiqueta}
            </Button>
          ))}
        </div>
        {mostrarProgreso && (
          <div className="space-y-1">
            <Progress value={progreso} />
            <p className="text-xs text-muted-foreground">
              {formularioCompleto
                ? "Todo lo necesario está completo."
                : `${completadas} de ${secciones.length} secciones completas -- revisá lo que falta marcado arriba.`}
            </p>
          </div>
        )}
      </div>

      <div ref={refCatalogo}>
        <FieldGroup>
          <FieldSet>
            <FieldLabel>Catálogo</FieldLabel>
            <CampoCatalogo
              form={form}
              idPrefix={idPrefix}
              estadosQuery={estadosQuery}
              sistemasQuery={sistemasQuery}
              ambientesQuery={ambientesQuery}
              mostrarPlaceholder={mostrarPlaceholder}
            />
          </FieldSet>
        </FieldGroup>
      </div>

      <FieldSeparator />

      <div ref={refResponsables}>
        <FieldGroup>
          <FieldSet>
            <FieldLabel>Responsables</FieldLabel>
            <CampoResponsables
              form={form}
              idPrefix={idPrefix}
              responsablesQuery={responsablesQuery}
              mostrarPlaceholder={mostrarPlaceholder}
            />
          </FieldSet>
        </FieldGroup>
      </div>

      <FieldSeparator />

      <div ref={refDatosProyecto}>
        <FieldGroup>
          <FieldSet>
            <FieldLabel>Datos del proyecto</FieldLabel>
            <CampoDatosProyecto form={form} idPrefix={idPrefix} mostrarEjemplos={mostrarEjemplos} />
          </FieldSet>
        </FieldGroup>
      </div>

      <FieldSeparator />

      <div ref={refFormaciones}>
        <FormacionesComplementariasEditor
          items={formaciones}
          onAgregar={onAgregarFormacion}
          onCambiar={onCambiarFormacion}
          onQuitar={onQuitarFormacion}
          descripcionAyuda={descripcionAyudaFormaciones}
          cargando={formacionesCargando}
        />
      </div>

      <Button type="button" onClick={manejarAccion} disabled={deshabilitarAccion} className="w-fit">
        {etiquetaAccion}
      </Button>
    </div>
  )
}
