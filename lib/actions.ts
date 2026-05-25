"use server"

import { prisma } from "./db"
import { revalidatePath } from "next/cache"

// ─── ALUMNOS ─────────────────────────────────────────────────────────────────

export async function createAlumno(data: {
  nombre: string
  email: string
  telefono: string
  cuota: number
  estado: string
  vencimiento?: string
  planIds?: string[]
}) {
  const avatar = data.nombre.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  try {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: "alumno123",
        role: "alumno",
        nombre: data.nombre,
        avatar,
        estado: data.estado,
        cuota: data.cuota,
        vencimiento: data.vencimiento ? new Date(data.vencimiento) : null,
        telefono: data.telefono,
        fechaInicio: new Date(),
      },
    })
    if (data.planIds?.length) {
      await prisma.alumnoPlan.createMany({
        data: data.planIds.map(tipoPlanId => ({ userId: user.id, tipoPlanId })),
      })
    }
    revalidatePath("/coach/alumnos")
    return { success: true, id: user.id }
  } catch (e: any) {
    if (e.code === "P2002") return { success: false, error: "Ya existe un alumno con ese email" }
    return { success: false, error: "Error al crear el alumno" }
  }
}

export async function updateAlumno(id: string, data: {
  nombre?: string
  email?: string
  telefono?: string
  cuota?: number
  estado?: string
  vencimiento?: string | null
  planIds?: string[]
}) {
  try {
    await prisma.user.update({
      where: { id },
      data: {
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        cuota: data.cuota,
        estado: data.estado,
        vencimiento: data.vencimiento === null ? null : data.vencimiento ? new Date(data.vencimiento) : undefined,
      },
    })
    if (data.planIds !== undefined) {
      await prisma.alumnoPlan.deleteMany({ where: { userId: id } })
      if (data.planIds.length > 0) {
        await prisma.alumnoPlan.createMany({
          data: data.planIds.map(tipoPlanId => ({ userId: id, tipoPlanId })),
        })
      }
    }
    revalidatePath("/coach/alumnos")
    revalidatePath(`/coach/alumnos/${id}`)
    return { success: true }
  } catch {
    return { success: false, error: "Error al actualizar el alumno" }
  }
}

export async function deleteAlumno(id: string) {
  try {
    await prisma.user.delete({ where: { id } })
    revalidatePath("/coach/alumnos")
    return { success: true }
  } catch {
    return { success: false, error: "Error al eliminar el alumno" }
  }
}

// ─── TIPOS DE PLAN ───────────────────────────────────────────────────────────

export async function createTipoPlan(data: { nombre: string; descripcion?: string; color: string }) {
  try {
    await prisma.tipoPlan.create({ data })
    revalidatePath("/coach/planes")
    return { success: true }
  } catch {
    return { success: false, error: "Error al crear el plan" }
  }
}

export async function updateTipoPlan(id: string, data: { nombre?: string; descripcion?: string; color?: string }) {
  try {
    await prisma.tipoPlan.update({ where: { id }, data })
    revalidatePath("/coach/planes")
    revalidatePath("/coach/planificacion")
    return { success: true }
  } catch {
    return { success: false, error: "Error al actualizar el plan" }
  }
}

export async function deleteTipoPlan(id: string) {
  try {
    await prisma.tipoPlan.delete({ where: { id } })
    revalidatePath("/coach/planes")
    return { success: true }
  } catch {
    return { success: false, error: "Error al eliminar el plan" }
  }
}

// ─── SEMANAS / KANBAN ────────────────────────────────────────────────────────

export async function createSemana(data: {
  titulo: string
  tipoPlanId: string
  fechaInicio: string
}) {
  try {
    const count = await prisma.semana.count({ where: { tipoPlanId: data.tipoPlanId } })
    const semana = await prisma.semana.create({
      data: {
        titulo: data.titulo,
        numero: count + 1,
        estado: "planificacion",
        fechaInicio: new Date(data.fechaInicio),
        tipoPlanId: data.tipoPlanId,
      },
    })
    // Crear 6 días vacíos
    const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
    await prisma.dia.createMany({
      data: dias.map((nombre, orden) => ({
        semanaId: semana.id,
        nombre,
        descanso: nombre === "Miércoles",
        contenido: "",
        orden,
      })),
    })
    revalidatePath("/coach/planificacion")
    return { success: true, id: semana.id }
  } catch {
    return { success: false, error: "Error al crear la semana" }
  }
}

export async function updateSemanaEstado(id: string, estado: string) {
  try {
    await prisma.semana.update({ where: { id }, data: { estado } })
    revalidatePath("/coach/planificacion")
    revalidatePath(`/alumno`)
    return { success: true }
  } catch {
    return { success: false, error: "Error al actualizar el estado" }
  }
}

export async function updateSemana(id: string, data: { titulo?: string; fechaInicio?: string }) {
  try {
    await prisma.semana.update({
      where: { id },
      data: {
        titulo: data.titulo,
        fechaInicio: data.fechaInicio ? new Date(data.fechaInicio) : undefined,
      },
    })
    revalidatePath("/coach/planificacion")
    return { success: true }
  } catch {
    return { success: false, error: "Error al actualizar la semana" }
  }
}

export async function deleteSemana(id: string) {
  try {
    await prisma.semana.delete({ where: { id } })
    revalidatePath("/coach/planificacion")
    return { success: true }
  } catch {
    return { success: false, error: "Error al eliminar la semana" }
  }
}

export async function updateDia(id: string, data: { contenido?: string; descanso?: boolean }) {
  try {
    await prisma.dia.update({ where: { id }, data })
    revalidatePath("/coach/planificacion")
    return { success: true }
  } catch {
    return { success: false, error: "Error al actualizar el día" }
  }
}

export async function addLinkToDia(diaId: string, titulo: string, url: string) {
  try {
    const link = await prisma.link.create({ data: { diaId, titulo, url } })
    revalidatePath("/coach/planificacion")
    return { success: true, link }
  } catch {
    return { success: false, error: "Error al agregar el link" }
  }
}

export async function deleteLinkFromDia(id: string) {
  try {
    await prisma.link.delete({ where: { id } })
    revalidatePath("/coach/planificacion")
    return { success: true }
  } catch {
    return { success: false, error: "Error al eliminar el link" }
  }
}

// ─── PAGOS ───────────────────────────────────────────────────────────────────

export async function createPago(data: {
  userId: string
  monto: number
  metodo: string
  estado: string
  fecha?: string
  nota?: string
}) {
  try {
    await prisma.pago.create({
      data: {
        userId: data.userId,
        monto: data.monto,
        metodo: data.metodo,
        estado: data.estado,
        fecha: data.fecha ? new Date(data.fecha) : new Date(),
        nota: data.nota,
      },
    })
    revalidatePath("/coach/pagos")
    return { success: true }
  } catch {
    return { success: false, error: "Error al registrar el pago" }
  }
}

export async function updatePagoEstado(id: string, estado: string) {
  try {
    await prisma.pago.update({ where: { id }, data: { estado } })
    revalidatePath("/coach/pagos")
    return { success: true }
  } catch {
    return { success: false, error: "Error al actualizar el pago" }
  }
}

export async function deletePago(id: string) {
  try {
    await prisma.pago.delete({ where: { id } })
    revalidatePath("/coach/pagos")
    return { success: true }
  } catch {
    return { success: false, error: "Error al eliminar el pago" }
  }
}

// ─── ALUMNO (workout feedback) ───────────────────────────────────────────────

export async function toggleWorkoutCompletion(userId: string, diaId: string, completado: boolean) {
  try {
    await prisma.asistencia.upsert({
      where: { userId_diaId: { userId, diaId } },
      update: { completado },
      create: { userId, diaId, completado },
    })
    revalidatePath(`/alumno/${userId}`)
    return { success: true }
  } catch {
    return { success: false, error: "No se pudo actualizar el estado" }
  }
}

export async function postComment(userId: string, semanaNumero: number, diaNombre: string, texto: string, rol: string) {
  try {
    await prisma.comentario.create({ data: { userId, semanaNumero, diaNombre, texto, rol } })
    revalidatePath(`/alumno/${userId}`)
    return { success: true }
  } catch {
    return { success: false, error: "No se pudo enviar el comentario" }
  }
}

export async function addRM(userId: string, ejercicio: string, kg: number) {
  try {
    await prisma.rM.create({ data: { userId, ejercicio, kg } })
    revalidatePath(`/alumno/${userId}/rms`)
    return { success: true }
  } catch {
    return { success: false, error: "No se pudo registrar el RM" }
  }
}

export async function updateRM(id: string, userId: string, data: { ejercicio: string, kg: number }) {
  try {
    await prisma.rM.update({
      where: { id },
      data: { ejercicio: data.ejercicio, kg: data.kg }
    })
    revalidatePath(`/alumno/${userId}/rms`)
    return { success: true }
  } catch {
    return { success: false, error: "No se pudo actualizar el RM" }
  }
}

export async function deleteRM(id: string, userId: string) {
  try {
    await prisma.rM.delete({ where: { id } })
    revalidatePath(`/alumno/${userId}/rms`)
    return { success: true }
  } catch {
    return { success: false, error: "No se pudo eliminar el RM" }
  }
}

export async function loginAction(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || user.password !== password) return { success: false, error: "Credenciales inválidas" }
    return { success: true, user: { id: user.id, email: user.email, role: user.role, nombre: user.nombre, avatar: user.avatar } }
  } catch {
    return { success: false, error: "Error al iniciar sesión" }
  }
}

export async function changePassword(userId: string, newPassword: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { password: newPassword },
    })
    return { success: true }
  } catch {
    return { success: false, error: "No se pudo actualizar la contraseña" }
  }
}
