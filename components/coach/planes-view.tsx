"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Pencil, Trash2, Users, Calendar, Dumbbell } from "lucide-react"
import { createTipoPlan, updateTipoPlan, deleteTipoPlan } from "@/lib/actions"
import { toast } from "sonner"

const COLORS = [
  "#f97316", "#8b5cf6", "#22c55e", "#3b82f6", "#ef4444",
  "#ec4899", "#f59e0b", "#14b8a6", "#6366f1", "#84cc16",
]

type Plan = {
  id: string
  nombre: string
  descripcion: string | null
  color: string
  icono: string
  _count: { alumnos: number; semanas: number }
}

function PlanForm({
  initial,
  onSubmit,
  isLoading,
}: {
  initial?: Partial<Plan>
  onSubmit: (data: { nombre: string; descripcion: string; color: string }) => void
  isLoading: boolean
}) {
  const [nombre, setNombre] = useState(initial?.nombre ?? "")
  const [descripcion, setDescripcion] = useState(initial?.descripcion ?? "")
  const [color, setColor] = useState(initial?.color ?? COLORS[0])

  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-2">
        <Label>Nombre del Plan</Label>
        <Input
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder="ej. CrossFit, Musculación, Running..."
          className="bg-secondary/50"
        />
      </div>
      <div className="space-y-2">
        <Label>Descripción (opcional)</Label>
        <Input
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          placeholder="Breve descripción del plan"
          className="bg-secondary/50"
        />
      </div>
      <div className="space-y-2">
        <Label>Color identificador</Label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                backgroundColor: c,
                borderColor: color === c ? "white" : "transparent",
                boxShadow: color === c ? `0 0 0 2px ${c}` : "none",
              }}
            />
          ))}
        </div>
      </div>
      <Button
        onClick={() => onSubmit({ nombre, descripcion, color })}
        disabled={!nombre.trim() || isLoading}
        className="w-full"
      >
        {isLoading ? "Guardando..." : "Guardar"}
      </Button>
    </div>
  )
}

export function PlanesView({ planes }: { planes: Plan[] }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleCreate = async (data: { nombre: string; descripcion: string; color: string }) => {
    setIsLoading(true)
    const result = await createTipoPlan(data)
    setIsLoading(false)
    if (result.success) {
      toast.success("Plan creado")
      setIsCreateOpen(false)
    } else {
      toast.error(result.error)
    }
  }

  const handleUpdate = async (data: { nombre: string; descripcion: string; color: string }) => {
    if (!editingPlan) return
    setIsLoading(true)
    const result = await updateTipoPlan(editingPlan.id, data)
    setIsLoading(false)
    if (result.success) {
      toast.success("Plan actualizado")
      setEditingPlan(null)
    } else {
      toast.error(result.error)
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    const result = await deleteTipoPlan(deletingId)
    setDeletingId(null)
    if (result.success) {
      toast.success("Plan eliminado")
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planes de Entrenamiento</h1>
          <p className="text-muted-foreground mt-1">
            Tipos de plan disponibles para asignar a tus alumnos
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" /> Nuevo Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Crear nuevo tipo de plan</DialogTitle>
            </DialogHeader>
            <PlanForm onSubmit={handleCreate} isLoading={isLoading} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid */}
      {planes.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <Dumbbell className="w-12 h-12 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground">No hay planes creados todavía</p>
          <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
            Crear el primero
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {planes.map(plan => (
            <Card key={plan.id} className="bg-card border-border overflow-hidden group hover:border-primary/30 transition-colors">
              <div className="h-2" style={{ backgroundColor: plan.color }} />
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${plan.color}20` }}
                    >
                      <Dumbbell className="w-5 h-5" style={{ color: plan.color }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-none">{plan.nombre}</h3>
                      {plan.descripcion && (
                        <p className="text-xs text-muted-foreground mt-1">{plan.descripcion}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => setEditingPlan(plan)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 hover:text-destructive"
                      onClick={() => setDeletingId(plan.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-4 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    <span>{plan._count.alumnos} alumnos</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{plan._count.semanas} semanas</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingPlan} onOpenChange={open => !open && setEditingPlan(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Editar plan</DialogTitle>
          </DialogHeader>
          {editingPlan && (
            <PlanForm initial={editingPlan} onSubmit={handleUpdate} isLoading={isLoading} />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deletingId} onOpenChange={open => !open && setDeletingId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este plan?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminarán también todas las semanas asociadas a este plan. Esta acción no se puede deshacer.
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
