"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSmartHome } from "@/contexts/smart-home-context"
import { AmortizationCalculator } from "./amortization-calculator"
import { DeviceAmortizationList } from "./device-amortization-list"
import { AmortizationChart } from "./amortization-chart"
import { AmortizationSummary } from "./amortization-summary"
import type { AmortizationData, AmortizationSummary as AmortizationSummaryType } from "@/lib/types"

export function CostAmortizationDashboard() {
  const { data } = useSmartHome()
  const [amortizationData, setAmortizationData] = useState<AmortizationData[]>([])
  const [summary, setSummary] = useState<AmortizationSummaryType>({
    totalInvestment: 0,
    totalMonthlySavings: 0,
    averagePaybackPeriod: 0,
    amortizedDevices: 0,
    totalDevices: 0,
  })

  // Încărcăm datele de amortizare din localStorage sau inițializăm din dispozitive
  useEffect(() => {
    const savedData = localStorage.getItem("amortizationData")

    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setAmortizationData(parsedData)
      } catch (error) {
        console.error("Eroare la încărcarea datelor de amortizare:", error)
        initializeFromDevices()
      }
    } else {
      // Nu există date în localStorage, inițializăm din dispozitive
      initializeFromDevices()
    }
  }, [data.devices])

  // Funcție pentru inițializarea datelor de amortizare din dispozitive
  const initializeFromDevices = () => {
    const initialAmortizationData: AmortizationData[] = data.devices
      .filter(
        (device) =>
          device.initialCost !== undefined &&
          device.installationCost !== undefined &&
          device.monthlySavings !== undefined &&
          device.lifespan !== undefined,
      )
      .map((device) => ({
        deviceId: device.id,
        initialCost: device.initialCost || 0,
        installationCost: device.installationCost || 0,
        monthlySavings: device.monthlySavings || 0,
        lifespan: device.lifespan || 0,
        notes: `Date inițiale pentru ${device.name}`,
      }))

    if (initialAmortizationData.length > 0) {
      setAmortizationData(initialAmortizationData)
      localStorage.setItem("amortizationData", JSON.stringify(initialAmortizationData))
    }
  }

  // Salvăm datele de amortizare în localStorage
  useEffect(() => {
    if (amortizationData.length > 0) {
      localStorage.setItem("amortizationData", JSON.stringify(amortizationData))
    }
  }, [amortizationData])

  // Calculăm sumarul amortizării
  useEffect(() => {
    if (amortizationData.length === 0) {
      setSummary({
        totalInvestment: 0,
        totalMonthlySavings: 0,
        averagePaybackPeriod: 0,
        amortizedDevices: 0,
        totalDevices: 0,
      })
      return
    }

    const totalInvestment = amortizationData.reduce(
      (sum, item) => sum + (item.initialCost || 0) + (item.installationCost || 0),
      0,
    )

    const totalMonthlySavings = amortizationData.reduce((sum, item) => sum + (item.monthlySavings || 0), 0)

    // Calculăm perioada medie de amortizare (ponderată cu costul)
    let weightedSum = 0
    let totalWeight = 0

    amortizationData.forEach((item) => {
      const totalCost = (item.initialCost || 0) + (item.installationCost || 0)
      const paybackPeriod = item.monthlySavings > 0 ? totalCost / item.monthlySavings : 0

      if (paybackPeriod > 0) {
        weightedSum += paybackPeriod * totalCost
        totalWeight += totalCost
      }
    })

    const averagePaybackPeriod = totalWeight > 0 ? weightedSum / totalWeight : 0

    // Calculăm numărul de dispozitive amortizate
    const amortizedDevices = amortizationData.filter((item) => {
      const totalCost = (item.initialCost || 0) + (item.installationCost || 0)
      const paybackPeriod = item.monthlySavings > 0 ? totalCost / item.monthlySavings : 0
      return paybackPeriod > 0 && paybackPeriod <= (item.lifespan || 0)
    }).length

    setSummary({
      totalInvestment,
      totalMonthlySavings,
      averagePaybackPeriod,
      amortizedDevices,
      totalDevices: amortizationData.length,
    })
  }, [amortizationData])

  // Adăugăm date de amortizare pentru un dispozitiv
  const addAmortizationData = (data: AmortizationData) => {
    setAmortizationData((prev) => {
      // Verificăm dacă dispozitivul există deja
      const existingIndex = prev.findIndex((item) => item.deviceId === data.deviceId)

      if (existingIndex >= 0) {
        // Actualizăm datele existente
        const updated = [...prev]
        updated[existingIndex] = data
        return updated
      } else {
        // Adăugăm date noi
        return [...prev, data]
      }
    })
  }

  // Ștergem date de amortizare pentru un dispozitiv
  const deleteAmortizationData = (deviceId: number) => {
    setAmortizationData((prev) => prev.filter((item) => item.deviceId !== deviceId))
  }

  return (
    <Tabs defaultValue="dashboard" className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="devices">Dispozitive</TabsTrigger>
        <TabsTrigger value="calculator">Calculator</TabsTrigger>
        <TabsTrigger value="charts">Grafice</TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard" className="space-y-4 mt-4">
        <AmortizationSummary summary={summary} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Dispozitive amortizate</CardTitle>
              <CardDescription>
                {summary.amortizedDevices} din {summary.totalDevices} dispozitive se vor amortiza în durata lor de viață
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                {summary.totalDevices > 0 ? (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className="relative w-40 h-40">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-2xl font-bold">
                          {Math.round((summary.amortizedDevices / summary.totalDevices) * 100)}%
                        </div>
                      </div>
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="10"
                          strokeDasharray={`${(summary.amortizedDevices / summary.totalDevices) * 283} 283`}
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-500 mr-2"></div>
                        <span>Dispozitive amortizate: {summary.amortizedDevices}</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <div className="w-4 h-4 bg-gray-300 mr-2"></div>
                        <span>Dispozitive neamortizate: {summary.totalDevices - summary.amortizedDevices}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nu există date de amortizare disponibile</p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Economii lunare vs. Investiție</CardTitle>
              <CardDescription>Raportul dintre economiile lunare și investiția totală</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                {summary.totalInvestment > 0 ? (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className="text-4xl font-bold mb-2">{summary.totalMonthlySavings.toFixed(0)} RON</div>
                    <div className="text-sm text-muted-foreground mb-4">economii lunare</div>
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                      <div
                        className="bg-blue-600 h-4 rounded-full"
                        style={{
                          width: `${Math.min((summary.totalMonthlySavings / summary.totalInvestment) * 100 * 12, 100)}%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {((summary.totalMonthlySavings / summary.totalInvestment) * 100).toFixed(1)}% din investiție
                      recuperată lunar
                    </div>
                    <div className="mt-4 text-sm">
                      <div className="flex justify-between w-full">
                        <span>Investiție totală:</span>
                        <span className="font-medium">{summary.totalInvestment.toFixed(0)} RON</span>
                      </div>
                      <div className="flex justify-between w-full">
                        <span>Recuperare estimată:</span>
                        <span className="font-medium">
                          {summary.averagePaybackPeriod > 0
                            ? `${Math.round(summary.averagePaybackPeriod)} luni (${(summary.averagePaybackPeriod / 12).toFixed(1)} ani)`
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nu există date de amortizare disponibile</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="devices" className="space-y-4 mt-4">
        <DeviceAmortizationList
          amortizationData={amortizationData}
          devices={data.devices}
          onDelete={deleteAmortizationData}
          onUpdate={addAmortizationData}
        />
      </TabsContent>

      <TabsContent value="calculator" className="space-y-4 mt-4">
        <AmortizationCalculator
          devices={data.devices.filter((d) => !amortizationData.some((a) => a.deviceId === d.id))}
          onSave={addAmortizationData}
        />
      </TabsContent>

      <TabsContent value="charts" className="space-y-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Grafice de amortizare</CardTitle>
            <CardDescription>Vizualizează grafice detaliate despre amortizarea investițiilor tale</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AmortizationChart amortizationData={amortizationData} devices={data.devices} detailed={true} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
