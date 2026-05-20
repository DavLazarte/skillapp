"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dumbbell, TrendingUp, Calendar, Plus, Loader2 } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addRM } from "@/lib/actions"
import { toast } from "sonner"

const EJERCICIOS = [
  "Back Squat", "Front Squat", "Deadlift", "Clean & Jerk", "Snatch",
  "Bench Press", "Thruster", "Press", "Push Press", "Power Clean",
  "Overhead Squat"
]

export function StudentRMsView({ alumno, rms }: any) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ejercicio, setEjercicio] = useState("")
  const [kg, setKg] = useState("")

  // Group RMs by exercise and get the latest for each
  const groupedRMs = rms.reduce((acc: any, rm: any) => {
    if (!acc[rm.ejercicio] || new Date(rm.fecha) > new Date(acc[rm.ejercicio].fecha)) {
      acc[rm.ejercicio] = rm
    }
    return acc
  }, {})

  const latestRMs = Object.values(groupedRMs)

  const handleAddRM = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ejercicio || !kg) return
    setIsSubmitting(true)
    const result = await addRM(alumno.id, ejercicio, parseFloat(kg))
    if (result.success) {
      toast.success("Record Personal actualizado")
      setIsOpen(false)
      setEjercicio("")
      setKg("")
    } else {
      toast.error(result.error)
    }
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Records Personales</h1>
          <p className="text-muted-foreground mt-1">
            Tus mejores marcas en cada ejercicio
          </p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Marca
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border/50">
            <DialogHeader>
              <DialogTitle>Registrar Nueva Marca</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddRM} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Ejercicio</Label>
                <Select value={ejercicio} onValueChange={setEjercicio}>
                  <SelectTrigger className="bg-secondary/30">
                    <SelectValue placeholder="Seleccionar ejercicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {EJERCICIOS.map(e => (
                      <SelectItem key={e} value={e}>{e}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Peso (kg)</Label>
                <Input 
                  type="number" 
                  step="0.5" 
                  placeholder="Ej: 85" 
                  value={kg}
                  onChange={(e) => setKg(e.target.value)}
                  className="bg-secondary/30"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar Registro"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Ejercicios</p>
              <p className="text-2xl font-bold">{latestRMs.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-success/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Registros</p>
              <p className="text-2xl font-bold">{rms.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Última actualización</p>
              <p className="text-2xl font-bold">
                {rms.length > 0 
                  ? format(new Date(rms[0].fecha), "d MMM", { locale: es })
                  : "-"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RMs Grid */}
      {latestRMs.length === 0 ? (
        <Card className="bg-card/50 border-border/50 border-dashed py-12">
          <CardContent className="text-center">
            <Dumbbell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sin registros todavía</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Empezá a registrar tus marcas para seguir tu progreso a lo largo del tiempo.
            </p>
            <Button onClick={() => setIsOpen(true)} variant="outline" className="rounded-full">
              Registrar mi primer RM
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {latestRMs.map((rm: any, idx) => {
            // Find historical max for this exercise
            const allForExercise = rms.filter((r: any) => r.ejercicio === rm.ejercicio)
            const historicalMax = Math.max(...allForExercise.map((r: any) => r.kg))
            
            return (
              <Card key={idx} className="bg-card/50 border-border/50 hover:border-primary/30 transition-all group overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-primary to-primary/20 w-full opacity-50 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Dumbbell className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                      {format(new Date(rm.fecha), "d MMM yyyy", { locale: es })}
                    </span>
                  </div>
                  <h3 className="font-bold text-muted-foreground uppercase tracking-tight mb-1">{rm.ejercicio}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black italic text-primary">{rm.kg}</span>
                    <span className="text-lg font-medium text-muted-foreground italic">kg</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground uppercase font-bold">Record Anterior</span>
                    <span className="font-bold text-success">{historicalMax} kg</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
