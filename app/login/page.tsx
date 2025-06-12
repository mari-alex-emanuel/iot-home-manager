"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useCustomToast } from "@/components/toast-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Lock } from "lucide-react"

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const { showToast } = useCustomToast()

  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCredentials((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await login(credentials)

      if (result.success) {
        showToast({
          title: "Autentificare reușită",
          description: "Bine ai venit în aplicația Smart Home IoT Manager!",
          variant: "success",
        })

        router.push("/")
      } else {
        showToast({
          title: "Eroare de autentificare",
          description: result.message,
          variant: "error",
        })
      }
    } catch (error) {
      showToast({
        title: "Eroare",
        description: "A apărut o eroare neașteptată. Încercați din nou.",
        variant: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <Home className="h-6 w-6" />
            <CardTitle className="text-2xl">Smart Home IoT Manager</CardTitle>
          </div>
          <CardDescription className="text-center">Autentifică-te pentru a accesa aplicația</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Nume utilizator
              </label>
              <Input id="username" name="username" value={credentials.username} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Parolă
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={credentials.password}
                onChange={handleChange}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Se autentifică...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Autentificare
                </span>
              )}
            </Button>
          </CardFooter>
        </form>
        <div className="p-4 text-center text-sm text-muted-foreground">
          <p>Credențiale de test:</p>
          <p>Admin: admin / admin123</p>
          <p>User: user / user123</p>
        </div>
      </Card>
    </div>
  )
}
