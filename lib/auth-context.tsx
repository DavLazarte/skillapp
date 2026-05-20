"use client"

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react"
import { User, UserRole } from "./types"
import { loginAction } from "./actions"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; redirectTo?: string; error?: string }>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("crossfit-user")
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem("crossfit-user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginAction(email, password)

    if (!result.success || !result.user) {
      return { success: false, error: result.error || "Credenciales inválidas" }
    }

    const userData = result.user as User
    setUser(userData)
    localStorage.setItem("crossfit-user", JSON.stringify(userData))

    const redirectTo = userData.role === "coach" 
      ? "/coach" 
      : `/alumno/${userData.id}`

    return { success: true, redirectTo }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem("crossfit-user")
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
