"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet } from "lucide-react"
import { saveAppConfig } from "@/lib/actions"
import { toast } from "sonner"

export function ConfigForm({ initialConfig }: { initialConfig: any }) {
  const [alias, setAlias] = useState(initialConfig?.aliasPago || "")
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    const result = await saveAppConfig({ ...initialConfig, aliasPago: alias })
    setIsLoading(false)
    if (result.success) {
      toast.success("Configuración guardada correctamente")
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          Pagos y Facturación
        </CardTitle>
        <CardDescription>
          Configurá los datos que ven los alumnos a la hora de pagar su cuota.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 max-w-md">
          <Label>Alias de MercadoPago / Banco</Label>
          <Input 
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="ej: mi.gimnasio.mp"
            className="bg-secondary/50"
          />
          <p className="text-xs text-muted-foreground">
            Este alias le aparecerá a los alumnos en un cartel rojo cuando estén a 3 días o menos de su fecha de vencimiento.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isLoading} className="bg-primary text-primary-foreground">
          {isLoading ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </CardContent>
    </Card>
  )
}
