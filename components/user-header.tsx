"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"

export function UserHeader() {
  const { authState, logout } = useAuth()

  if (!authState.isAuthenticated) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <div className="hidden md:flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-sm">
        <User className="h-4 w-4" />
        <span>{authState.user?.name}</span>
        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
          {authState.user?.role === "admin" ? "Admin" : "User"}
        </span>
      </div>
      <Button variant="ghost" size="icon" onClick={logout} title="Deconectare" aria-label="Deconectare">
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  )
}
