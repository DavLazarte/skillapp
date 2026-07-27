"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Mail, Shield, Layers, User, Check, Loader2 } from "lucide-react"
import { ChangePasswordForm } from "@/components/student/change-password-form"
import { updateCoachProfile } from "@/lib/actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function CoachProfileView({ coach, planesDisponibles }: any) {
  const [nombre, setNombre] = useState(coach.nombre || "")
  const [email, setEmail] = useState(coach.email || "")
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>(
    coach.planes?.map((p: any) => p.tipoPlan.id) || []
  )
  const [isSaving, setIsSaving] = useState(false)

  const togglePlan = (planId: string) => {
    setSelectedPlanIds(current =>
      current.includes(planId)
        ? current.filter(id => id !== planId)
        : [...current, planId]
    )
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim() || !email.trim()) {
      toast.error("El nombre y email son obligatorios")
      return
    }

    setIsSaving(true)
    const result = await updateCoachProfile(coach.id, {
      nombre: nombre.trim(),
      email: email.trim(),
      planIds: selectedPlanIds
    })
    setIsSaving(false)

    if (result.success) {
      toast.success("Perfil actualizado exitosamente")
      // Update local storage user details if they changed
      const stored = localStorage.getItem("crossfit-user")
      if (stored) {
        try {
          const user = JSON.parse(stored)
          user.nombre = nombre.trim()
          user.email = email.trim()
          localStorage.setItem("crossfit-user", JSON.stringify(user))
        } catch (e) {
          console.error("Error updating local storage user", e)
        }
      }
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi Perfil Coach</h1>
        <p className="text-muted-foreground mt-1">
          Gestioná tus datos de acceso, contraseña y el plan que entrenás
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Info */}
        <Card className="md:col-span-2 border-border">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Datos Personales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nombre completo</Label>
                  <Input 
                    value={nombre} 
                    onChange={(e) => setNombre(e.target.value)} 
                    className="bg-secondary/30"
                    placeholder="Tu nombre"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email de acceso</Label>
                  <Input 
                    type="email"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="bg-secondary/30"
                    placeholder="tuemail@gimnasio.com"
                  />
                </div>
              </div>

              {/* Plans Selection */}
              <div className="space-y-3 pt-2">
                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" /> Planes que Entrenás
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Seleccioná los planes de entrenamiento que realizás para ver tu ficha diaria en el Dashboard principal.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {planesDisponibles.map((plan: any) => {
                    const isChecked = selectedPlanIds.includes(plan.id)
                    return (
                      <label 
                        key={plan.id} 
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                          isChecked
                            ? "border-primary/50 bg-primary/5 shadow-sm"
                            : "border-border bg-secondary/10 hover:bg-secondary/20"
                        )}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => togglePlan(plan.id)}
                        />
                        <div className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: plan.color }} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium leading-none truncate">{plan.nombre}</p>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" /> Guardar Perfil
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Password Form */}
        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Shield className="w-4 h-4" /> Rol Administrativo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl">
                <p className="text-xs font-bold text-primary uppercase tracking-wide">Acceso Total (Super Admin)</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tu cuenta posee permisos de Coach para configurar planes, alumnos, registrar cobros y programar entrenamientos.
                </p>
              </div>
            </CardContent>
          </Card>

          <ChangePasswordForm userId={coach.id} />
        </div>
      </div>
    </div>
  )
}
