"use client"

import type React from "react"

// Adapted from https://github.com/shadcn-ui/ui/blob/main/apps/www/registry/default/ui/use-toast.ts
import { useState, useCallback } from "react"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000

type ToasterToast = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type Toast = Omit<ToasterToast, "id">

type UseToastOptions = {
  duration?: number
}

export function useToast(options?: UseToastOptions) {
  const [toasts, setToasts] = useState<ToasterToast[]>([])

  const dismiss = useCallback((toastId?: string) => {
    setToasts((toasts) => {
      if (toastId) {
        return toasts.filter((toast) => toast.id !== toastId)
      }
      return []
    })
  }, [])

  const toast = useCallback(
    ({ ...props }: Toast) => {
      const id = genId()
      const duration = options?.duration || 5000

      setToasts((toasts) => {
        const newToasts = [{ id, ...props }, ...toasts.filter((toast) => toast.id !== id)].slice(0, TOAST_LIMIT)

        return newToasts
      })

      setTimeout(() => {
        dismiss(id)
      }, duration)

      return id
    },
    [dismiss, options?.duration],
  )

  return {
    toast,
    dismiss,
    toasts,
  }
}
