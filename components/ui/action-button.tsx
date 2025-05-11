"use client"

import { Button } from "@/components/ui/button"
import type { LucideIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ActionButtonProps {
  onClick: () => void
  icon: LucideIcon
  label: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function ActionButton({ onClick, icon: Icon, label, variant = "outline" }: ActionButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={variant} size="icon" onClick={onClick}>
            <Icon className="h-4 w-4" />
            <span className="sr-only">{label}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
