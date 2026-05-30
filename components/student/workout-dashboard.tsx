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
import { Calendar, ExternalLink, CheckCircle2, MessageSquare, Send, Loader2, AlertCircle, Copy } from "lucide-react"
import { format, parseISO, addDays, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { toggleWorkoutCompletion, postComment } from "@/lib/actions"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"

export function WorkoutDashboard({ alumno, semanas, asistencias, comentarios, config }: any) {
  // Check for expiration
  const today = new Date()
  let isExpiringSoon = false
  let daysLeft = 0
  if (alumno?.vencimiento && alumno.estado === "activo") {
    daysLeft = differenceInDays(new Date(alumno.vencimiento), today)
    isExpiringSoon = daysLeft <= 3
  }

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
  
  // Calculate today's index (0: Lunes, 1: Martes ... 5: Sábado)
  const todayDate = new Date()
  const dayOfWeek = todayDate.getDay() // 0 is Sunday, 1 is Monday...
  let defaultDayIdx = dayOfWeek === 0 ? 0 : dayOfWeek - 1 // If Sunday, default to Monday
  if (defaultDayIdx > 5) defaultDayIdx = 5 // Cap at Saturday (index 5)
  
  const [selectedDayIdx, setSelectedDayIdx] = useState(defaultDayIdx)
  const [commentText, setCommentText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  // Sync selectedSemanaId when selectedPlanId changes
  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId)
    const newPlanWeeks = semanas.filter((s: any) => s.tipoPlanId === planId)
    const newCurrent = newPlanWeeks.find((s: any) => s.estado === "en-curso") || newPlanWeeks[0]
    setSelectedSemanaId(newCurrent?.id || "")
    setSelectedDayIdx(defaultDayIdx)
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
      {isExpiringSoon && (
        <div className="bg-destructive/15 border border-destructive/30 text-destructive-foreground p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-top-2">
          <div>
            <h3 className="font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              ¡Tu cuota {daysLeft < 0 ? "está vencida" : "está por vencer"}!
            </h3>
            <p className="text-sm opacity-90 mt-1">
              {daysLeft < 0 
                ? `Se venció hace ${Math.abs(daysLeft)} días.` 
                : daysLeft === 0 ? "Vence hoy mismo." : `Se vence en ${daysLeft} días.`}
            </p>
          </div>
          {config?.aliasPago && (
            <button 
              onClick={() => {
                navigator.clipboard.writeText(config.aliasPago)
                toast.success("¡Alias copiado al portapapeles!")
              }}
              className="bg-background/20 hover:bg-background/40 transition-colors px-4 py-2 rounded-lg backdrop-blur-sm shrink-0 text-left group cursor-pointer border border-transparent hover:border-destructive/30"
            >
              <p className="text-xs uppercase tracking-wider font-bold opacity-70 mb-1 group-hover:opacity-100 transition-opacity">Alias para renovar:</p>
              <p className="font-mono font-bold flex items-center gap-2">
                {config.aliasPago}
                <Copy className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              </p>
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Mi Plan de Entrenamiento</h1>
          <p className="text-muted-foreground mt-1">
            Tu programación semanal personalizada
          </p>
        </div>
      </div>

      {daysLeft < 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-secondary/10 rounded-2xl border border-border/50">
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-2">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Plan Bloqueado</h2>
          <p className="text-muted-foreground max-w-md">
            Tu cuota mensual se encuentra vencida. Por favor, regularizá tu situación para volver a ver tus entrenamientos de la semana.
          </p>
        </div>
      ) : (
        <>
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
                  {(() => {
                    // Helper to get max RM
                    const getRM = (exercise: string) => {
                      const allForExercise = alumno.rms.filter((r: any) => r.ejercicio === exercise)
                      if (allForExercise.length === 0) return null
                      if (exercise === "5km" || exercise === "10k") {
                        return Math.min(...allForExercise.map((r: any) => r.kg))
                      }
                      return Math.max(...allForExercise.map((r: any) => r.kg))
                    }

                    const formatTime = (totalSeconds: number) => {
                      const m = Math.floor(totalSeconds / 60)
                      const s = Math.floor(totalSeconds % 60)
                      return `${m}:${s.toString().padStart(2, "0")}`
                    }

                    // Parser State
                    let activeRMContext: string | null = null
                    
                    return selectedDayData.contenido.split("\n").map((line: string, idx: number) => {
                      const lowerLine = line.toLowerCase()
                      
                      // 1. Detect Context Shift
                      if (lowerLine.includes("clean") || lowerLine.includes("squat")) {
                        // "clean and jerk" overrides clean
                        if (lowerLine.includes("jerk")) activeRMContext = "Jerk"
                        else activeRMContext = "Clean"
                      } else if (lowerLine.includes("snatch")) {
                        activeRMContext = "Snatch"
                      } else if (lowerLine.includes("jerk")) {
                        activeRMContext = "Jerk"
                      }

                      // 2. Process Line
                      let processedLine: React.ReactNode = line

                      // Check for running
                      if (lowerLine.includes("5km")) {
                        const pb = getRM("5km")
                        processedLine = (
                          <span>
                            {line} <span className="text-primary font-bold ml-2 bg-primary/10 px-2 py-0.5 rounded text-xs">[ PB: {pb ? formatTime(pb) + " min" : "Sin RM"} ]</span>
                          </span>
                        )
                      } else if (lowerLine.includes("10k")) {
                        const pb = getRM("10k")
                        processedLine = (
                          <span>
                            {line} <span className="text-primary font-bold ml-2 bg-primary/10 px-2 py-0.5 rounded text-xs">[ PB: {pb ? formatTime(pb) + " min" : "Sin RM"} ]</span>
                          </span>
                        )
                      } 
                      // Check for percentages
                      else {
                        const percentMatch = line.match(/(\d+)%/)
                        if (percentMatch && activeRMContext) {
                          const percent = parseInt(percentMatch[1])
                          const maxRM = getRM(activeRMContext)
                          if (maxRM) {
                            const calculatedWeight = Math.round(((maxRM * percent) / 100) * 10) / 10
                            // Split line to insert badge right after the percentage
                            const parts = line.split(percentMatch[0])
                            processedLine = (
                              <span>
                                {parts[0]}{percentMatch[0]}
                                <span className="text-primary font-bold mx-2 bg-primary/10 px-2 py-0.5 rounded text-xs">
                                  [ {calculatedWeight}kg ]
                                </span>
                                {parts[1]}
                              </span>
                            )
                          } else {
                            // Split line to insert "Sin RM" badge
                            const parts = line.split(percentMatch[0])
                            processedLine = (
                              <span>
                                {parts[0]}{percentMatch[0]}
                                <span className="text-muted-foreground/60 italic mx-2 text-xs">
                                  [ Sin RM de {activeRMContext} ]
                                </span>
                                {parts[1]}
                              </span>
                            )
                          }
                        }
                      }

                      // 3. Render Formatting
                      if (line.startsWith("**") && line.endsWith("**")) {
                        return (
                          <h4 key={idx} className="font-black italic uppercase text-lg text-primary mt-8 first:mt-0 flex items-center gap-3">
                            <span className="w-1 h-6 bg-primary rounded-full" />
                            {processedLine}
                          </h4>
                        )
                      }
                      if (line.startsWith("- ")) {
                        return (
                          <div key={idx} className="flex items-start gap-3 my-2 pl-4">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/60" />
                            <p className="text-foreground/90 leading-snug m-0">{processedLine}</p>
                          </div>
                        )
                      }
                      if (line.startsWith("*") && line.endsWith("*")) {
                        return (
                          <div key={idx} className="bg-primary/5 border-l-2 border-primary/30 p-4 rounded-r-lg my-6">
                            <p className="text-muted-foreground italic m-0">
                              {processedLine}
                            </p>
                          </div>
                        )
                      }
                      return line ? (
                        <p key={idx} className="text-foreground/80 leading-relaxed mb-4">
                          {processedLine}
                        </p>
                      ) : null
                    })
                  })()}
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
      </>
      )}
    </div>
  )
}
