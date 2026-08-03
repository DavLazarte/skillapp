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
import { EJERCICIOS_PARSER_SORTED, isCapacidad } from "@/lib/constants"
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
                    const cleanRMName = (name: string) => {
                      return name.replace(/\[.*?\]\s*/, "").replace(" (Tiempo)", "").replace(" (Reps)", "")
                    }

                    const getRM = (exercise: string) => {
                      const allForExercise = alumno.rms.filter((r: any) => 
                        r.ejercicio === exercise || 
                        cleanRMName(r.ejercicio) === exercise
                      )
                      if (allForExercise.length === 0) return null
                      const isTime = exercise === "5km" || 
                                     exercise === "1k" || 
                                     allForExercise[0].ejercicio.includes(" (Tiempo)")
                      if (isTime) {
                        return Math.min(...allForExercise.map((r: any) => r.kg))
                      }
                      return Math.max(...allForExercise.map((r: any) => r.kg))
                    }

                    const formatTime = (totalSeconds: number) => {
                      const m = Math.floor(totalSeconds / 60)
                      const s = Math.floor(totalSeconds % 60)
                      return `${m}:${s.toString().padStart(2, "0")}`
                    }

                    const isExerciseCapacidad = (exerciseName: string) => {
                      if (!exerciseName) return false
                      if (isCapacidad(exerciseName)) return true
                      return alumno.rms.some((r: any) => 
                        cleanRMName(r.ejercicio) === exerciseName && r.ejercicio.includes(" (Reps)")
                      )
                    }

                    const renderBoldItalic = (text: string) => {
                      const parts = text.split(/(\*\*.*?\*\*)/g)
                      return parts.map((part, i) => {
                        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
                          return <strong key={i} className="font-bold text-foreground">{part.slice(2, -2)}</strong>
                        }
                        const italicParts = part.split(/(\*.*?\*)/g)
                        return italicParts.map((ip, j) => {
                          if (ip.startsWith("*") && ip.endsWith("*") && ip.length > 2) {
                            return <em key={j} className="italic text-foreground/90">{ip.slice(1, -1)}</em>
                          }
                          return ip
                        })
                      })
                    }

                    const renderInlineMarkdown = (text: string) => {
                      const parts = text.split(/(\[.*?\]\(.*?\))/g)
                      return parts.map((part, i) => {
                        const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/)
                        if (linkMatch) {
                          const ytMatch = linkMatch[2].match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([^&?\n]+)/)
                          const ytId = ytMatch ? ytMatch[1] : null
                          
                          if (ytId) {
                            return (
                              <details key={i} className="inline-block group/video my-1 w-full max-w-sm">
                                <summary className="text-primary hover:underline font-medium inline-flex items-center gap-1 bg-primary/10 px-1.5 py-0.5 rounded-md transition-colors hover:bg-primary/20 cursor-pointer list-none select-none">
                                  {renderBoldItalic(linkMatch[1])}
                                  <svg className="w-4 h-4 ml-0.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </summary>
                                <div className="mt-2 mb-3 rounded-xl overflow-hidden border border-border/50 bg-black aspect-video relative shadow-lg">
                                  <iframe src={`https://www.youtube.com/embed/${ytId}`} title={linkMatch[1]} allowFullScreen className="w-full h-full border-0"></iframe>
                                </div>
                              </details>
                            )
                          }
                          
                          return (
                            <a key={i} href={linkMatch[2]} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium inline-flex items-center gap-1 bg-primary/10 px-1.5 py-0.5 rounded-md transition-colors hover:bg-primary/20">
                              {renderBoldItalic(linkMatch[1])}
                            </a>
                          )
                        }
                        return <span key={i}>{renderBoldItalic(part)}</span>
                      })
                    }

                    const normalizeForSearch = (str: string) => str.toLowerCase().replace(/s\b/g, "").replace(/[^a-z0-9 ]/g, "").trim()

                    // Extract custom exercises from student RMs
                    const customExercises = (alumno.rms || [])
                      .map((r: any) => r.ejercicio)
                      .filter((name: string) => name.includes(" (Tiempo)") || name.includes(" (Reps)"))
                      .map((name: string) => cleanRMName(name))
                      
                    // Merge and sort by length descending
                    const allSearchExercises = Array.from(new Set([
                      ...customExercises,
                      ...EJERCICIOS_PARSER_SORTED
                    ])).sort((a, b) => b.length - a.length)

                    // Parser State
                    let activeRMContext: string | null = null
                    
                    return selectedDayData.contenido.split("\n").map((line: string, idx: number) => {
                      const trimmedLine = line.trim()
                      if (!trimmedLine) {
                        return <div key={idx} className="h-4" /> // Respetar saltos de línea (enters)
                      }

                      const isDivider = /^---\s*$/.test(trimmedLine)
                      const headerMatch = trimmedLine.match(/^(MOVILIDAD|ACTIVACIÓN|FUERZA|WARM\s+UP|WEIGHTLIFTING|COMPLEX|ACCESORIOS|BARBELL\s+CONDITIONING|WOD|METCON|AMRAP|EMOM|TABATA|FORTIME|STRENGTH|CARDIO)(?:\s*:|\s+-\s*|\s*$)/i)
                      const isSectionHeader = !!headerMatch && !trimmedLine.startsWith("-") && !trimmedLine.startsWith("#")

                      const lowerLine = line.toLowerCase()
                      const searchLine = normalizeForSearch(line)
                      
                      // 1. Detect Context Shift
                      if (searchLine.includes("clean  jerk") || searchLine.includes("clean and jerk") || searchLine.includes("clean y jerk") || searchLine.includes("cj")) {
                        activeRMContext = "Clean & Jerk"
                      } else if (searchLine.includes("jerk") && !searchLine.includes("clean")) {
                        activeRMContext = "Jerk"
                      } else if (searchLine.includes("clean") && !searchLine.includes("jerk")) {
                        activeRMContext = "Clean"
                      } else if (searchLine.includes("strict press") || searchLine.includes("press estricto")) {
                        activeRMContext = "Press Estricto"
                      } else if (searchLine.includes("ohs") || searchLine.includes("over head squat") || searchLine.includes("overhead squat") || searchLine.includes("snatch")) {
                        activeRMContext = "Snatch"
                      } else {
                        for (const ej of allSearchExercises) {
                          if (searchLine.includes(normalizeForSearch(ej))) {
                            activeRMContext = ej
                            break
                          }
                        }
                      }

                      if (isDivider) {
                        return <hr key={idx} className="my-6 border-t border-border/40" />
                      }

                      if (isSectionHeader) {
                        return (
                          <h3 key={idx} className="font-black italic uppercase text-lg text-primary mt-8 mb-4 flex items-center gap-3 first:mt-2">
                            <span className="w-1 h-5 bg-primary rounded-full shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                            {renderInlineMarkdown(trimmedLine)}
                          </h3>
                        )
                      }

                      // 2. Extract Block Formatting
                      let lineContent = line
                      let isH1 = false
                      let isH2 = false
                      let isList = false
                      let isOldTitle = false

                      if (line.startsWith("# ")) {
                        isH1 = true
                        lineContent = line.substring(2)
                      } else if (line.startsWith("## ")) {
                        isH2 = true
                        lineContent = line.substring(3)
                      } else if (line.startsWith("- ")) {
                        isList = true
                        lineContent = line.substring(2)
                      } else if (line.startsWith("**") && line.endsWith("**") && line.length > 4 && !line.includes(" ")) {
                        isOldTitle = true
                        lineContent = line.substring(2, line.length - 2)
                      }

                      // 3. Process Line & Inject Badges
                      let processedLine: React.ReactNode = lineContent
                      const lowerLineContent = lineContent.toLowerCase()

                      const rangeRegexMatch = lineContent.match(/(\d+)\s*(?:a|al|-)\s+(\d+)%/i)
                      // Prevents "2x5 - 50%" from being parsed as a range "5 - 50"
                      const isInvalidRange = lineContent.match(/\b\d+x\s*\d+\s*-\s*\d+%/i)
                      const rangeMatch = isInvalidRange ? null : rangeRegexMatch
                      
                      const percentMatch = lineContent.match(/([+-]?\d+)%/)
                      const rpMatch = lineContent.match(/(\d+)\s*m\s*(?:rpe|rp)\s*(\d+)/i)

                      if (rangeMatch && activeRMContext) {
                        const percent1 = parseInt(rangeMatch[1])
                        const percent2 = parseInt(rangeMatch[2])
                        const maxRM = getRM(activeRMContext)
                        if (maxRM) {
                          const isTime = activeRMContext === "5km" || 
                                         activeRMContext === "1k" || 
                                         alumno.rms.some((r: any) => 
                                           cleanRMName(r.ejercicio) === activeRMContext && r.ejercicio.includes(" (Tiempo)")
                                         )
                          const isCap = isExerciseCapacidad(activeRMContext)
                          
                          const calc = (p: number) => isTime || isCap
                            ? Math.round((maxRM * p) / 100)
                            : Math.round(((maxRM * p) / 100) * 10) / 10

                          const formatValue = (val: number) => {
                            if (isTime) return `${formatTime(val)} min`
                            return `${val}`
                          }

                          const val1 = calc(percent1)
                          const val2 = calc(percent2)

                          const parts = lineContent.split(rangeMatch[0])
                          const beforeText = parts[0].replace(/\s*-\s*$/, ' ')
                          processedLine = (
                            <span>
                              {renderInlineMarkdown(beforeText)}
                              <span className="text-primary font-bold mx-1 bg-primary/10 px-2 py-0.5 rounded text-xs">
                                {val1 === val2 
                                  ? `con ${formatValue(val1)} ${isTime ? "" : (isCap ? "reps" : "kg")}`
                                  : `con ${formatValue(val1)} a ${formatValue(val2)} ${isTime ? "" : (isCap ? "reps" : "kg")}`}
                              </span>
                              {renderInlineMarkdown(parts[1] || "")}
                            </span>
                          )
                        } else {
                          const parts = lineContent.split(rangeMatch[0])
                          processedLine = (
                            <span>
                              {renderInlineMarkdown(parts[0])}
                              {rangeMatch[0]}
                              <span className="text-muted-foreground/60 italic mx-2 text-xs">
                                [ Sin RM de {activeRMContext} ]
                              </span>
                              {renderInlineMarkdown(parts[1] || "")}
                            </span>
                          )
                        }
                      } else if (percentMatch && activeRMContext) {
                        const isModifier = percentMatch[1].startsWith("+") || percentMatch[1].startsWith("-")
                        const percent = parseInt(percentMatch[1])
                        const maxRM = getRM(activeRMContext)
                        if (maxRM) {
                          const isTime = activeRMContext === "5km" || 
                                         activeRMContext === "1k" || 
                                         alumno.rms.some((r: any) => 
                                           cleanRMName(r.ejercicio) === activeRMContext && r.ejercicio.includes(" (Tiempo)")
                                         )
                          const isCap = isExerciseCapacidad(activeRMContext)
                          
                          let calculatedWeight = 0
                          
                          if (isTime) {
                            // Running/Cardio pace logic
                            let baseTime = maxRM
                            
                            // Extract distance if specified e.g. "4x500 m" or "1000m"
                            const distMatch = lineContent.match(/(?:x|\b)(\d+)\s*m\b/i) || lineContent.match(/\b(\d+)\s*m\b/i)
                            if (distMatch) {
                              const distanceMeters = parseInt(distMatch[1])
                              const baseDist = activeRMContext === "5km" ? 5000 : 1000
                              baseTime = maxRM * (distanceMeters / baseDist)
                            }
                            
                            // Modifiers: +2% means 2% faster (subtract from time), -2% means slower
                            if (isModifier) {
                              calculatedWeight = Math.round(baseTime * (1 - (percent / 100)))
                            } else {
                              calculatedWeight = Math.round((baseTime * percent) / 100)
                            }
                          } else {
                            // Strength / Capacity logic
                            calculatedWeight = isCap
                              ? Math.round((maxRM * percent) / 100)
                              : Math.round(((maxRM * percent) / 100) * 10) / 10
                          }
                          
                          const formatValue = (val: number) => {
                            if (isTime) return `${formatTime(val)} min`
                            if (isCap) return `${val} reps`
                            return `${val} kg`
                          }

                          const parts = lineContent.split(percentMatch[0])
                          const beforeText = parts[0].replace(/\s*-\s*$/, ' ')
                          processedLine = (
                            <span>
                              {renderInlineMarkdown(beforeText)}
                              <span className="text-primary font-bold mx-1 bg-primary/10 px-2 py-0.5 rounded text-xs">
                                {isTime ? `[ Obj: ${formatValue(calculatedWeight)} ]` : `con ${formatValue(calculatedWeight)}`}
                              </span>
                              {renderInlineMarkdown(parts[1] || "")}
                            </span>
                          )
                        } else {
                          const parts = lineContent.split(percentMatch[0])
                          processedLine = (
                            <span>
                              {renderInlineMarkdown(parts[0])}
                              {percentMatch[0]}
                              <span className="text-muted-foreground/60 italic mx-2 text-xs">
                                [ Sin RM de {activeRMContext} ]
                              </span>
                              {renderInlineMarkdown(parts[1] || "")}
                            </span>
                          )
                        }
                      } else if (rpMatch) {
                        const distanceMeters = parseInt(rpMatch[1])
                        const rpeValue = parseInt(rpMatch[2])
                        const rm1k = getRM("1k")
                        const rm5k = getRM("5km")
                        
                        let baseTimeSeconds = 0
                        let baseDistance = 0
                        
                        if (rm1k) {
                          baseTimeSeconds = rm1k
                          baseDistance = 1000
                        } else if (rm5k) {
                          baseTimeSeconds = rm5k
                          baseDistance = 5000
                        }
                        
                        if (baseTimeSeconds > 0 && rpeValue > 0 && rpeValue <= 10) {
                          const basePacePerMeter = baseTimeSeconds / baseDistance
                          const baseTimeForTarget = distanceMeters * basePacePerMeter
                          const targetTime = baseTimeForTarget * (rpeValue / 10)
                          
                          const parts = lineContent.split(rpMatch[0])
                          processedLine = (
                            <span>
                              {renderInlineMarkdown(parts[0])}
                              {rpMatch[0]}
                              <span className="text-primary font-bold mx-2 bg-primary/10 px-2 py-0.5 rounded text-xs shadow-sm">
                                [ Obj: {formatTime(targetTime)} min ]
                              </span>
                              {renderInlineMarkdown(parts[1] || "")}
                            </span>
                          )
                        } else {
                          const parts = lineContent.split(rpMatch[0])
                          processedLine = (
                            <span>
                              {renderInlineMarkdown(parts[0])}
                              {rpMatch[0]}
                              <span className="text-muted-foreground/60 italic mx-2 text-xs">
                                [ Sin RM para Predictor ]
                              </span>
                              {renderInlineMarkdown(parts[1] || "")}
                            </span>
                          )
                        }
                      } else if (lowerLineContent.includes("5km")) {
                        const pb = getRM("5km")
                        processedLine = (
                          <span>
                            {renderInlineMarkdown(lineContent)} <span className="text-primary font-bold ml-2 bg-primary/10 px-2 py-0.5 rounded text-xs">[ PB: {pb ? formatTime(pb) + " min" : "Sin RM"} ]</span>
                          </span>
                        )
                      } else if (lowerLineContent.includes("1k")) {
                        const pb = getRM("1k")
                        processedLine = (
                          <span>
                            {renderInlineMarkdown(lineContent)} <span className="text-primary font-bold ml-2 bg-primary/10 px-2 py-0.5 rounded text-xs">[ PB: {pb ? formatTime(pb) + " min" : "Sin RM"} ]</span>
                          </span>
                        )
                      } else {
                        processedLine = renderInlineMarkdown(lineContent)
                      }

                      // 4. Render Block Formatting
                      if (isH1) {
                        return (
                          <h3 key={idx} className="font-black italic uppercase text-2xl text-primary mt-8 mb-4 flex items-center gap-3">
                            <span className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                            {processedLine}
                          </h3>
                        )
                      }
                      if (isH2) {
                        return (
                          <h4 key={idx} className="font-bold text-lg text-foreground mt-6 mb-2 flex items-center gap-2">
                            <span className="w-1 h-5 bg-primary/60 rounded-full" />
                            {processedLine}
                          </h4>
                        )
                      }
                      if (isList) {
                        return (
                          <div key={idx} className="flex items-start gap-3 my-2 pl-4 group">
                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary/60 group-hover:bg-primary transition-colors shrink-0" />
                            <div className="text-foreground/90 leading-snug m-0 flex-1">{processedLine}</div>
                          </div>
                        )
                      }
                      // Retrocompatibility for the old **TITLE** full-line format
                      if (isOldTitle) {
                        return (
                          <h4 key={idx} className="font-black italic uppercase text-lg text-primary mt-8 mb-3 first:mt-0 flex items-center gap-3">
                            <span className="w-1 h-6 bg-primary rounded-full" />
                            {processedLine}
                          </h4>
                        )
                      }
                      
                      return (
                        <div key={idx} className="text-foreground/80 leading-relaxed my-1">
                          {processedLine}
                        </div>
                      )
                    })
                  })()}
                </div>

                {selectedDayData.links && selectedDayData.links.length > 0 && (
              <div className="mt-8 space-y-4">
                <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Links y Videos
                </h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {selectedDayData.links.map((link: any) => {
                    const ytMatch = link.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\n]+)/)
                    const ytId = ytMatch ? ytMatch[1] : null
                    
                    if (ytId) {
                      return (
                        <div key={link.id} className="group flex flex-col overflow-hidden bg-card/50 hover:bg-card border border-border/50 hover:border-primary/50 rounded-xl transition-all">
                          <div className="relative w-full aspect-video bg-black">
                            <iframe 
                              src={`https://www.youtube.com/embed/${ytId}`} 
                              title={link.titulo} 
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                              allowFullScreen 
                              className="w-full h-full border-0"
                            ></iframe>
                          </div>
                          <div className="p-4">
                            <span className="font-bold text-foreground group-hover:text-primary transition-colors text-sm block mb-1">{link.titulo}</span>
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate block">Abrir en YouTube</a>
                          </div>
                        </div>
                      )
                    }

                    return (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col p-4 bg-card/50 hover:bg-card border border-border/50 hover:border-primary/50 rounded-xl transition-all"
                      >
                        <span className="font-bold text-foreground group-hover:text-primary transition-colors text-sm mb-1">{link.titulo}</span>
                        <span className="text-xs text-muted-foreground truncate">{link.url}</span>
                      </a>
                    )
                  })}
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
