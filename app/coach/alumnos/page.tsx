import { prisma } from "@/lib/db"
import { AlumnosView } from "@/components/coach/alumnos-view"

export const dynamic = "force-dynamic"

export default async function AlumnosPage() {
  const [alumnos, planes] = await Promise.all([
    prisma.user.findMany({
      where: { role: "alumno" },
      include: {
        planes: { include: { tipoPlan: true } },
        _count: { select: { pagos: true } },
        rms: true,
      },
      orderBy: { nombre: "asc" },
    }),
    prisma.tipoPlan.findMany({ orderBy: { nombre: "asc" } }),
  ])

  return <AlumnosView alumnos={alumnos} planesDisponibles={planes} />
}
