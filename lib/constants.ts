export const CATEGORIAS_RM = {
  Fuerza: [
    "Back Squat",
    "Front Squat",
    "Deadlift",
    "Press Estricto",
    "Push Press"
  ],
  Weightlifting: [
    "Snatch",
    "Clean",
    "Clean & Jerk"
  ],
  Capacidades: [
    "Toes to Bar",
    "Pull Ups",
    "Chest to Bar",
    "Ring Muscle Up",
    "Bar Muscle Up",
    "Handstand Push Up",
    "DU",
    "Strict Hspu",
    "Strict Pull Ups",
    "Strict Chest to Bar",
    "Burpees",
    "Box Jump Over",
    "Rope Climb",
    "Legless Rope Climb",
    "Otro"
  ],
  Running: [
    "5km",
    "1k"
  ]
}

// Flat list for easy matching
export const TODOS_LOS_EJERCICIOS = Object.values(CATEGORIAS_RM).flat().filter(e => e !== "Otro")

// For the parser, we sort them by length descending so that "Clean & Jerk" matches before "Clean"
export const EJERCICIOS_PARSER_SORTED = [...TODOS_LOS_EJERCICIOS].sort((a, b) => b.length - a.length)

// Helper to determine if an exercise is tracked in reps
export const isCapacidad = (ejercicio: string) => {
  if (!ejercicio) return false
  return CATEGORIAS_RM.Capacidades.includes(ejercicio) || ejercicio.endsWith(" (Tiempo)") || ejercicio.endsWith(" (Reps)")
}
