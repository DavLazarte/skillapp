import { cn } from "@/lib/utils"

type Estado = "activo" | "pausado" | "inactivo" | "pagado" | "pendiente" | "vencido" | "completada" | "en-curso" | "no-iniciada"

const statusConfig: Record<Estado, { label: string; className: string }> = {
  activo: {
    label: "Activo",
    className: "bg-success/20 text-success border-success/30"
  },
  pausado: {
    label: "Pausado",
    className: "bg-warning/20 text-warning border-warning/30"
  },
  inactivo: {
    label: "Inactivo",
    className: "bg-destructive/20 text-destructive border-destructive/30"
  },
  pagado: {
    label: "Pagado",
    className: "bg-success/20 text-success border-success/30"
  },
  pendiente: {
    label: "Pendiente",
    className: "bg-warning/20 text-warning border-warning/30"
  },
  vencido: {
    label: "Vencido",
    className: "bg-destructive/20 text-destructive border-destructive/30"
  },
  completada: {
    label: "Completada",
    className: "bg-success/20 text-success border-success/30"
  },
  "en-curso": {
    label: "En curso",
    className: "bg-primary/20 text-primary border-primary/30"
  },
  "no-iniciada": {
    label: "No iniciada",
    className: "bg-muted text-muted-foreground border-muted-foreground/30"
  }
}

interface StatusBadgeProps {
  status: Estado
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
