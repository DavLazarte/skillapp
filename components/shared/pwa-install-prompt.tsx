"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Download, Smartphone } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    // Don't show if already installed or dismissed recently
    const dismissed = localStorage.getItem("pwa-install-dismissed")
    if (dismissed) {
      const dismissedAt = parseInt(dismissed)
      const threeDays = 1000 * 60 * 60 * 24 * 3
      if (Date.now() - dismissedAt < threeDays) return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Small delay so it doesn't pop up immediately on page load
      setTimeout(() => setShowBanner(true), 3000)
    }

    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    setIsInstalling(true)
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === "accepted") {
      setShowBanner(false)
      setDeferredPrompt(null)
    }
    setIsInstalling(false)
  }

  const handleDismiss = () => {
    localStorage.setItem("pwa-install-dismissed", Date.now().toString())
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-card border border-border rounded-2xl shadow-2xl p-4 flex items-center gap-4">
        {/* Icon */}
        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-black">
          <img src="/iconlogo.jpg" alt="SkillFitness" className="w-full h-full object-cover" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm">Instalá SkillFitness</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
            Accedé más rápido desde tu pantalla de inicio, sin abrir el navegador.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Button
              size="sm"
              className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
              onClick={handleInstall}
              disabled={isInstalling}
            >
              {isInstalling ? (
                <span className="w-3 h-3 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
              ) : (
                <Download className="w-3 h-3" />
              )}
              {isInstalling ? "Instalando..." : "Instalar app"}
            </Button>
            <button
              onClick={handleDismiss}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Ahora no
            </button>
          </div>
        </div>

        {/* Close */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
