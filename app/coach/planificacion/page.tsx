import { prisma } from "@/lib/db"
import { KanbanBoard } from "@/components/coach/kanban-board"

export default async function PlanificacionPage() {
  const [planes, semanas] = await Promise.all([
    prisma.tipoPlan.findMany({ orderBy: { nombre: "asc" } }),
    prisma.semana.findMany({
      include: {
        dias: { include: { links: true }, orderBy: { orden: "asc" } },
        tipoPlan: true,
      },
      orderBy: { numero: "asc" },
    }),
  ])

  return <KanbanBoard planesDisponibles={planes} semanasIniciales={semanas} />
}
