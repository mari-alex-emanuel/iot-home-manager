import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  status: "Online" | "Offline" | "Open" | "Closed"
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variant = status === "Online" || status === "Closed" ? "default" : "destructive"
  return <Badge variant={variant}>{status}</Badge>
}
