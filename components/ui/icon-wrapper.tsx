import type { LucideIcon } from "lucide-react"

interface IconWrapperProps {
  icon: LucideIcon
  color: string
}

export function IconWrapper({ icon: Icon, color }: IconWrapperProps) {
  return <Icon className={`h-4 w-4 ${color}`} />
}
