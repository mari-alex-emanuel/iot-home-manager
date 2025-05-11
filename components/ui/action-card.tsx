import type React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ActionCardProps extends React.ComponentProps<typeof Card> {
  children: React.ReactNode
  footer: React.ReactNode
}

export function ActionCard({ children, footer, className, ...props }: ActionCardProps) {
  return (
    <Card className={cn("group relative overflow-hidden", className)} {...props}>
      {children}
      <div className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm transition-transform translate-y-full group-hover:translate-y-0">
        <CardFooter className="flex justify-end space-x-2 p-2">{footer}</CardFooter>
      </div>
    </Card>
  )
}

export { CardContent, CardDescription, CardHeader, CardTitle }
