"use client"

import { useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors, useDroppable,
} from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Plus, GripVertical, Pencil, Trash2, X, ExternalLink,
  Link as LinkIcon, Eye, EyeOff, ChevronRight, Bold, Italic, List
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import {
  createSemana, updateSemanaEstado, updateSemana,
  deleteSemana, updateDia, addLinkToDia, deleteLinkFromDia,
} from "@/lib/actions"
import { toast } from "sonner"
import React from "react"

type Link = { id: string; titulo: string; url: string }
type Dia = { id: string; nombre: string; descanso: boolean; contenido: string; orden: number; links: Link[] }
type TipoPlan = { id: string; nombre: string; color: string }
type Semana = {
  id: string; titulo: string; numero: number; estado: string
  fechaInicio: Date; tipoPlanId: string; tipoPlan: TipoPlan; dias: Dia[]
}

const ESTADOS = ["planificacion", "en-curso", "finalizado"] as const
const ESTADO_LABELS: Record<string, string> = {
  "planificacion": "Planificación",
  "en-curso": "En Curso",
  "finalizado": "Finalizado",
}
const ESTADO_COLORS: Record<string, string> = {
  "planificacion": "bg-secondary/50 border-border",
  "en-curso": "bg-primary/5 border-primary/30",
  "finalizado": "bg-success/5 border-success/30",
}
const ESTADO_BADGE: Record<string, string> = {
  "planificacion": "bg-secondary text-secondary-foreground",
  "en-curso": "bg-primary/20 text-primary",
  "finalizado": "bg-success/20 text-success",
}

// ─── Droppable Column ────────────────────────────────────────────────────────
function KanbanColumn({
  estado, semanas, planColor, onCardClick, activeId,
}: {
  estado: string
  semanas: Semana[]
  planColor: string
  onCardClick: (s: Semana) => void
  activeId: string | null
}) {
  const { setNodeRef, isOver } = useDroppable({ id: estado })

  return (
    <div className={cn(
      "flex-1 min-w-[280px] max-w-sm rounded-xl border-2 transition-colors flex flex-col",
      ESTADO_COLORS[estado],
      isOver && "border-primary/60 bg-primary/10"
    )}>
      {/* Column header */}
      <div className="p-4 border-b border-inherit">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
            {ESTADO_LABELS[estado]}
          </h3>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-background/50">
            {semanas.length}
          </span>
        </div>
        {estado === "en-curso" && (
          <p className="text-xs text-primary/70 mt-1 flex items-center gap-1">
            <Eye className="w-3 h-3" /> Visible para los alumnos
          </p>
        )}
        {estado === "planificacion" && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <EyeOff className="w-3 h-3" /> No visible aún
          </p>
        )}
      </div>

      {/* Cards */}
      <div ref={setNodeRef} className="flex-1 p-3 space-y-2 min-h-[200px]">
        <SortableContext items={semanas.map(s => s.id)} strategy={verticalListSortingStrategy}>
          {semanas.map(s => (
            <SortableCard
              key={s.id}
              semana={s}
              planColor={planColor}
              onClick={() => onCardClick(s)}
              isDragging={activeId === s.id}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}

// ─── Sortable Card ───────────────────────────────────────────────────────────
function SortableCard({
  semana, planColor, onClick, isDragging,
}: {
  semana: Semana; planColor: string; onClick: () => void; isDragging: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: semana.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && "opacity-40")}>
      <WeekCard semana={semana} planColor={planColor} onClick={onClick} dragProps={{ ...attributes, ...listeners }} />
    </div>
  )
}

function WeekCard({
  semana, planColor, onClick, dragProps,
}: {
  semana: Semana; planColor: string; onClick: () => void; dragProps?: any
}) {
  return (
    <Card
      className="bg-card border-border cursor-pointer hover:border-primary/40 transition-all group"
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div
            className="mt-0.5 shrink-0 cursor-grab active:cursor-grabbing touch-none"
            {...dragProps}
            onClick={e => e.stopPropagation()}
          >
            <GripVertical className="w-4 h-4 text-muted-foreground/50 hover:text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: planColor }} />
              <span className="text-xs text-muted-foreground font-medium">Semana {semana.numero}</span>
            </div>
            <h4 className="font-semibold text-sm leading-snug truncate">{semana.titulo}</h4>
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(semana.fechaInicio), "d MMM yyyy", { locale: es })}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {semana.dias.filter(d => !d.descanso).length} días entrenamiento
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Week Editor Sheet ───────────────────────────────────────────────────────
function WeekEditor({
  semana, onClose, onDelete, onUpdate
}: {
  semana: Semana; onClose: () => void; onDelete: (id: string) => void; onUpdate: (s: Semana) => void
}) {
  const [titulo, setTitulo] = useState(semana.titulo)
  const [selectedDay, setSelectedDay] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [isUpdatingHeader, setIsUpdatingHeader] = useState(false)
  const [isAddingLink, setIsAddingLink] = useState(false)
  const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [newLinkTitulo, setNewLinkTitulo] = useState("")
  const [newLinkUrl, setNewLinkUrl] = useState("")
  
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const dia = semana.dias[selectedDay]

  const saveTitulo = async () => {
    if (titulo === semana.titulo) return
    setIsUpdatingHeader(true)
    const r = await updateSemana(semana.id, { titulo })
    setIsUpdatingHeader(false)
    if (r.success) {
      toast.success("Título actualizado")
      onUpdate({ ...semana, titulo })
    } else toast.error(r.error)
  }

  const saveFechaInicio = async (newFecha: string) => {
    setIsUpdatingHeader(true)
    const r = await updateSemana(semana.id, { fechaInicio: newFecha })
    setIsUpdatingHeader(false)
    if (r.success) {
      toast.success("Fecha de inicio actualizada")
      onUpdate({ ...semana, fechaInicio: new Date(newFecha + "T12:00:00") }) // Avoid timezone shift
    } else toast.error(r.error)
  }

  const saveDia = async (field: "contenido" | "descanso", value: string | boolean) => {
    setIsSaving(true)
    const r = await updateDia(dia.id, { [field]: value })
    setIsSaving(false)
    if (r.success) {
      toast.success(field === "contenido" ? "Planificación guardada" : "Día actualizado")
      const updatedSemana = { ...semana }
      updatedSemana.dias[selectedDay] = { ...updatedSemana.dias[selectedDay], [field]: value }
      onUpdate(updatedSemana)
    } else toast.error(r.error)
  }

  const handleAddLink = async () => {
    if (!newLinkTitulo || !newLinkUrl) return
    setIsAddingLink(true)
    const r = await addLinkToDia(dia.id, newLinkTitulo, newLinkUrl)
    setIsAddingLink(false)
    if (r.success && r.link) { 
      setNewLinkTitulo("")
      setNewLinkUrl("")
      toast.success("Link agregado correctamente")
      const updatedSemana = { ...semana }
      const updatedDia = { ...updatedSemana.dias[selectedDay] }
      updatedDia.links = [...updatedDia.links, r.link]
      updatedSemana.dias[selectedDay] = updatedDia
      onUpdate(updatedSemana)
    } else toast.error(r.error || "Error al agregar el link")
  }

  const handleDeleteLink = async (linkId: string) => {
    setDeletingLinkId(linkId)
    const r = await deleteLinkFromDia(linkId)
    setDeletingLinkId(null)
    if (r.success) {
      toast.success("Link eliminado")
      const updatedSemana = { ...semana }
      const updatedDia = { ...updatedSemana.dias[selectedDay] }
      updatedDia.links = updatedDia.links.filter(l => l.id !== linkId)
      updatedSemana.dias[selectedDay] = updatedDia
      onUpdate(updatedSemana)
    } else toast.error(r.error)
  }

  const handleDelete = async () => {
    const r = await deleteSemana(semana.id)
    if (r.success) { onDelete(semana.id); onClose() }
    else toast.error(r.error)
  }
  
  const insertFormatting = (prefix: string, suffix: string = "") => {
    const el = textareaRef.current
    if (!el) return

    const start = el.selectionStart
    const end = el.selectionEnd
    const currentVal = el.value

    const textBefore = currentVal.substring(0, start)
    const textSelected = currentVal.substring(start, end)
    const textAfter = currentVal.substring(end)

    const insertion = textSelected || "texto"
    const newVal = textBefore + prefix + insertion + suffix + textAfter

    el.value = newVal
    saveDia("contenido", newVal)
    
    setTimeout(() => {
      el.focus()
      el.setSelectionRange(start + prefix.length, start + prefix.length + insertion.length)
    }, 0)
  }

  return (
    <div className="p-6 flex flex-col gap-4">
      <SheetHeader className="mb-2">
        <SheetTitle asChild>
          <div className="flex flex-col gap-2 relative">
            {isUpdatingHeader && (
              <span className="absolute -top-5 right-0 text-xs font-medium text-primary flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Guardando...
              </span>
            )}
            <Input
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              onBlur={saveTitulo}
              className="text-lg font-bold bg-secondary/50 border-0 focus-visible:ring-1"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Inicia el:</span>
              <Input
                type="date"
                defaultValue={format(new Date(semana.fechaInicio), "yyyy-MM-dd")}
                onBlur={e => {
                  if (e.target.value !== format(new Date(semana.fechaInicio), "yyyy-MM-dd")) {
                    saveFechaInicio(e.target.value)
                  }
                }}
                className="h-7 w-36 text-xs bg-secondary/50 border-0"
              />
              <span className="text-xs text-muted-foreground ml-auto">
                Plan: <span style={{ color: semana.tipoPlan.color }}>{semana.tipoPlan.nombre}</span>
              </span>
            </div>
          </div>
        </SheetTitle>
      </SheetHeader>

      {/* Day Tabs */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {semana.dias.map((d, i) => (
          <Button
            key={d.id}
            size="sm"
            variant={selectedDay === i ? "default" : "outline"}
            onClick={() => setSelectedDay(i)}
            className={cn(
              selectedDay === i && "bg-primary text-primary-foreground",
              d.descanso && selectedDay !== i && "opacity-50"
            )}
          >
            {d.nombre.slice(0, 3)}
            {d.descanso && <span className="ml-1 text-[10px]">(D)</span>}
          </Button>
        ))}
      </div>

      {/* Day Editor */}
      {dia && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{dia.nombre}</h3>
            <div className="flex items-center gap-2">
              <Label htmlFor="descanso" className="text-sm text-muted-foreground">Descanso</Label>
              <Switch
                id="descanso"
                checked={dia.descanso}
                onCheckedChange={v => saveDia("descanso", v)}
              />
            </div>
          </div>

          {!dia.descanso ? (
            <>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>Contenido del día</Label>
                  <div className="flex items-center gap-1 bg-secondary/50 rounded-md p-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7 rounded-sm" onClick={() => insertFormatting("**", "**")} title="Negrita">
                      <Bold className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 rounded-sm" onClick={() => insertFormatting("*", "*")} title="Cursiva">
                      <Italic className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 rounded-sm" onClick={() => insertFormatting("- ")} title="Lista">
                      <List className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Textarea con overlay de guardado */}
                <div className="relative">
                  <Textarea
                    key={dia.id}
                    ref={textareaRef}
                    defaultValue={dia.contenido}
                    onBlur={e => {
                      if (e.target.value !== dia.contenido) {
                        saveDia("contenido", e.target.value)
                      }
                    }}
                    placeholder={"**Fuerza principal**\n5x5 Back Squat @ 75%\n\n**WOD**\n21-15-9 Thrusters / Pull-ups"}
                    className="min-h-[180px] bg-secondary/30 font-mono text-sm shadow-inner"
                    disabled={isSaving}
                  />
                  {isSaving && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] rounded-md flex items-center justify-center pointer-events-none">
                      <div className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-full shadow-lg">
                        <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        <span className="text-sm font-semibold">Guardando planificación...</span>
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  Se guarda automáticamente al salir del campo · Usá los botones para dar formato
                </p>
              </div>

              {/* Links */}
              <div className="space-y-2">
                <Label>Videos de referencia</Label>
                {dia.links.map(l => (
                  <div key={l.id} className="flex items-center gap-2 group">
                    <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-secondary/30 rounded-lg text-sm">
                      <ExternalLink className="w-3.5 h-3.5 text-primary shrink-0" />
                      <a href={l.url} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">
                        {l.titulo}
                      </a>
                    </div>
                    {deletingLinkId === l.id ? (
                      <div className="h-7 w-7 flex items-center justify-center">
                        <span className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      </div>
                    ) : (
                      <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:text-destructive"
                        onClick={() => handleDeleteLink(l.id)}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input placeholder="Título" value={newLinkTitulo} onChange={e => setNewLinkTitulo(e.target.value)}
                    className="bg-secondary/50 text-sm" disabled={isAddingLink} />
                  <Input placeholder="URL" value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)}
                    className="bg-secondary/50 text-sm" disabled={isAddingLink} />
                  <Button size="icon" variant="outline" onClick={handleAddLink} disabled={isAddingLink || !newLinkTitulo || !newLinkUrl}>
                    {isAddingLink ? <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" /> : <LinkIcon className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-muted-foreground bg-secondary/20 rounded-lg">
              🏖️ Día de descanso
            </div>
          )}
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-border">
        <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)} className="w-full">
          <Trash2 className="w-4 h-4 mr-2" /> Eliminar semana
        </Button>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta semana?</AlertDialogTitle>
            <AlertDialogDescription>Se eliminará "{semana.titulo}" y todos sus días. No se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ─── Main Kanban Board ───────────────────────────────────────────────────────
export function KanbanBoard({
  planesDisponibles, semanasIniciales,
}: {
  planesDisponibles: TipoPlan[]
  semanasIniciales: Semana[]
}) {
  const [selectedPlanId, setSelectedPlanId] = useState(planesDisponibles[0]?.id ?? "")
  const [semanas, setSemanas] = useState(semanasIniciales)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedSemana, setSelectedSemana] = useState<Semana | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newTitulo, setNewTitulo] = useState("")
  const [newFecha, setNewFecha] = useState(new Date().toISOString().split("T")[0])
  const [isCreating, setIsCreating] = useState(false)

  const selectedPlan = planesDisponibles.find(p => p.id === selectedPlanId)
  const planSemanas = semanas.filter(s => s.tipoPlanId === selectedPlanId)

  const getSemanasByEstado = (estado: string) =>
    planSemanas.filter(s => s.estado === estado)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const handleDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string)

  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = e
    if (!over || active.id === over.id) return

    const newEstado = ESTADOS.includes(over.id as any) ? (over.id as string) : null
    if (!newEstado) return

    const semana = semanas.find(s => s.id === active.id)
    if (!semana || semana.estado === newEstado) return

    // Optimistic update
    setSemanas(prev => prev.map(s => s.id === active.id ? { ...s, estado: newEstado } : s))

    const r = await updateSemanaEstado(active.id as string, newEstado)
    if (!r.success) {
      toast.error(r.error)
      setSemanas(prev => prev.map(s => s.id === active.id ? { ...s, estado: semana.estado } : s))
    } else {
      const label = ESTADO_LABELS[newEstado]
      toast.success(`Semana movida a "${label}"${newEstado === "en-curso" ? " — ya es visible para los alumnos" : ""}`)
    }
  }

  const handleCreate = async () => {
    if (!newTitulo.trim()) return
    setIsCreating(true)
    const r = await createSemana({ titulo: newTitulo, tipoPlanId: selectedPlanId, fechaInicio: newFecha })
    setIsCreating(false)
    if (r.success) {
      toast.success("Semana creada")
      setIsCreateOpen(false)
      setNewTitulo("")
    } else {
      toast.error(r.error)
    }
  }

  const activeSemana = activeId ? semanas.find(s => s.id === activeId) : null

  return (
    <div className="space-y-5 h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planificación</h1>
          <p className="text-muted-foreground mt-1">Arrastrá las semanas entre columnas para cambiar su estado</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} disabled={!selectedPlanId}
          className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" /> Nueva Semana
        </Button>
      </div>

      {/* Plan selector tabs */}
      {planesDisponibles.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          No hay planes creados. Creá un plan primero desde el menú "Planes".
        </div>
      ) : (
        <>
          <div className="flex gap-2 flex-wrap">
            {planesDisponibles.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPlanId(p.id)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-semibold transition-all border-2",
                  selectedPlanId === p.id
                    ? "text-white border-transparent shadow-lg"
                    : "bg-secondary/30 border-transparent text-muted-foreground hover:bg-secondary/60"
                )}
                style={selectedPlanId === p.id ? { backgroundColor: p.color, borderColor: p.color } : {}}
              >
                {p.nombre}
              </button>
            ))}
          </div>

          {/* Kanban */}
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {ESTADOS.map(estado => (
                <KanbanColumn
                  key={estado}
                  estado={estado}
                  semanas={getSemanasByEstado(estado)}
                  planColor={selectedPlan?.color ?? "#f97316"}
                  onCardClick={setSelectedSemana}
                  activeId={activeId}
                />
              ))}
            </div>

            <DragOverlay>
              {activeSemana && (
                <div className="w-72 rotate-2 shadow-2xl">
                  <WeekCard
                    semana={activeSemana}
                    planColor={selectedPlan?.color ?? "#f97316"}
                    onClick={() => {}}
                  />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Nueva semana — {selectedPlan?.nombre}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Título de la semana</Label>
              <Input value={newTitulo} onChange={e => setNewTitulo(e.target.value)}
                placeholder="ej. Semana 1 — Test de Fuerza"
                className="bg-secondary/50" />
            </div>
            <div className="space-y-1.5">
              <Label>Fecha de inicio</Label>
              <Input type="date" value={newFecha} onChange={e => setNewFecha(e.target.value)}
                className="bg-secondary/50" />
            </div>
            <p className="text-xs text-muted-foreground">
              Se crearán 6 tabs de días vacíos (Lunes a Sábado) para que los completes.
            </p>
            <Button onClick={handleCreate} disabled={!newTitulo || isCreating} className="w-full">
              {isCreating ? "Creando..." : "Crear semana"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Week Editor Sheet */}
      <Sheet open={!!selectedSemana} onOpenChange={open => !open && setSelectedSemana(null)}>
        <SheetContent className="w-full sm:max-w-xl bg-card border-border overflow-y-auto p-0">
          {selectedSemana && (
            <WeekEditor
              semana={semanas.find(s => s.id === selectedSemana.id) || selectedSemana}
              onClose={() => setSelectedSemana(null)}
              onDelete={id => setSemanas(prev => prev.filter(s => s.id !== id))}
              onUpdate={updatedSemana => setSemanas(prev => prev.map(s => s.id === updatedSemana.id ? updatedSemana : s))}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
