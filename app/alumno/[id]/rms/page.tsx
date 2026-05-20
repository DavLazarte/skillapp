import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { StudentRMsView } from "@/components/student/student-rms-view"

export const dynamic = "force-dynamic"

export default async function StudentRMsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const alumno = await prisma.user.findUnique({
    where: { id, role: "alumno" },
  })

  if (!alumno) {
    notFound()
  }

  const studentRMs = await prisma.rM.findMany({
    where: { userId: id },
    orderBy: { fecha: "desc" }
  })

  return <StudentRMsView alumno={alumno} rms={studentRMs} />
}
