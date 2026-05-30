"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"
import { AvatarCircle } from "@/components/shared/avatar-circle"
import { Users, DollarSign, Calendar, AlertCircle, MessageSquare } from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { WorkoutDashboard } from "@/components/student/workout-dashboard"

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString("es-AR")}`
}

export function CoachDashboardView({ alumnos, semanas, comentarios, pagos, coach }: any) {
  // Give the coach access to all plans for the WorkoutDashboard preview
  const allPlansMap = new Map()
  semanas.forEach((s: any) => {
    if (s.tipoPlan) allPlansMap.set(s.tipoPlanId, s.tipoPlan)
  })
  const coachWithAllPlans = coach ? {
    ...coach,
    planes: Array.from(allPlansMap.values()).map(p => ({ tipoPlan: p }))
  } : null

  const activeStudents = alumnos.filter((a: any) => a.estado === "activo").length
  const currentWeek = semanas.find((s: any) => s.estado === "en-curso")
  
  const monthlyIncome = alumnos
    .filter((a: any) => a.estado === "activo")
    .reduce((sum: number, a: any) => sum + (a.cuota || 0), 0)

  const today = new Date()
  const upcomingExpirations = alumnos.filter((a: any) => {
    if (!a.vencimiento || a.estado !== "activo") return false
    const expDate = new Date(a.vencimiento)
    const daysLeft = differenceInDays(expDate, today)
    return daysLeft <= 7 // Includes expired (negative days) and expiring soon
  })

  const recentStudentComments = comentarios
    .filter((c: any) => c.rol === "alumno")
    .slice(0, 3)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Resumen de tu gimnasio y actividad reciente
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Alumnos activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">de {alumnos.length} totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos estimados</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlyIncome)}</div>
            <p className="text-xs text-muted-foreground mt-1">ARS mensuales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Próximos vencimientos</CardTitle>
            <AlertCircle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingExpirations.length}</div>
            <p className="text-xs text-muted-foreground mt-1">en los próximos 7 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ciclo actual</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Semana {currentWeek?.numero || 0} de {semanas.length}</div>
            <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full"
                style={{ width: `${((currentWeek?.numero || 0) / semanas.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Embedded Student View for Coach */}
      {coachWithAllPlans && semanas.length > 0 && (
        <div className="pt-4 pb-8 border-b border-border/50">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Tu Entrenamiento</h2>
              <p className="text-sm text-muted-foreground">Completá tu plan y registrá tus marcas desde acá</p>
            </div>
          </div>
          <WorkoutDashboard 
            alumno={coachWithAllPlans} 
            semanas={semanas} 
            asistencias={coachWithAllPlans.asistencias || []}
            comentarios={comentarios}
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Comentarios recientes
            </CardTitle>
            <Link href="/coach/alumnos" className="text-sm text-primary hover:underline">Ver todos</Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentStudentComments.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">No hay comentarios recientes</p>
            ) : (
              recentStudentComments.map((comment: any) => (
                <div key={comment.id} className="flex gap-3 p-3 bg-secondary/30 rounded-lg">
                  <AvatarCircle initials={comment.user?.avatar || "?"} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{comment.user?.nombre}</span>
                      <span className="text-xs text-muted-foreground">Semana {comment.semanaNumero} - {comment.diaNombre}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{comment.texto}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Próximos vencimientos
            </CardTitle>
            <Link href="/coach/alumnos" className="text-sm text-primary hover:underline">Ver todos</Link>
          </CardHeader>
          <CardContent>
            {upcomingExpirations.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">No hay vencimientos próximos</p>
            ) : (
              <div className="space-y-3">
                {upcomingExpirations.map((a: any) => {
                  const daysLeft = differenceInDays(new Date(a.vencimiento!), today)
                  return (
                    <div key={a.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AvatarCircle initials={a.avatar} size="sm" />
                        <div>
                          <p className="font-medium text-sm">{a.nombre}</p>
                          <p className="text-xs text-muted-foreground">{formatCurrency(a.cuota || 0)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${daysLeft <= 3 ? "text-destructive" : "text-warning"}`}>
                          {daysLeft === 0 ? "Hoy" : `${daysLeft} días`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(a.vencimiento!), "d MMM", { locale: es })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
