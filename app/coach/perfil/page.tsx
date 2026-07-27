import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { CoachProfileView } from "@/components/coach/coach-profile-view"

export const dynamic = "force-dynamic"

export default async function CoachProfilePage() {
  const coach = await prisma.user.findFirst({
    where: { role: "coach" },
    include: {
      planes: {
        include: {
          tipoPlan: true
        }
      }
    }
  })

  if (!coach) {
    notFound()
  }

  const planesDisponibles = await prisma.tipoPlan.findMany({
    orderBy: { nombre: "asc" }
  })

  return (
    <CoachProfileView 
      coach={coach} 
      planesDisponibles={planesDisponibles} 
    />
  )
}
