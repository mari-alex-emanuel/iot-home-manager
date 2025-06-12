import type { ReactNode } from "react"

interface PageHeaderProps {
  title?: string
  description?: string
  heading?: string
  text?: string
  action?: ReactNode
}

export function PageHeader({ title, description, heading, text, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title || heading}</h1>
        {(description || text) && <p className="text-muted-foreground">{description || text}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
