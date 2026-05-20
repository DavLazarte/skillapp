"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { CoachSidebar } from "@/components/coach/coach-sidebar"
import { Loader2 } from "lucide-react"

export default function CoachLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "coach")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || user.role !== "coach") {
    return null
  }

  return (
    <div className="min-h-screen flex">
      <CoachSidebar />
      <main className="flex-1 min-w-0 p-4 lg:p-8">
        {children}
      </main>
    </div>
  )
}
