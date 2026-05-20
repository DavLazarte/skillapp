"use client"

import { useState, use } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { alumnos, comentarios as initialComentarios, coach } from "@/lib/mock-data"
import { Comentario } from "@/lib/types"
import { AvatarCircle } from "@/components/shared/avatar-circle"
import { Send, MessageSquare } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { notFound } from "next/navigation"

export default function StudentCommentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const alumno = alumnos.find(a => a.id === id)
  
  const [comentarios, setComentarios] = useState<Comentario[]>(
    initialComentarios.filter(c => c.alumnoId === id)
  )
  const [newComment, setNewComment] = useState("")
  const [commentSemana, setCommentSemana] = useState("3")
  const [commentDia, setCommentDia] = useState("Lunes")

  if (!alumno) {
    notFound()
  }

  const handleSendComment = () => {
    if (!newComment.trim()) return
    const comment: Comentario = {
      id: `c${Date.now()}`,
      alumnoId: id,
      autor: alumno.nombre,
      rol: "alumno",
      semana: Number(commentSemana),
      dia: commentDia,
      texto: newComment,
      fecha: new Date().toISOString()
    }
    setComentarios([...comentarios, comment])
    setNewComment("")
  }

  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

  // Group comments by week and day
  const groupedComments = comentarios.reduce((acc, comment) => {
    const key = `Semana ${comment.semana} - ${comment.dia}`
    if (!acc[key]) acc[key] = []
    acc[key].push(comment)
    return acc
  }, {} as Record<string, Comentario[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Comentarios</h1>
        <p className="text-muted-foreground mt-1">
          Comunicación con tu coach sobre el entrenamiento
        </p>
      </div>

      {/* New Comment */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Nuevo comentario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select value={commentSemana} onValueChange={setCommentSemana}>
              <SelectTrigger className="w-[130px] bg-secondary/50">
                <SelectValue placeholder="Semana" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>Semana {i + 1}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={commentDia} onValueChange={setCommentDia}>
              <SelectTrigger className="w-[130px] bg-secondary/50">
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
              placeholder="Escribí tu comentario o pregunta..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="bg-secondary/50"
              onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
            />
            <Button 
              onClick={handleSendComment} 
              className="bg-primary text-primary-foreground"
              disabled={!newComment.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      {Object.keys(groupedComments).length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sin comentarios todavía</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Usá este espacio para hacer preguntas sobre los ejercicios, 
              comentar cómo te sentiste en el entrenamiento o pedir ajustes.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedComments)
            .sort((a, b) => {
              // Sort by week and day
              const [weekA] = a[0].match(/\d+/) || ["0"]
              const [weekB] = b[0].match(/\d+/) || ["0"]
              return Number(weekB) - Number(weekA)
            })
            .map(([groupKey, comments]) => (
              <Card key={groupKey} className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {groupKey}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {comments
                    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
                    .map((comment) => (
                      <div
                        key={comment.id}
                        className={`flex gap-3 ${comment.rol === "alumno" ? "" : "flex-row-reverse"}`}
                      >
                        <AvatarCircle 
                          initials={comment.rol === "alumno" ? alumno.avatar : "RP"} 
                          size="sm" 
                        />
                        <div className={`max-w-[75%] ${comment.rol === "alumno" ? "" : "text-right"}`}>
                          <div className={`p-3 rounded-lg ${
                            comment.rol === "alumno" 
                              ? "bg-secondary/50" 
                              : "bg-primary/20"
                          }`}>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-sm font-medium">
                                {comment.rol === "alumno" ? "Vos" : coach.nombre.split(" ")[0]}
                              </span>
                            </div>
                            <p className="text-sm">{comment.texto}</p>
                          </div>
                          <span className="text-xs text-muted-foreground mt-1 block">
                            {format(parseISO(comment.fecha), "d MMM, HH:mm", { locale: es })}
                          </span>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  )
}
