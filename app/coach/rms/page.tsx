import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { StudentRMsView } from "@/components/student/student-rms-view"

export const dynamic = "force-dynamic"

export default async function CoachRMsPage() {
  // Fetch the main coach account
  const coach = await prisma.user.findFirst({
    where: { role: "coach" },
  })

  if (!coach) {
    notFound()
  }

  const coachRMs = await prisma.rM.findMany({
    where: { userId: coach.id },
    orderBy: { fecha: "desc" }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mis Propios RMs</h1>
        <p className="text-muted-foreground mt-1">Llevá el registro de tus marcas personales como Coach</p>
      </div>
      <StudentRMsView alumno={coach} rms={coachRMs} />
    </div>
  )
}
