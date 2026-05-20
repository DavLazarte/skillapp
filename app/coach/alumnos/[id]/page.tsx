"use client"

import { useState, use } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { alumnos, rms as initialRms, comentarios as initialComentarios, semanas, pagos, ejerciciosDisponibles, coach } from "@/lib/mock-data"
import { RM, Comentario } from "@/lib/types"
import { StatusBadge } from "@/components/shared/status-badge"
import { AvatarCircle } from "@/components/shared/avatar-circle"
import { ArrowLeft, Plus, Send, ExternalLink, Calendar, Mail, Phone, Pencil, Check, X } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { notFound } from "next/navigation"

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString("es-AR")}`
}

export default function AlumnoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const alumno = alumnos.find(a => a.id === id)
  
  const [rms, setRms] = useState<RM[]>(initialRms[id] || [])
  const [comentariosState, setComentariosState] = useState<Comentario[]>(
    initialComentarios.filter(c => c.alumnoId === id)
  )
  const [isEditing, setIsEditing] = useState(false)
  const [editedAlumno, setEditedAlumno] = useState(alumno)
  const [isRmDialogOpen, setIsRmDialogOpen] = useState(false)
  const [newRm, setNewRm] = useState({ ejercicio: "", kg: 0, fecha: new Date().toISOString().split("T")[0] })
  const [newComment, setNewComment] = useState("")
  const [commentSemana, setCommentSemana] = useState("3")
  const [commentDia, setCommentDia] = useState("Lunes")
  
  const currentWeek = semanas.find(s => s.estado === "en-curso")
  const [selectedWeek, setSelectedWeek] = useState(currentWeek?.semana || 1)
  const [selectedDay, setSelectedDay] = useState(0)
  
  const alumnoPagos = pagos.filter(p => p.alumnoId === id)

  if (!alumno) {
    notFound()
  }

  const handleAddRm = () => {
    if (!newRm.ejercicio || newRm.kg <= 0) return
    setRms([...rms, newRm])
    setIsRmDialogOpen(false)
    setNewRm({ ejercicio: "", kg: 0, fecha: new Date().toISOString().split("T")[0] })
  }

  const handleSendComment = () => {
    if (!newComment.trim()) return
    const comment: Comentario = {
      id: `c${Date.now()}`,
      alumnoId: id,
      autor: coach.nombre.split(" ")[0] + " " + coach.nombre.split(" ").pop(),
      rol: "coach",
      semana: Number(commentSemana),
      dia: commentDia,
      texto: newComment,
      fecha: new Date().toISOString()
    }
    setComentariosState([...comentariosState, comment])
    setNewComment("")
  }

  const selectedSemana = semanas.find(s => s.semana === selectedWeek)
  const selectedDayData = selectedSemana?.dias[selectedDay]

  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/coach/alumnos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{alumno.nombre}</h1>
          <p className="text-muted-foreground">Perfil del alumno</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="rms">RMs</TabsTrigger>
          <TabsTrigger value="planificacion">Planificación</TabsTrigger>
          <TabsTrigger value="comentarios">Comentarios</TabsTrigger>
          <TabsTrigger value="pagos">Pagos</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="perfil">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center md:items-start">
                  <AvatarCircle initials={alumno.avatar} size="lg" className="w-24 h-24 text-3xl" />
                  <StatusBadge status={alumno.estado} className="mt-4" />
                </div>
                
                <div className="flex-1 space-y-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Nombre</Label>
                          <Input 
                            value={editedAlumno?.nombre}
                            onChange={(e) => setEditedAlumno({ ...editedAlumno!, nombre: e.target.value })}
                            className="bg-secondary/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input 
                            value={editedAlumno?.email}
                            onChange={(e) => setEditedAlumno({ ...editedAlumno!, email: e.target.value })}
                            className="bg-secondary/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Teléfono</Label>
                          <Input 
                            value={editedAlumno?.telefono}
                            onChange={(e) => setEditedAlumno({ ...editedAlumno!, telefono: e.target.value })}
                            className="bg-secondary/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Cuota</Label>
                          <Input 
                            type="number"
                            value={editedAlumno?.cuota}
                            onChange={(e) => setEditedAlumno({ ...editedAlumno!, cuota: Number(e.target.value) })}
                            className="bg-secondary/50"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => setIsEditing(false)} className="bg-primary text-primary-foreground">
                          <Check className="w-4 h-4 mr-1" /> Guardar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setIsEditing(false); setEditedAlumno(alumno) }}>
                          <X className="w-4 h-4 mr-1" /> Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">{alumno.nombre}</h2>
                        <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                          <Pencil className="w-4 h-4 mr-1" /> Editar
                        </Button>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <span>{alumno.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <span>{alumno.telefono}</span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>Inicio: {format(parseISO(alumno.fechaInicio), "d MMMM yyyy", { locale: es })}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-primary">{formatCurrency(alumno.cuota)}</span>
                          <span className="text-muted-foreground">/ mes</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RMs Tab */}
        <TabsContent value="rms">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Records Personales (RMs)</CardTitle>
              <Dialog open={isRmDialogOpen} onOpenChange={setIsRmDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-primary text-primary-foreground">
                    <Plus className="w-4 h-4 mr-1" /> Registrar RM
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle>Registrar nuevo RM</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Ejercicio</Label>
                      <Select value={newRm.ejercicio} onValueChange={(v) => setNewRm({ ...newRm, ejercicio: v })}>
                        <SelectTrigger className="bg-secondary/50">
                          <SelectValue placeholder="Seleccionar ejercicio" />
                        </SelectTrigger>
                        <SelectContent>
                          {ejerciciosDisponibles.map((ej) => (
                            <SelectItem key={ej} value={ej}>{ej}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Peso (kg)</Label>
                      <Input
                        type="number"
                        value={newRm.kg || ""}
                        onChange={(e) => setNewRm({ ...newRm, kg: Number(e.target.value) })}
                        className="bg-secondary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha</Label>
                      <Input
                        type="date"
                        value={newRm.fecha}
                        onChange={(e) => setNewRm({ ...newRm, fecha: e.target.value })}
                        className="bg-secondary/50"
                      />
                    </div>
                    <Button onClick={handleAddRm} className="w-full bg-primary text-primary-foreground">
                      Guardar RM
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {rms.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay RMs registrados para este alumno
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {rms.map((rm, idx) => {
                    const historicalMax = Math.max(...rms.filter(r => r.ejercicio === rm.ejercicio).map(r => r.kg))
                    const percentage = (rm.kg / historicalMax) * 100
                    return (
                      <Card key={idx} className="bg-secondary/30 border-border">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm text-muted-foreground">{rm.ejercicio}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(parseISO(rm.fecha), "d MMM yy", { locale: es })}
                            </span>
                          </div>
                          <div className="text-3xl font-bold text-primary">{rm.kg} kg</div>
                          <div className="mt-2">
                            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{percentage.toFixed(0)}% del max</span>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Planning Tab */}
        <TabsContent value="planificacion">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>{selectedSemana?.titulo}</CardTitle>
                <Select value={String(selectedWeek)} onValueChange={(v) => { setSelectedWeek(Number(v)); setSelectedDay(0) }}>
                  <SelectTrigger className="w-[180px] bg-secondary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {semanas.map((s) => (
                      <SelectItem key={s.id} value={String(s.semana)}>
                        Semana {s.semana}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Day tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {dias.map((dia, idx) => (
                  <Button
                    key={dia}
                    variant={selectedDay === idx ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDay(idx)}
                    className={selectedDay === idx ? "bg-primary text-primary-foreground" : ""}
                  >
                    {dia.slice(0, 3)}
                  </Button>
                ))}
              </div>

              {/* Day content */}
              {selectedDayData && (
                <div className="p-4 bg-secondary/30 rounded-lg">
                  {selectedDayData.descanso ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Día de descanso
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="prose prose-invert prose-sm max-w-none">
                        {selectedDayData.contenido.split("\n").map((line, idx) => {
                          if (line.startsWith("**") && line.endsWith("**")) {
                            return <h4 key={idx} className="font-bold text-foreground mt-4 first:mt-0">{line.replace(/\*\*/g, "")}</h4>
                          }
                          if (line.startsWith("- ")) {
                            return <li key={idx} className="text-muted-foreground ml-4">{line.slice(2)}</li>
                          }
                          if (line.startsWith("*") && line.endsWith("*")) {
                            return <p key={idx} className="text-muted-foreground italic">{line.replace(/\*/g, "")}</p>
                          }
                          return line ? <p key={idx} className="text-muted-foreground">{line}</p> : null
                        })}
                      </div>
                      {selectedDayData.links.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                          {selectedDayData.links.map((link, idx) => (
                            <a
                              key={idx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 text-primary rounded-full text-sm hover:bg-primary/30 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              {link.titulo}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comentarios">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Comentarios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Comments list */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {comentariosState.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay comentarios aún
                  </div>
                ) : (
                  comentariosState.map((comment) => (
                    <div
                      key={comment.id}
                      className={`flex gap-3 ${comment.rol === "coach" ? "flex-row-reverse" : ""}`}
                    >
                      <AvatarCircle 
                        initials={comment.rol === "coach" ? "RP" : alumno.avatar} 
                        size="sm" 
                      />
                      <div className={`max-w-[70%] ${comment.rol === "coach" ? "text-right" : ""}`}>
                        <div className={`p-3 rounded-lg ${comment.rol === "coach" ? "bg-primary/20" : "bg-secondary/50"}`}>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-sm font-medium">{comment.autor}</span>
                            <span className="text-xs text-muted-foreground px-2 py-0.5 bg-background/50 rounded">
                              Sem {comment.semana} - {comment.dia}
                            </span>
                          </div>
                          <p className="text-sm">{comment.texto}</p>
                        </div>
                        <span className="text-xs text-muted-foreground mt-1 block">
                          {format(parseISO(comment.fecha), "d MMM, HH:mm", { locale: es })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Reply box */}
              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex gap-2">
                  <Select value={commentSemana} onValueChange={setCommentSemana}>
                    <SelectTrigger className="w-[120px] bg-secondary/50">
                      <SelectValue placeholder="Semana" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>Semana {i + 1}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={commentDia} onValueChange={setCommentDia}>
                    <SelectTrigger className="w-[120px] bg-secondary/50">
                      <SelectValue placeholder="Día" />
                    </SelectTrigger>
                    <SelectContent>
                      {dias.map((dia) => (
                        <SelectItem key={dia} value={dia}>{dia}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Escribí tu respuesta..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="bg-secondary/50"
                    onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
                  />
                  <Button onClick={handleSendComment} className="bg-primary text-primary-foreground">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="pagos">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pagos</CardTitle>
              {alumno.estado === "activo" && (
                <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90">
                  Marcar como pagado
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current plan */}
              <div className="p-4 bg-secondary/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Plan actual</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(alumno.cuota)}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={alumno.estado} />
                    {alumno.vencimiento && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Vence: {format(parseISO(alumno.vencimiento), "d MMMM yyyy", { locale: es })}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment history */}
              <div>
                <h4 className="font-medium mb-3">Historial de pagos</h4>
                {alumnoPagos.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No hay pagos registrados</p>
                ) : (
                  <div className="space-y-2">
                    {alumnoPagos.map((pago) => (
                      <div key={pago.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium">{formatCurrency(pago.monto)}</p>
                            <p className="text-xs text-muted-foreground">{pago.metodo}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <StatusBadge status={pago.estado} />
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(parseISO(pago.fecha), "d MMM yyyy", { locale: es })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
