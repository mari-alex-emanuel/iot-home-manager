import type { ReactNode } from "react"

interface CardGridProps {
  children: ReactNode
}

export function CardGrid({ children }: CardGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 w-full">
      {children}
    </div>
  )
}
