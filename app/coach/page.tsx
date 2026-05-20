import { prisma } from "@/lib/db"
import { CoachDashboardView } from "@/components/coach/coach-dashboard-view"

export const dynamic = "force-dynamic"

export default async function CoachDashboardPage() {
  const alumnos = await prisma.user.findMany({
    where: { role: "alumno" },
  })

  const semanas = await prisma.semana.findMany({
    orderBy: { numero: "asc" }
  })

  const comentarios = await prisma.comentario.findMany({
    orderBy: { fecha: "desc" },
    include: { user: true }
  })

  const pagos = await prisma.pago.findMany({
    orderBy: { fecha: "desc" },
    include: { user: true }
  })

  return (
    <CoachDashboardView 
      alumnos={alumnos} 
      semanas={semanas} 
      comentarios={comentarios} 
      pagos={pagos} 
    />
  )
}
