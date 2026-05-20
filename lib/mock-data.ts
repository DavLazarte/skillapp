import { Coach, Alumno, RM, Comentario, SemanaCard, Pago, Dia } from "./types"

export const coach: Coach = {
  id: "coach-1",
  nombre: "Rodrigo 'Rodi' Peralta",
  email: "rodi@crossfit.com",
  avatar: "RP",
  gimnasio: "CrossFit SkillFitness"
}

export const alumnos: Alumno[] = [
  {
    id: "a1",
    nombre: "Martina Gómez",
    email: "martina@gmail.com",
    avatar: "MG",
    estado: "activo",
    cuota: 35000,
    vencimiento: "2025-06-20",
    telefono: "+54 343 456-7890",
    fechaInicio: "2024-03-01"
  },
  {
    id: "a2",
    nombre: "Lucas Fernández",
    email: "lucas@gmail.com",
    avatar: "LF",
    estado: "activo",
    cuota: 35000,
    vencimiento: "2025-06-15",
    telefono: "+54 343 567-8901",
    fechaInicio: "2024-01-15"
  },
  {
    id: "a3",
    nombre: "Sofía Rodríguez",
    email: "sofia@gmail.com",
    avatar: "SR",
    estado: "pausado",
    cuota: 28000,
    vencimiento: "2025-07-01",
    telefono: "+54 343 678-9012",
    fechaInicio: "2024-06-10"
  },
  {
    id: "a4",
    nombre: "Tomás Herrera",
    email: "tomas@gmail.com",
    avatar: "TH",
    estado: "activo",
    cuota: 35000,
    vencimiento: "2025-06-28",
    telefono: "+54 343 789-0123",
    fechaInicio: "2023-11-01"
  },
  {
    id: "a5",
    nombre: "Valentina Cruz",
    email: "vale@gmail.com",
    avatar: "VC",
    estado: "inactivo",
    cuota: 0,
    vencimiento: null,
    telefono: "+54 343 890-1234",
    fechaInicio: "2023-08-20"
  }
]

export const rms: Record<string, RM[]> = {
  a1: [
    { ejercicio: "Back Squat", kg: 75, fecha: "2025-05-10" },
    { ejercicio: "Deadlift", kg: 90, fecha: "2025-05-10" },
    { ejercicio: "Clean & Jerk", kg: 55, fecha: "2025-04-15" },
    { ejercicio: "Snatch", kg: 42, fecha: "2025-04-15" },
    { ejercicio: "Bench Press", kg: 52, fecha: "2025-03-20" },
    { ejercicio: "Thruster", kg: 40, fecha: "2025-05-01" },
    { ejercicio: "Press", kg: 38, fecha: "2025-03-20" },
  ],
  a2: [
    { ejercicio: "Back Squat", kg: 120, fecha: "2025-05-08" },
    { ejercicio: "Deadlift", kg: 150, fecha: "2025-05-08" },
    { ejercicio: "Clean & Jerk", kg: 90, fecha: "2025-04-10" },
    { ejercicio: "Snatch", kg: 70, fecha: "2025-04-10" },
    { ejercicio: "Bench Press", kg: 95, fecha: "2025-03-15" },
    { ejercicio: "Thruster", kg: 70, fecha: "2025-05-01" },
    { ejercicio: "Press", kg: 65, fecha: "2025-03-15" },
  ]
}

export const comentarios: Comentario[] = [
  {
    id: "c1",
    alumnoId: "a1",
    autor: "Martina Gómez",
    rol: "alumno",
    semana: 1,
    dia: "Lunes",
    texto: "Rodi, el Fran me mató... llegué muy fatigada al WOD",
    fecha: "2025-06-02T10:30:00"
  },
  {
    id: "c2",
    alumnoId: "a1",
    autor: "Rodrigo Peralta",
    rol: "coach",
    semana: 1,
    dia: "Lunes",
    texto: "Normal para semana 1, es para testear! La próxima bajamos carga. Descansá bien esta noche",
    fecha: "2025-06-02T11:15:00"
  },
  {
    id: "c3",
    alumnoId: "a1",
    autor: "Martina Gómez",
    rol: "alumno",
    semana: 1,
    dia: "Jueves",
    texto: "El deadlift al 80% me costó en la última serie, bajo el % la próxima semana?",
    fecha: "2025-06-05T09:00:00"
  },
  {
    id: "c4",
    alumnoId: "a2",
    autor: "Lucas Fernández",
    rol: "alumno",
    semana: 1,
    dia: "Sábado",
    texto: "El WOD competencia estuvo fuego! Lo repetimos en semana 4?",
    fecha: "2025-06-07T12:00:00"
  }
]

const semana1Dias: Dia[] = [
  {
    nombre: "Lunes",
    descanso: false,
    contenido: "**Back Squat 5x5 @ 75% 1RM**\nRest 3 min entre series\n\n**WOD: 'Fran'**\n21-15-9\n- Thrusters 43kg\n- Pull-ups",
    links: [{ titulo: "Técnica Back Squat", url: "https://youtube.com/watch?v=ultGDtIqzjo" }]
  },
  {
    nombre: "Martes",
    descanso: false,
    contenido: "**Técnica: Snatch desde el piso**\n5x3 @ 60% 1RM\n\n**Metcon: AMRAP 12'**\n- 10 Burpees\n- 15 KB Swings 24kg\n- 20 Box Jumps 60cm",
    links: [{ titulo: "Snatch progresión", url: "https://youtube.com/watch?v=9xQp2sldyts" }]
  },
  {
    nombre: "Miércoles",
    descanso: true,
    contenido: "Descanso activo — Movilidad 30 min",
    links: []
  },
  {
    nombre: "Jueves",
    descanso: false,
    contenido: "**Deadlift 4x4 @ 80% 1RM**\nRest 3 min\n\n**WOD: 5 RFT**\n- 10 Deadlifts 80kg\n- 30 Double Unders",
    links: []
  },
  {
    nombre: "Viernes",
    descanso: false,
    contenido: "**Clean & Jerk — Técnica**\n5x2 @ 65%\n\n**WOD: Partner Chipper**\n100 Wall Balls / 80 Sit-ups / 60 KB Swings / 40 Pull-ups / 20 T2B",
    links: [{ titulo: "Clean & Jerk tips", url: "https://youtube.com/watch?v=Yau-mlPtfWo" }]
  },
  {
    nombre: "Sábado",
    descanso: false,
    contenido: "**WOD COMPETENCIA — Open Style**\n20 minutos / Score por rondas completadas\n\n*Detalles el día del entrenamiento*",
    links: []
  }
]

function generateSimpleDias(weekNum: number): Dia[] {
  return [
    {
      nombre: "Lunes",
      descanso: false,
      contenido: `**Fuerza Principal**\nBack Squat 5x5 @ ${70 + weekNum}% 1RM\n\n**WOD del día**\nAMRAP 15 min`,
      links: []
    },
    {
      nombre: "Martes",
      descanso: false,
      contenido: `**Técnica Olímpica**\nSnatch o Clean variations\n\n**Metcon**\n3 RFT`,
      links: []
    },
    {
      nombre: "Miércoles",
      descanso: true,
      contenido: "Descanso activo — Movilidad y recuperación",
      links: []
    },
    {
      nombre: "Jueves",
      descanso: false,
      contenido: `**Deadlift / Press**\n4x4 @ ${75 + weekNum}%\n\n**WOD**\nFor Time`,
      links: []
    },
    {
      nombre: "Viernes",
      descanso: false,
      contenido: `**Técnica y Skill**\nGymnastics work\n\n**Chipper WOD**`,
      links: []
    },
    {
      nombre: "Sábado",
      descanso: false,
      contenido: `**WOD Competencia Semana ${weekNum}**\nOpen-style workout`,
      links: []
    }
  ]
}

const weekTitles = [
  "Semana 1 — Test de Fuerza",
  "Semana 2 — Acumulación",
  "Semana 3 — Intensidad",
  "Semana 4 — Deload",
  "Semana 5 — Potencia",
  "Semana 6 — Resistencia",
  "Semana 7 — Técnica",
  "Semana 8 — Volumen",
  "Semana 9 — Intensidad Alta",
  "Semana 10 — Competición",
  "Semana 11 — Recuperación",
  "Semana 12 — Test Final"
]

function getWeekStartDate(weekNum: number): string {
  const baseDate = new Date("2025-06-02")
  baseDate.setDate(baseDate.getDate() + (weekNum - 1) * 7)
  return baseDate.toISOString().split("T")[0]
}

export const semanas: SemanaCard[] = Array.from({ length: 12 }, (_, i) => {
  const weekNum = i + 1
  let estado: SemanaCard["estado"] = "no-iniciada"
  if (weekNum < 3) estado = "completada"
  else if (weekNum === 3) estado = "en-curso"
  
  return {
    id: `s${weekNum}`,
    semana: weekNum,
    titulo: weekTitles[i],
    estado,
    fechaInicio: getWeekStartDate(weekNum),
    dias: weekNum === 1 ? semana1Dias : generateSimpleDias(weekNum)
  }
})

export const pagos: Pago[] = [
  {
    id: "p1",
    alumnoId: "a1",
    fecha: "2025-05-20",
    monto: 35000,
    estado: "pagado",
    metodo: "Transferencia"
  },
  {
    id: "p2",
    alumnoId: "a1",
    fecha: "2025-04-20",
    monto: 35000,
    estado: "pagado",
    metodo: "Efectivo"
  },
  {
    id: "p3",
    alumnoId: "a1",
    fecha: "2025-03-20",
    monto: 32000,
    estado: "pagado",
    metodo: "Transferencia"
  },
  {
    id: "p4",
    alumnoId: "a2",
    fecha: "2025-05-15",
    monto: 35000,
    estado: "pagado",
    metodo: "Transferencia"
  },
  {
    id: "p5",
    alumnoId: "a2",
    fecha: "2025-04-15",
    monto: 35000,
    estado: "pagado",
    metodo: "MercadoPago"
  },
  {
    id: "p6",
    alumnoId: "a4",
    fecha: "2025-05-28",
    monto: 35000,
    estado: "pagado",
    metodo: "Transferencia"
  }
]

export const ejerciciosDisponibles = [
  "Back Squat",
  "Front Squat",
  "Deadlift",
  "Clean & Jerk",
  "Snatch",
  "Bench Press",
  "Thruster",
  "Press",
  "Push Press",
  "Power Clean",
  "Hang Clean",
  "Overhead Squat"
]

export const credentials = [
  { email: "rodi@crossfit.com", password: "coach123", role: "coach" as const, userId: "coach-1" },
  { email: "martina@gmail.com", password: "alumna123", role: "alumno" as const, userId: "a1" },
  { email: "lucas@gmail.com", password: "alumno123", role: "alumno" as const, userId: "a2" }
]
