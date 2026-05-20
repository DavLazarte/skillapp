import { prisma } from "@/lib/db"
import { PlanesView } from "@/components/coach/planes-view"

export const dynamic = "force-dynamic"

export default async function PlanesPage() {
  const planes = await prisma.tipoPlan.findMany({
    include: {
      _count: { select: { alumnos: true, semanas: true } },
    },
    orderBy: { nombre: "asc" },
  })

  return <PlanesView planes={planes} />
}
