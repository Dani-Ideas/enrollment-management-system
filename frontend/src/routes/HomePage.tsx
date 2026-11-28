import { Link } from "@tanstack/react-router"
import { ArrowRightIcon, CalendarCheckIcon, CalendarClockIcon, CalendarXIcon, LayersIcon } from "lucide-react"
import { cn } from "cn"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { BadgeCiclo } from "@/components/panel-solicitud/BadgeCiclo"
import { usePerfil } from "@/components/perfil/contextoPerfil"
import { textoPlazo, useRecordatorios, type Recordatorio } from "@/components/inicio/useRecordatorios"

function fechaCorta(iso: string | null): string {
  if (iso === null || iso === "") return "—"
  const d = new Date(iso.slice(0, 10) + "T00:00:00")
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10)
  return d.toLocaleDateString("es", { day: "2-digit", month: "short" })
}

function Tile({
  etiqueta,
  valor,
  icono: Icono,
  acento,
}: {
  etiqueta: string
  valor: number
  icono: typeof CalendarClockIcon
  acento: string
}) {
  return (
    <Card className="gap-1 px-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{etiqueta}</span>
        <Icono className={cn("size-4", acento)} />
      </div>
      <span className="text-2xl font-semibold tracking-titulo">{valor}</span>
    </Card>
  )
}

function TarjetaRecordatorio({ r }: { r: Recordatorio }) {
  const avance = Math.round((r.hechos / r.niveles.length) * 100)
  return (
    <Link
      to="/solicitud/$id"
      params={{ id: String(r.id) }}
      className="group block rounded-xl border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/30"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{r.proyecto}</p>
          <p className="truncate text-xs text-muted-foreground">
            {r.version} · {r.ambiente}
          </p>
        </div>
        <BadgeCiclo tono={r.tono}>{textoPlazo(r)}</BadgeCiclo>
      </div>

      {/* Las dos fechas que pidió el recordatorio: cuándo arranca la cadena y cuándo cierra. */}
      <div className="mt-3 flex items-center gap-2 text-xs">
        <span className="rounded-md border bg-muted/50 px-2 py-1">
          <span className="text-muted-foreground">Inicio </span>
          <span className="font-medium">{fechaCorta(r.inicio)}</span>
        </span>
        <span className="h-px flex-1 bg-border" />
        <ArrowRightIcon className="size-3 shrink-0 text-muted-foreground" />
        <span className="h-px flex-1 bg-border" />
        <span className="rounded-md border bg-muted/50 px-2 py-1">
          <span className="text-muted-foreground">Fin </span>
          <span className="font-medium">{fechaCorta(r.fin)}</span>
        </span>
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <LayersIcon className="size-3" />
            {r.hechos} de {r.niveles.length} nivel{r.niveles.length === 1 ? "" : "es"} con fecha real
          </span>
          <span>{avance}%</span>
        </div>
        <Progress value={avance} className="h-1.5" />
      </div>
    </Link>
  )
}

export function HomePage() {
  const { perfil } = usePerfil()
  const { recordatorios, vencidos, estaSemana, proximos, completos, solicitudesQuery } = useRecordatorios()

  const hoy = new Date().toLocaleDateString("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  return (
    <section className="w-full space-y-4">
      {/* El menú ya vive en el sidebar: la portada no lo repite, recibe con lo que vence. */}
      <header>
        <h2 className="text-seccion font-semibold tracking-titulo">Buen día, {perfil.nombre.split(" ")[0]}</h2>
        <p className="text-sm text-muted-foreground first-letter:uppercase">{hoy}</p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile etiqueta="Vencidas" valor={vencidos} icono={CalendarXIcon} acento="text-ciclo-conflicto" />
        <Tile etiqueta="Cierran esta semana" valor={estaSemana} icono={CalendarClockIcon} acento="text-ciclo-revision" />
        <Tile etiqueta="Más adelante" valor={proximos} icono={CalendarClockIcon} acento="text-muted-foreground" />
        <Tile etiqueta="Cerradas" valor={completos} icono={CalendarCheckIcon} acento="text-ciclo-aprobado" />
      </div>

      {solicitudesQuery.isLoading && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner /> Cargando recordatorios…
        </p>
      )}

      {!solicitudesQuery.isLoading && recordatorios.length === 0 && (
        <Card className="items-center gap-1 px-4 py-10 text-center">
          <p className="text-sm font-medium">No hay cadenas registradas</p>
          <p className="text-sm text-muted-foreground">
            Cuando crees la primera solicitud, acá van a aparecer sus fechas.
          </p>
        </Card>
      )}

      {recordatorios.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Recordatorios de cierre</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recordatorios.map((r) => (
              <TarjetaRecordatorio key={r.id} r={r} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
