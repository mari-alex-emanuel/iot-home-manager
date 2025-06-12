"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { AmortizationSummary as AmortizationSummaryType } from "@/lib/types"

interface AmortizationSummaryProps {
  summary: AmortizationSummaryType
}

export function AmortizationSummary({ summary }: AmortizationSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Investiție totală</CardTitle>
          <CardDescription>Suma tuturor costurilor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalInvestment.toFixed(0)} RON</div>
          <p className="text-xs text-muted-foreground mt-1">{summary.totalDevices} dispozitive cu date de amortizare</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Economii lunare</CardTitle>
          <CardDescription>Total economii estimate lunar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalMonthlySavings.toFixed(0)} RON</div>
          <p className="text-xs text-muted-foreground mt-1">
            {(summary.totalMonthlySavings * 12).toFixed(0)} RON economii anuale
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Perioada medie de amortizare</CardTitle>
          <CardDescription>Media ponderată cu costul</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summary.averagePaybackPeriod > 0 ? `${Math.round(summary.averagePaybackPeriod)} luni` : "N/A"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {summary.averagePaybackPeriod > 0
              ? `${(summary.averagePaybackPeriod / 12).toFixed(1)} ani`
              : "Nu există date suficiente"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Dispozitive amortizate</CardTitle>
          <CardDescription>În perioada lor de viață</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summary.amortizedDevices} / {summary.totalDevices}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {summary.totalDevices > 0
              ? `${Math.round((summary.amortizedDevices / summary.totalDevices) * 100)}% din dispozitive`
              : "Nu există dispozitive"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
