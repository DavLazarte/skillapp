import { ConfigForm } from "@/components/coach/config-form"
import { getAppConfig } from "@/lib/actions"

export const dynamic = "force-dynamic"

export default async function ConfigPage() {
  const config = await getAppConfig()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground mt-1">
          Ajustes de tu cuenta y gimnasio
        </p>
      </div>

      <ConfigForm initialConfig={config} />
    </div>
  )
}
