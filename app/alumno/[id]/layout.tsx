"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter, useParams } from "next/navigation"
import { useEffect } from "react"
import { StudentSidebar } from "@/components/student/student-sidebar"
import { Loader2 } from "lucide-react"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/")
      } else if (user.role !== "alumno" || user.id !== params.id) {
        router.push("/")
      }
    }
  }, [user, isLoading, router, params.id])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || user.role !== "alumno" || user.id !== params.id) {
    return null
  }

  return (
    <div className="min-h-screen flex">
      <StudentSidebar />
      <main className="flex-1 min-w-0 p-4 lg:p-8">
        {children}
      </main>
    </div>
  )
}
