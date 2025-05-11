"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"

interface CustomToastProps {
  title: string
  description?: string
  duration?: number
  variant?: "default" | "success" | "error" | "warning"
  onClose?: () => void
}

export function CustomToast({ title, description, duration = 5000, variant = "default", onClose }: CustomToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const startTime = Date.now()
    const endTime = startTime + duration

    const timer = setInterval(() => {
      const now = Date.now()
      const remaining = endTime - now
      const newProgress = (remaining / duration) * 100

      if (remaining <= 0) {
        clearInterval(timer)
        setIsVisible(false)
        if (onClose) onClose()
      } else {
        setProgress(newProgress)
      }
    }, 100)

    return () => clearInterval(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  const getBgColor = () => {
    switch (variant) {
      case "success":
        return "bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-800"
      case "error":
        return "bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-800"
      case "warning":
        return "bg-yellow-100 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-800"
      default:
        return "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
    }
  }

  const getTextColor = () => {
    switch (variant) {
      case "success":
        return "text-green-800 dark:text-green-200"
      case "error":
        return "text-red-800 dark:text-red-200"
      case "warning":
        return "text-yellow-800 dark:text-yellow-200"
      default:
        return "text-gray-800 dark:text-gray-200"
    }
  }

  const getProgressColor = () => {
    switch (variant) {
      case "success":
        return "bg-green-500"
      case "error":
        return "bg-red-500"
      case "warning":
        return "bg-yellow-500"
      default:
        return "bg-blue-500"
    }
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 max-w-md rounded-lg border shadow-lg ${getBgColor()} overflow-hidden`}
      role="alert"
    >
      <div className="p-4 pr-10">
        <h3 className={`font-medium ${getTextColor()}`}>{title}</h3>
        {description && <p className={`mt-1 text-sm ${getTextColor()} opacity-90`}>{description}</p>}
        <button
          className="absolute top-2 right-2 rounded-full p-1 hover:bg-black/10 dark:hover:bg-white/10"
          onClick={() => {
            setIsVisible(false)
            if (onClose) onClose()
          }}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
      <div className="h-1 w-full bg-gray-200 dark:bg-gray-700">
        <div className={`h-full ${getProgressColor()}`} style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  )
}
