"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { AvatarCircle } from "@/components/shared/avatar-circle"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  Plus, Search, DollarSign, TrendingUp, AlertCircle, Clock, Trash2, CheckCircle,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { createPago, updatePagoEstado, deletePago } from "@/lib/actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Alumno = { id: string; nombre: string; avatar: string | null; cuota: number | null }
type Pago = {
  id: string; monto: number; estado: string; metodo: string
  fecha: Date; nota: string | null
  user: Alumno
}

const METODOS = ["Efectivo", "Transferencia", "MercadoPago", "Tarjeta", "Otro"]

const ESTADO_STYLE: Record<string, string> = {
  pagado: "text-success bg-success/10",
  pendiente: "text-warning bg-warning/10",
  vencido: "text-destructive bg-destructive/10",
}

export function PagosView({ pagos, alumnos }: { pagos: Pago[]; alumnos: Alumno[] }) {
  const [search, setSearch] = useState("")
  const [filterEstado, setFilterEstado] = useState("todos")
  const [filterAlumno, setFilterAlumno] = useState("todos")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [form, setForm] = useState({
    userId: "",
    monto: "",
    metodo: "Transferencia",
    estado: "pagado",
    fecha: new Date().toISOString().split("T")[0],
    nota: "",
  })

  // Stats
  const totalCobrado = pagos.filter(p => p.estado === "pagado").reduce((s, p) => s + p.monto, 0)
  const totalPendiente = pagos.filter(p => p.estado === "pendiente").reduce((s, p) => s + p.monto, 0)
  const totalVencido = pagos.filter(p => p.estado === "vencido").reduce((s, p) => s + p.monto, 0)

  const filtered = pagos.filter(p => {
    const matchEstado = filterEstado === "todos" || p.estado === filterEstado
    const matchAlumno = filterAlumno === "todos" || p.user.id === filterAlumno
    const matchSearch = p.user.nombre.toLowerCase().includes(search.toLowerCase())
    return matchEstado && matchAlumno && matchSearch
  })

  const handleCreate = async () => {
    if (!form.userId || !form.monto) return
    setIsLoading(true)
    const r = await createPago({
      userId: form.userId,
      monto: parseFloat(form.monto),
      metodo: form.metodo,
      estado: form.estado,
      fecha: form.fecha,
      nota: form.nota || undefined,
    })
    setIsLoading(false)
    if (r.success) {
      toast.success("Pago registrado")
      setIsCreateOpen(false)
      setForm({ userId: "", monto: "", metodo: "Transferencia", estado: "pagado", fecha: new Date().toISOString().split("T")[0], nota: "" })
    } else {
      toast.error(r.error)
    }
  }

  const handleEstadoChange = async (id: string, estado: string) => {
    const r = await updatePagoEstado(id, estado)
    if (r.success) toast.success("Estado actualizado")
    else toast.error(r.error)
  }

  const handleDelete = async (id: string) => {
    const r = await deletePago(id)
    if (r.success) toast.success("Pago eliminado")
    else toast.error(r.error)
  }

  const fmt = (n: number) => `$${n.toLocaleString("es-AR")}`

  // Auto-fill cuota when alumno is selected
  const handleAlumnoSelect = (userId: string) => {
    const alumno = alumnos.find(a => a.id === userId)
    setForm(f => ({ ...f, userId, monto: alumno?.cuota?.toString() ?? "" }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Pagos</h1>
          <p className="text-muted-foreground mt-1">Control de cuotas y cobros</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" /> Registrar Pago
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle>Registrar nuevo pago</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Alumno *</Label>
                <Select value={form.userId} onValueChange={handleAlumnoSelect}>
                  <SelectTrigger className="bg-secondary/50"><SelectValue placeholder="Seleccionar alumno..." /></SelectTrigger>
                  <SelectContent>
                    {alumnos.map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Monto (ARS) *</Label>
                  <Input type="number" value={form.monto} onChange={e => setForm(f => ({ ...f, monto: e.target.value }))}
                    placeholder="35000" className="bg-secondary/50" />
                </div>
                <div className="space-y-1.5">
                  <Label>Fecha</Label>
                  <Input type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                    className="bg-secondary/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Método</Label>
                  <Select value={form.metodo} onValueChange={v => setForm(f => ({ ...f, metodo: v }))}>
                    <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {METODOS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Estado</Label>
                  <Select value={form.estado} onValueChange={v => setForm(f => ({ ...f, estado: v }))}>
                    <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pagado">Pagado</SelectItem>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="vencido">Vencido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Nota (opcional)</Label>
                <Input value={form.nota} onChange={e => setForm(f => ({ ...f, nota: e.target.value }))}
                  placeholder="ej. Mes de junio" className="bg-secondary/50" />
              </div>
              <Button onClick={handleCreate} disabled={!form.userId || !form.monto || isLoading} className="w-full">
                {isLoading ? "Guardando..." : "Registrar pago"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total cobrado", value: fmt(totalCobrado), icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
          { label: "Pendiente", value: fmt(totalPendiente), icon: Clock, color: "text-warning", bg: "bg-warning/10" },
          { label: "Vencido", value: fmt(totalVencido), icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
        ].map(s => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", s.bg)}>
                <s.icon className={cn("w-5 h-5", s.color)} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar alumno..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-secondary/50" />
        </div>
        <Select value={filterAlumno} onValueChange={setFilterAlumno}>
          <SelectTrigger className="w-44 bg-secondary/50"><SelectValue placeholder="Alumno" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los alumnos</SelectItem>
            {alumnos.map(a => <SelectItem key={a.id} value={a.id}>{a.nombre}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterEstado} onValueChange={setFilterEstado}>
          <SelectTrigger className="w-36 bg-secondary/50"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pagado">Pagados</SelectItem>
            <SelectItem value="pendiente">Pendientes</SelectItem>
            <SelectItem value="vencido">Vencidos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="bg-card border-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p>No hay pagos que coincidan con los filtros</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(pago => (
              <div key={pago.id} className="flex items-center gap-4 p-4 hover:bg-secondary/20 transition-colors group">
                <AvatarCircle initials={pago.user.avatar ?? "?"} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{pago.user.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(pago.fecha), "d 'de' MMMM yyyy", { locale: es })}
                    {pago.nota && ` · ${pago.nota}`}
                  </p>
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-secondary/50 text-muted-foreground">
                  {pago.metodo}
                </span>
                <span className="font-bold text-base">{fmt(pago.monto)}</span>
                <div className="flex items-center gap-2">
                  <Select value={pago.estado} onValueChange={v => handleEstadoChange(pago.id, v)}>
                    <SelectTrigger className={cn("w-28 h-7 text-xs border-0 font-semibold", ESTADO_STYLE[pago.estado])}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pagado">Pagado</SelectItem>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="vencido">Vencido</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                    onClick={() => handleDelete(pago.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
