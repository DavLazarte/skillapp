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
import { format, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"
import { StudentRMsView } from "@/components/student/student-rms-view"
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

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          No hay alumnos que coincidan con la búsqueda
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(a => (
            <Card key={a.id} className="bg-card border-border hover:border-primary/30 transition-colors group">
              <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* User Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <AvatarCircle initials={a.avatar ?? "?"} size="md" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm sm:text-base truncate">{a.nombre}</h3>
                      <StatusBadge status={(a.estado as any) ?? "inactivo"} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1"><Mail className="w-3 h-3" /><span className="truncate">{a.email}</span></div>
                      {a.telefono && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /><span>{a.telefono}</span></div>}
                    </div>
                  </div>
                </div>

                {/* Plan & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                  <div className="flex flex-col sm:items-end min-w-0 shrink-0">
                    <span className="font-semibold text-primary text-sm">
                      ${(a.cuota ?? 0).toLocaleString("es-AR")}/mes
                    </span>
                    {a.vencimiento && (() => {
                      const daysUntilExp = differenceInDays(new Date(a.vencimiento), new Date())
                      const isExpired = daysUntilExp < 0
                      const isExpiringSoon = daysUntilExp >= 0 && daysUntilExp <= 3
                      
                      let colorClass = "text-muted-foreground"
                      let text = `Vence: ${format(new Date(a.vencimiento), "d MMM", { locale: es })}`
                      
                      if (isExpired) {
                        colorClass = "text-destructive font-bold"
                        text = `Vencido (${format(new Date(a.vencimiento), "d MMM", { locale: es })})`
                      } else if (isExpiringSoon) {
                        colorClass = "text-orange-500 font-bold"
                        text = `Vence pronto (${format(new Date(a.vencimiento), "d MMM", { locale: es })})`
                      }

                      return (
                        <span className={`text-xs ${colorClass}`}>
                          {text}
                        </span>
                      )
                    })()}
                  </div>

                  <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-primary bg-secondary/30 sm:bg-transparent" title="Ver RMs">
                          <Dumbbell className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] sm:max-w-[95vw] lg:max-w-7xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-secondary/50 hover:[&::-webkit-scrollbar-thumb]:bg-secondary/80 [&::-webkit-scrollbar-thumb]:rounded-full">
                        <DialogHeader className="sr-only">
                          <DialogTitle>RMs de {a.nombre}</DialogTitle>
                        </DialogHeader>
                        <StudentRMsView alumno={a} rms={(a as any).rms || []} />
                      </DialogContent>
                    </Dialog>
                    <Button size="icon" variant="ghost" className="h-8 w-8 bg-secondary/30 sm:bg-transparent"
                      onClick={() => setEditingAlumno(a)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-destructive bg-secondary/30 sm:bg-transparent"
                      onClick={() => setDeletingId(a.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
          <DialogHeader>
            <DialogTitle>Editar alumno</DialogTitle>
          </DialogHeader>
          {editingAlumno && (
            <>
              <AlumnoForm initial={getEditForm(editingAlumno)} planesDisponibles={planesDisponibles}
                onSubmit={handleUpdate} isLoading={isLoading} />
              
              <div className="pt-4 mt-4 border-t border-border/50 flex items-center justify-between">
                <div className="text-sm">
                  <p className="font-medium">¿Perdió su contraseña?</p>
                  <p className="text-muted-foreground text-xs">Restablecer a la contraseña por defecto.</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={async () => {
                    if (confirm("¿Estás seguro de restablecer la contraseña a 'alumna123'?")) {
                      setIsLoading(true)
                      const { changePassword } = await import("@/lib/actions")
                      const result = await changePassword(editingAlumno.id, "alumna123")
                      setIsLoading(false)
                      if (result.success) toast.success("Contraseña restablecida a 'alumna123'")
                      else toast.error("Error al restablecer contraseña")
                    }
                  }}
                  disabled={isLoading}
                >
                  Restablecer clave
                </Button>
              </div>
            </>
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
