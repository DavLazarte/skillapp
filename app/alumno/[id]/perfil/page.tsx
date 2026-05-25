import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"
import { StatusBadge } from "@/components/shared/status-badge"
import { AvatarCircle } from "@/components/shared/avatar-circle"
import { Mail, Phone, Calendar, CreditCard } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString("es-AR")}`
}

import { ChangePasswordForm } from "@/components/student/change-password-form"

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const alumno = await prisma.user.findUnique({
    where: { id, role: "alumno" },
  })

  if (!alumno) {
    notFound()
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground mt-1">
          Tu información personal y estado de cuenta
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <AvatarCircle initials={alumno.avatar || "?"} size="lg" className="w-24 h-24 text-3xl" />
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold">{alumno.nombre}</h2>
              <div className="mt-2">
                <StatusBadge status={alumno.estado as any || "activo"} />
              </div>
              <p className="text-muted-foreground mt-2">
                Miembro desde {alumno.fechaInicio ? format(alumno.fechaInicio, "MMMM yyyy", { locale: es }) : "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email
            </CardTitle>
          </CardHeader>
          <CardContent><p className="font-medium">{alumno.email}</p></CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Phone className="w-4 h-4" /> Teléfono
            </CardTitle>
          </CardHeader>
          <CardContent><p className="font-medium">{alumno.telefono || "-"}</p></CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Fecha de inicio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {alumno.fechaInicio ? format(alumno.fechaInicio, "d 'de' MMMM 'de' yyyy", { locale: es }) : "-"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Plan actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium text-primary text-xl">{formatCurrency(alumno.cuota || 0)}<span className="text-muted-foreground text-sm"> / mes</span></p>
          </CardContent>
        </Card>

        <ChangePasswordForm userId={alumno.id} />
      </div>

      {alumno.vencimiento && (
        <Card>
          <CardHeader><CardTitle>Estado de cuota</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Próximo vencimiento</p>
                <p className="text-lg font-medium">{format(alumno.vencimiento, "d 'de' MMMM 'de' yyyy", { locale: es })}</p>
              </div>
              <StatusBadge status={alumno.estado === "activo" ? "pagado" : "pendiente"} />
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-secondary/20 border-border">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            <strong>¿Necesitás hacer cambios?</strong> Contactá a tu coach para actualizar 
            tu información personal o modificar tu plan de entrenamiento.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
