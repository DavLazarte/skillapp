"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Loader2 } from "lucide-react"
import { changePassword } from "@/lib/actions"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ChangePasswordForm({ userId }: { userId: string }) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || !confirmPassword) return
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    setIsSubmitting(true)
    const result = await changePassword(userId, password)
    if (result.success) {
      toast.success("Contraseña actualizada exitosamente")
      setPassword("")
      setConfirmPassword("")
    } else {
      toast.error(result.error)
    }
    setIsSubmitting(false)
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Lock className="w-4 h-4" /> Cambiar Contraseña
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Nueva Contraseña</Label>
            <Input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-secondary/30 h-8 text-sm"
              placeholder="Ingresá la nueva clave"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Repetir Contraseña</Label>
            <Input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-secondary/30 h-8 text-sm"
              placeholder="Repetí la clave"
            />
          </div>
          <Button 
            type="submit" 
            size="sm" 
            disabled={isSubmitting || !password || !confirmPassword} 
            className="w-full"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Actualizar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
