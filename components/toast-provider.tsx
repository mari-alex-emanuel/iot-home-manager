"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { CustomToast } from "./custom-toast"

type ToastType = {
  id: string
  title: string
  description?: string
  duration?: number
  variant?: "default" | "success" | "error" | "warning"
}

interface ToastContextType {
  showToast: (toast: Omit<ToastType, "id">) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

let toastId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastType[]>([])

  const showToast = useCallback((toast: Omit<ToastType, "id">) => {
    const id = `toast-${toastId++}`
    setToasts((prev) => [...prev, { ...toast, id }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map((toast) => (
        <CustomToast
          key={toast.id}
          title={toast.title}
          description={toast.description}
          duration={toast.duration}
          variant={toast.variant}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  )
}

export function useCustomToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useCustomToast must be used within a ToastProvider")
  }
  return context
}
