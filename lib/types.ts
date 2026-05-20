export type UserRole = "coach" | "alumno"

export interface Coach {
  id: string
  nombre: string
  email: string
  avatar: string
  gimnasio: string
}

export interface Alumno {
  id: string
  nombre: string
  email: string
  avatar: string
  estado: "activo" | "pausado" | "inactivo"
  cuota: number
  vencimiento: string | null
  telefono: string
  fechaInicio: string
}

export interface RM {
  ejercicio: string
  kg: number
  fecha: string
}

export interface Comentario {
  id: string
  alumnoId: string
  autor: string
  rol: "coach" | "alumno"
  semana: number
  dia: string
  texto: string
  fecha: string
}

export interface Link {
  titulo: string
  url: string
}

export interface Dia {
  nombre: "Lunes" | "Martes" | "Miércoles" | "Jueves" | "Viernes" | "Sábado"
  descanso: boolean
  contenido: string
  links: Link[]
}

export interface SemanaCard {
  id: string
  semana: number
  titulo: string
  estado: "no-iniciada" | "en-curso" | "completada"
  fechaInicio: string
  dias: Dia[]
}

export interface Pago {
  id: string
  alumnoId: string
  fecha: string
  monto: number
  estado: "pagado" | "pendiente" | "vencido"
  metodo: string
}

export interface User {
  id: string
  email: string
  role: UserRole
  nombre: string
  avatar: string
}
