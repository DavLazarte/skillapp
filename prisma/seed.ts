import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
})
const prisma = new PrismaClient({ adapter })

const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

async function main() {
  console.log("🧹 Limpiando base de datos...")
  await prisma.$connect()

  await prisma.asistencia.deleteMany()
  await prisma.link.deleteMany()
  await prisma.dia.deleteMany()
  await prisma.semana.deleteMany()
  await prisma.rM.deleteMany()
  await prisma.comentario.deleteMany()
  await prisma.pago.deleteMany()
  await prisma.alumnoPlan.deleteMany()
  await prisma.tipoPlan.deleteMany()
  await prisma.user.deleteMany()

  console.log("🏋️ Creando tipos de plan...")
  const planes = await Promise.all([
    prisma.tipoPlan.create({
      data: {
        nombre: "CrossFit",
        descripcion: "Entrenamiento funcional de alta intensidad",
        color: "#f97316",
        icono: "dumbbell",
      },
    }),
    prisma.tipoPlan.create({
      data: {
        nombre: "Musculación",
        descripcion: "Hipertrofia y fuerza máxima",
        color: "#8b5cf6",
        icono: "biceps-flexed",
      },
    }),
    prisma.tipoPlan.create({
      data: {
        nombre: "Running",
        descripcion: "Resistencia y técnica de carrera",
        color: "#22c55e",
        icono: "footprints",
      },
    }),
  ])

  console.log("👤 Creando Coach...")
  await prisma.user.create({
    data: {
      id: "coach-1",
      email: "santiago_dominguez@skillfitnessapp.com",
      password: "coach123",
      role: "coach",
      nombre: "Santiago Dominguez",
      avatar: "SD",
      gimnasio: "SkillFitness",
    },
  })

  console.log("🎓 Creando Alumnos...")
  const martina = await prisma.user.create({
    data: {
      id: "a1",
      email: "martina@gmail.com",
      password: "alumna123",
      role: "alumno",
      nombre: "Martina Gómez",
      avatar: "MG",
      estado: "activo",
      cuota: 35000,
      vencimiento: new Date("2025-06-20"),
      telefono: "+54 343 456-7890",
      fechaInicio: new Date("2024-03-01"),
    },
  })

  const lucas = await prisma.user.create({
    data: {
      id: "a2",
      email: "lucas@gmail.com",
      password: "alumno123",
      role: "alumno",
      nombre: "Lucas Fernández",
      avatar: "LF",
      estado: "activo",
      cuota: 35000,
      vencimiento: new Date("2025-06-15"),
      telefono: "+54 343 567-8901",
      fechaInicio: new Date("2024-01-15"),
    },
  })

  // Asignar planes a alumnos
  await prisma.alumnoPlan.create({ data: { userId: martina.id, tipoPlanId: planes[0].id } })
  await prisma.alumnoPlan.create({ data: { userId: lucas.id, tipoPlanId: planes[0].id } })
  await prisma.alumnoPlan.create({ data: { userId: lucas.id, tipoPlanId: planes[2].id } })

  console.log("📅 Creando semana de ejemplo en CrossFit (en-curso)...")
  const semana = await prisma.semana.create({
    data: {
      numero: 1,
      titulo: "Semana 1 — Test de Fuerza",
      estado: "en-curso",
      fechaInicio: new Date("2025-06-02"),
      tipoPlanId: planes[0].id,
    },
  })

  for (let i = 0; i < DIAS_SEMANA.length; i++) {
    await prisma.dia.create({
      data: {
        semanaId: semana.id,
        nombre: DIAS_SEMANA[i],
        descanso: i === 2, // Miércoles descanso
        contenido: i === 2 ? "Descanso activo — Movilidad 30 min" : "",
        orden: i,
      },
    })
  }

  console.log("✅ Seed completado.")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
