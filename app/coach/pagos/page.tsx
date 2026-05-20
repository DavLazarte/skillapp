import { prisma } from "@/lib/db"
import { PagosView } from "@/components/coach/pagos-view"

export const dynamic = "force-dynamic"

export default async function PagosPage() {
  const [pagos, alumnos] = await Promise.all([
    prisma.pago.findMany({
      include: { user: { select: { id: true, nombre: true, avatar: true, cuota: true } } },
      orderBy: { fecha: "desc" },
    }),
    prisma.user.findMany({
      where: { role: "alumno" },
      select: { id: true, nombre: true, avatar: true, cuota: true },
      orderBy: { nombre: "asc" },
    }),
  ])

  return <PagosView pagos={pagos} alumnos={alumnos} />
}
