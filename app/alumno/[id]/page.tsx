import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { WorkoutDashboard } from "@/components/student/workout-dashboard"

export const dynamic = "force-dynamic"

export default async function StudentPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const alumno = await prisma.user.findUnique({
    where: { id, role: "alumno" },
    include: {
      asistencias: true,
      planes: {
        include: {
          tipoPlan: true
        }
      }
    }
  })
  
  if (!alumno) {
    notFound()
  }

  const planIds = alumno.planes.map(p => p.tipoPlanId)
  
  const semanas = await prisma.semana.findMany({
    where: {
      tipoPlanId: { in: planIds },
      estado: { in: ["en-curso", "finalizado"] } // Oculta 'planificacion'
    },
    include: {
      tipoPlan: true,
      dias: {
        include: {
          links: true,
        },
        orderBy: {
          orden: "asc",
        }
      }
    },
    orderBy: {
      numero: "asc"
    }
  })

  // Ordenar días manualmente por orden
  semanas.forEach(s => {
    s.dias.sort((a, b) => a.orden - b.orden)
  })

  const comentarios = await prisma.comentario.findMany({
    where: { userId: id },
    orderBy: { fecha: "desc" }
  })

  return (
    <WorkoutDashboard 
      alumno={alumno} 
      semanas={semanas} 
      asistencias={alumno.asistencias}
      comentarios={comentarios}
    />
  )
}
