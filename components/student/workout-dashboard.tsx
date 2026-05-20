"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatusBadge } from "@/components/shared/status-badge"
import { Calendar, ExternalLink, CheckCircle2, MessageSquare, Send, Loader2 } from "lucide-react"
import { format, parseISO, addDays } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { toggleWorkoutCompletion, postComment } from "@/lib/actions"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"

export function WorkoutDashboard({ alumno, semanas, asistencias, comentarios }: any) {
  // Get all unique plans that have weeks
  const plans = alumno.planes.map((p: any) => p.tipoPlan)
  
  // State for selected plan
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || "")
  
  // Filter weeks by the selected plan
  const planWeeks = semanas.filter((s: any) => s.tipoPlanId === selectedPlanId)
  
  // Find current "en-curso" week or fallback to first week of the plan
  const currentWeek = planWeeks.find((s: any) => s.estado === "en-curso") || planWeeks[0]
  
  // State for selected week ID
  const [selectedSemanaId, setSelectedSemanaId] = useState(currentWeek?.id || "")
  const [selectedDayIdx, setSelectedDayIdx] = useState(0)
  const [commentText, setCommentText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  // Sync selectedSemanaId when selectedPlanId changes
  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId)
    const newPlanWeeks = semanas.filter((s: any) => s.tipoPlanId === planId)
    const newCurrent = newPlanWeeks.find((s: any) => s.estado === "en-curso") || newPlanWeeks[0]
    setSelectedSemanaId(newCurrent?.id || "")
    setSelectedDayIdx(0)
  }

  const selectedSemana = planWeeks.find((s: any) => s.id === selectedSemanaId) || currentWeek
  const selectedDayData = selectedSemana?.dias[selectedDayIdx]
  
  const isCompleted = asistencias.some((a: any) => a.diaId === selectedDayData?.id && a.completado)

  const diasNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

  const getDateRange = (startDate: string) => {
    const start = parseISO(startDate)
    const end = addDays(start, 5)
    return `${format(start, "d MMMM", { locale: es })} - ${format(end, "d MMMM", { locale: es })}`
  }

  const handleToggleCompletion = async () => {
    if (!selectedDayData) return
    setIsToggling(true)
    const result = await toggleWorkoutCompletion(alumno.id, selectedDayData.id, !isCompleted)
    if (result.success) {
      toast.success(isCompleted ? "Entrenamiento marcado como pendiente" : "¡Entrenamiento completado!")
    } else {
      toast.error(result.error)
    }
    setIsToggling(false)
  }

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || !selectedDayData || !selectedSemana) return
    setIsSubmitting(true)
    const result = await postComment(alumno.id, selectedSemana.numero, selectedDayData.nombre, commentText, "alumno")
    if (result.success) {
      toast.success("Comentario enviado")
      setCommentText("")
    } else {
      toast.error(result.error)
    }
    setIsSubmitting(false)
  }

  const dayComments = comentarios.filter(
    (c: any) => selectedSemana && c.semanaNumero === selectedSemana.numero && c.diaNombre === selectedDayData?.nombre
  )

  const activePlan = plans.find((p: any) => p.id === selectedPlanId)

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Mi Plan de Entrenamiento</h1>
          <p className="text-muted-foreground mt-1">
            Tu programación semanal personalizada
          </p>
        </div>
        
        {planWeeks.length > 0 && (
          <Select value={selectedSemanaId} onValueChange={(v) => { setSelectedSemanaId(v); setSelectedDayIdx(0) }}>
            <SelectTrigger className="w-[200px] bg-card border-border/50">
              <SelectValue placeholder="Seleccionar semana" />
            </SelectTrigger>
            <SelectContent>
              {planWeeks.map((s: any) => (
                <SelectItem key={s.id} value={s.id}>
                  Semana {s.numero} {s.estado === "en-curso" ? "(actual)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Plan selection buttons (only if user has > 1 plan) */}
      {plans.length > 1 && (
        <div className="flex gap-2 flex-wrap bg-secondary/10 p-1 rounded-xl w-fit">
          {plans.map((p: any) => (
            <button
              key={p.id}
              onClick={() => handlePlanChange(p.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                selectedPlanId === p.id
                  ? "text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              style={selectedPlanId === p.id ? { backgroundColor: p.color } : {}}
            >
              {p.nombre}
            </button>
          ))}
        </div>
      )}

      {/* Week Info Card */}
      {!selectedSemana ? (
        <Card className="p-8 text-center text-muted-foreground border-border bg-card">
          No hay semanas cargadas o en curso para este plan actualmente.
        </Card>
      ) : (
        <Card className="overflow-hidden border-none bg-gradient-to-br from-primary/10 via-background to-secondary/10 shadow-xl ring-1 ring-white/10">
          <CardContent className="p-0">
            <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="px-3 py-1 text-white rounded-full text-xs font-bold uppercase tracking-wider"
                    style={{ backgroundColor: activePlan?.color || "#f97316" }}
                  >
                    {selectedSemana.estado.replace("-", " ")}
                  </div>
                  <span className="text-muted-foreground text-sm">•</span>
                  <span className="text-muted-foreground text-sm flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {getDateRange(selectedSemana.fechaInicio.toISOString())}
                  </span>
                </div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter sm:text-3xl">
                  {selectedSemana.titulo}
                </h2>
              </div>
              
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                {diasNames.map((dia, idx) => {
                  const day = selectedSemana.dias[idx]
                  const completed = asistencias.some((a: any) => a.diaId === day?.id && a.completado)
                  return (
                    <button
                      key={dia}
                      onClick={() => setSelectedDayIdx(idx)}
                      className={cn(
                        "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-200 border-2 relative",
                        selectedDayIdx === idx 
                          ? "bg-primary border-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20" 
                          : "bg-secondary/30 border-transparent text-muted-foreground hover:bg-secondary/50",
                        completed && selectedDayIdx !== idx && "text-primary border-primary/30"
                      )}
                    >
                      <span className="font-bold text-sm">{dia.charAt(0)}</span>
                      {completed && <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background" />}
                    </button>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Day Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden group">
          <CardHeader className="border-b border-border/50 bg-secondary/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">{selectedDayData?.nombre}</CardTitle>
                <p className="text-sm text-muted-foreground">{selectedDayData?.descanso ? "Día de Recuperación" : "Sesión de Entrenamiento"}</p>
              </div>
              {!selectedDayData?.descanso && (
                <Button
                  size="sm"
                  variant={isCompleted ? "default" : "outline"}
                  onClick={handleToggleCompletion}
                  disabled={isToggling}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    isCompleted && "bg-success hover:bg-success/90 text-success-foreground"
                  )}
                >
                  {isToggling ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isCompleted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Completado
                    </>
                  ) : (
                    "Marcar Completado"
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            {selectedDayData?.descanso ? (
              <div className="text-center py-12 space-y-4">
                <div className="text-6xl animate-bounce">🏖️</div>
                <h3 className="text-2xl font-bold italic uppercase">Descanso Activo</h3>
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                  {selectedDayData.contenido || "Aprovechá para recuperar. Movilidad, estiramientos y buena alimentación. El cuerpo se construye en el descanso."}
                </p>
              </div>
            ) : !selectedDayData?.contenido || selectedDayData.contenido.trim() === "" ? (
              <div className="text-center py-12 space-y-3">
                <div className="text-4xl">🏋️</div>
                <h3 className="text-lg font-bold italic uppercase text-muted-foreground">Rutina en Preparación</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  El coach todavía no ha cargado el entrenamiento para este día. ¡Volvé a chequear más tarde!
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Workout Content */}
                <div className="prose prose-invert prose-sm max-w-none">
                  {selectedDayData.contenido.split("\n").map((line: string, idx: number) => {
                    if (line.startsWith("**") && line.endsWith("**")) {
                      return (
                        <h4 key={idx} className="font-black italic uppercase text-lg text-primary mt-8 first:mt-0 flex items-center gap-3">
                          <span className="w-1 h-6 bg-primary rounded-full" />
                          {line.replace(/\*\*/g, "")}
                        </h4>
                      )
                    }
                    if (line.startsWith("- ")) {
                      return (
                        <div key={idx} className="flex items-start gap-3 my-2 pl-4">
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/60" />
                          <p className="text-foreground/90 leading-snug m-0">{line.slice(2)}</p>
                        </div>
                      )
                    }
                    if (line.startsWith("*") && line.endsWith("*")) {
                      return (
                        <div key={idx} className="bg-primary/5 border-l-2 border-primary/30 p-4 rounded-r-lg my-6">
                          <p className="text-muted-foreground italic m-0">
                            {line.replace(/\*/g, "")}
                          </p>
                        </div>
                      )
                    }
                    return line ? (
                      <p key={idx} className="text-foreground/80 leading-relaxed mb-4">
                        {line}
                      </p>
                    ) : null
                  })}
                </div>

                {/* Exercise Links */}
                {selectedDayData?.links.length > 0 && (
                  <div className="pt-8 border-t border-border/50">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Videos de Referencia</h4>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {selectedDayData.links.map((link: any, idx: number) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-secondary/20 hover:bg-secondary/40 rounded-xl transition-colors group/link"
                        >
                          <span className="text-sm font-medium">{link.titulo}</span>
                          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover/link:text-primary transition-colors" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar: Feedback & Social */}
        <div className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Feedback del Día
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                {dayComments.length === 0 ? (
                  <p className="text-center py-8 text-xs text-muted-foreground italic">
                    Sin comentarios todavía. ¿Cómo te fue hoy?
                  </p>
                ) : (
                  dayComments.map((c: any) => (
                    <div key={c.id} className={cn(
                      "p-3 rounded-2xl text-sm",
                      c.rol === "coach" ? "bg-primary/10 border border-primary/20 ml-4" : "bg-secondary/30 mr-4"
                    )}>
                      <p className="font-bold text-[10px] uppercase tracking-wider mb-1 opacity-60">
                        {c.rol === "coach" ? "Coach Rodi" : "Tú"} • {format(parseISO(c.fecha.toISOString()), "HH:mm")}
                      </p>
                      <p className="text-foreground/90">{c.texto}</p>
                    </div>
                  ))
                )}
              </div>
              
              <form onSubmit={handlePostComment} className="relative mt-4">
                <Input
                  placeholder="Escribí un comentario..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="bg-secondary/30 border-none pr-10 focus-visible:ring-primary/50"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !commentText.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
