"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { StatusBadge } from "@/components/shared/status-badge"
import { AvatarCircle } from "@/components/shared/avatar-circle"
import { Plus, Search, Phone, Mail, Pencil, Trash2, Dumbbell } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { createAlumno, updateAlumno, deleteAlumno } from "@/lib/actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type TipoPlan = { id: string; nombre: string; color: string }
type Alumno = {
  id: string; nombre: string; email: string; avatar: string | null
  estado: string | null; cuota: number | null; vencimiento: Date | null
  telefono: string | null; fechaInicio: Date | null
  planes: { tipoPlan: TipoPlan }[]
  _count: { pagos: number }
}

type FilterTab = "todos" | "activo" | "pausado" | "inactivo"

const EMPTY_FORM = {
  nombre: "", email: "", telefono: "", cuota: 35000,
  estado: "activo", vencimiento: "", planIds: [] as string[],
}

function AlumnoForm({
  initial, planesDisponibles, onSubmit, isLoading,
}: {
  initial?: typeof EMPTY_FORM
  planesDisponibles: TipoPlan[]
  onSubmit: (data: typeof EMPTY_FORM) => void
  isLoading: boolean
}) {
  const [form, setForm] = useState(initial ?? EMPTY_FORM)

  const togglePlan = (id: string) => {
    setForm(f => ({
      ...f,
      planIds: f.planIds.includes(id)
        ? f.planIds.filter(p => p !== id)
        : [...f.planIds, id],
    }))
  }

  return (
    <div className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1.5">
          <Label>Nombre completo *</Label>
          <Input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
            placeholder="Juan Pérez" className="bg-secondary/50" />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Email *</Label>
          <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="juan@email.com" className="bg-secondary/50" />
        </div>
        <div className="space-y-1.5">
          <Label>Teléfono</Label>
          <Input value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
            placeholder="+54 343..." className="bg-secondary/50" />
        </div>
        <div className="space-y-1.5">
          <Label>Cuota mensual (ARS)</Label>
          <Input type="number" value={form.cuota} onChange={e => setForm(f => ({ ...f, cuota: Number(e.target.value) }))}
            className="bg-secondary/50" />
        </div>
        <div className="space-y-1.5">
          <Label>Estado</Label>
          <Select value={form.estado} onValueChange={v => setForm(f => ({ ...f, estado: v }))}>
            <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="activo">Activo</SelectItem>
              <SelectItem value="pausado">Pausado</SelectItem>
              <SelectItem value="inactivo">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Vencimiento cuota</Label>
          <Input type="date" value={form.vencimiento} onChange={e => setForm(f => ({ ...f, vencimiento: e.target.value }))}
            className="bg-secondary/50" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Planes asignados</Label>
        <div className="grid grid-cols-2 gap-2">
          {planesDisponibles.map(plan => (
            <label key={plan.id} className={cn(
              "flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors",
              form.planIds.includes(plan.id)
                ? "border-primary/50 bg-primary/5"
                : "border-border bg-secondary/20 hover:bg-secondary/40"
            )}>
              <Checkbox
                checked={form.planIds.includes(plan.id)}
                onCheckedChange={() => togglePlan(plan.id)}
              />
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: plan.color }} />
              <span className="text-sm font-medium">{plan.nombre}</span>
            </label>
          ))}
        </div>
      </div>

      <Button onClick={() => onSubmit(form)} disabled={!form.nombre || !form.email || isLoading} className="w-full">
        {isLoading ? "Guardando..." : "Guardar"}
      </Button>
    </div>
  )
}

export function AlumnosView({
  alumnos, planesDisponibles,
}: {
  alumnos: Alumno[]
  planesDisponibles: TipoPlan[]
}) {
  const [filter, setFilter] = useState<FilterTab>("todos")
  const [search, setSearch] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingAlumno, setEditingAlumno] = useState<Alumno | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const filtered = alumnos.filter(a => {
    const matchFilter = filter === "todos" || a.estado === filter
    const matchSearch = a.nombre.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const tabs: { value: FilterTab; label: string }[] = [
    { value: "todos", label: `Todos (${alumnos.length})` },
    { value: "activo", label: `Activos (${alumnos.filter(a => a.estado === "activo").length})` },
    { value: "pausado", label: `Pausados (${alumnos.filter(a => a.estado === "pausado").length})` },
    { value: "inactivo", label: `Inactivos (${alumnos.filter(a => a.estado === "inactivo").length})` },
  ]

  const handleCreate = async (data: typeof EMPTY_FORM) => {
    setIsLoading(true)
    const result = await createAlumno(data)
    setIsLoading(false)
    if (result.success) { toast.success("Alumno creado. Contraseña por defecto: alumna123"); setIsCreateOpen(false) }
    else toast.error(result.error)
  }

  const handleUpdate = async (data: typeof EMPTY_FORM) => {
    if (!editingAlumno) return
    setIsLoading(true)
    const result = await updateAlumno(editingAlumno.id, {
      ...data, vencimiento: data.vencimiento || null,
    })
    setIsLoading(false)
    if (result.success) { toast.success("Alumno actualizado"); setEditingAlumno(null) }
    else toast.error(result.error)
  }

  const handleDelete = async () => {
    if (!deletingId) return
    const result = await deleteAlumno(deletingId)
    setDeletingId(null)
    if (result.success) toast.success("Alumno eliminado")
    else toast.error(result.error)
  }

  const getEditForm = (a: Alumno): typeof EMPTY_FORM => ({
    nombre: a.nombre,
    email: a.email,
    telefono: a.telefono ?? "",
    cuota: a.cuota ?? 0,
    estado: a.estado ?? "activo",
    vencimiento: a.vencimiento ? a.vencimiento.toISOString().split("T")[0] : "",
    planIds: a.planes.map(p => p.tipoPlan.id),
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alumnos</h1>
          <p className="text-muted-foreground mt-1">Gestioná tus alumnos y sus planes</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" /> Nuevo Alumno
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border sm:max-w-lg">
            <DialogHeader><DialogTitle>Agregar nuevo alumno</DialogTitle></DialogHeader>
            <AlumnoForm planesDisponibles={planesDisponibles} onSubmit={handleCreate} isLoading={isLoading} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar alumno..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-secondary/50" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {tabs.map(t => (
            <Button key={t.value} size="sm"
              variant={filter === t.value ? "default" : "outline"}
              onClick={() => setFilter(t.value)}
              className={filter === t.value ? "bg-primary text-primary-foreground" : ""}>
              {t.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          No hay alumnos que coincidan con la búsqueda
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(a => (
            <Card key={a.id} className="bg-card border-border hover:border-primary/30 transition-colors group">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AvatarCircle initials={a.avatar ?? "?"} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate">{a.nombre}</h3>
                        <StatusBadge status={(a.estado as any) ?? "inactivo"} />
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Button size="icon" variant="ghost" className="h-7 w-7"
                          onClick={() => setEditingAlumno(a)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-destructive"
                          onClick={() => setDeletingId(a.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5"><Mail className="w-3 h-3" /><span className="truncate">{a.email}</span></div>
                      {a.telefono && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" /><span>{a.telefono}</span></div>}
                    </div>
                    <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                      <span className="font-semibold text-primary text-sm">
                        ${(a.cuota ?? 0).toLocaleString("es-AR")}/mes
                      </span>
                      {a.vencimiento && (
                        <span className="text-xs text-muted-foreground">
                          Vence: {format(new Date(a.vencimiento), "d MMM", { locale: es })}
                        </span>
                      )}
                    </div>
                    {a.planes.length > 0 && (
                      <div className="mt-2 flex gap-1 flex-wrap">
                        {a.planes.map(p => (
                          <span key={p.tipoPlan.id} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${p.tipoPlan.color}20`, color: p.tipoPlan.color }}>
                            <Dumbbell className="w-2.5 h-2.5" />
                            {p.tipoPlan.nombre}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingAlumno} onOpenChange={open => !open && setEditingAlumno(null)}>
        <DialogContent className="bg-card border-border sm:max-w-lg">
          <DialogHeader><DialogTitle>Editar alumno</DialogTitle></DialogHeader>
          {editingAlumno && (
            <AlumnoForm initial={getEditForm(editingAlumno)} planesDisponibles={planesDisponibles}
              onSubmit={handleUpdate} isLoading={isLoading} />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deletingId} onOpenChange={open => !open && setDeletingId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este alumno?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminarán todos sus datos, pagos y registros. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
