"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BatteryCharging, Zap, Leaf, ArrowUpFromLine } from "lucide-react"
import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import {
  generateRealisticHistoricalData,
  generateRealisticRealtimeData,
  calculateAverages,
  type RealtimeEnergyData,
  type EnergyDataPoint,
} from "@/lib/energy-data-generator"

export function EnergyMonitoring() {
  const [activeTab, setActiveTab] = useState("realtime")

  // Date în timp real
  const [realtimeData, setRealtimeData] = useState<RealtimeEnergyData>(() => generateRealisticRealtimeData())

  // Date istorice pentru diferite perioade
  const [historicalData, setHistoricalData] = useState({
    week: generateRealisticHistoricalData("week"),
    month: generateRealisticHistoricalData("month"),
    year: generateRealisticHistoricalData("year"),
  })

  // Calculăm mediile pentru perioadele istorice
  const weeklyAvg = calculateAverages(historicalData.week)
  const monthlyAvg = calculateAverages(historicalData.month)
  const yearlyAvg = calculateAverages(historicalData.year)

  // Actualizări periodice ale datelor în timp real
  useEffect(() => {
    if (activeTab !== "realtime") return

    const interval = setInterval(() => {
      setRealtimeData((prev) => generateRealisticRealtimeData(prev))
    }, 5000) // Actualizare la fiecare 5 secunde

    return () => clearInterval(interval)
  }, [activeTab])

  // Regenerează datele istorice o dată pe oră pentru a simula actualizări
  useEffect(() => {
    const interval = setInterval(() => {
      setHistoricalData({
        week: generateRealisticHistoricalData("week"),
        month: generateRealisticHistoricalData("month"),
        year: generateRealisticHistoricalData("year"),
      })
    }, 3600000) // O dată pe oră

    return () => clearInterval(interval)
  }, [])

  // Determină culoarea pentru nivelul bateriei
  const getBatteryColor = (level: number) => {
    if (level >= 70) return "text-green-500"
    if (level >= 40) return "text-yellow-500"
    return "text-red-500"
  }

  // Calculează totalurile pentru perioada selectată
  const calculateTotals = (data: EnergyDataPoint[]) => {
    return data.reduce(
      (acc, item) => ({
        consumption: acc.consumption + item.consumption,
        production: acc.production + item.production,
        feedIn: acc.feedIn + item.feedIn,
      }),
      { consumption: 0, production: 0, feedIn: 0 },
    )
  }

  // Funcție pentru a afișa detaliile de energie pentru perioada selectată
  const renderEnergyDetails = (period: "realtime" | "week" | "month" | "year") => {
    let data: EnergyDataPoint[] = []
    let batteryPercentage = 0
    let totalConsumption = 0
    let totalProduction = 0
    let feedInDisplay = 0
    let unit = "kW"

    if (period === "realtime") {
      // Pentru timp real
      totalConsumption = Number(realtimeData.gridConsumption.kw) + Number(realtimeData.solarConsumption.kw)
      totalProduction = Number(realtimeData.solarConsumption.kw) + Number(realtimeData.gridFeedIn.kw)
      feedInDisplay = Number(realtimeData.gridFeedIn.kw)
      batteryPercentage = realtimeData.batteryLevel.percentage
      unit = "kW"
    } else {
      // Pentru perioade istorice
      data = historicalData[period]
      const totals = calculateTotals(data)
      totalConsumption = totals.consumption
      totalProduction = totals.production
      feedInDisplay = totals.feedIn
      batteryPercentage = Number(
        period === "week" ? weeklyAvg?.battery : period === "month" ? monthlyAvg?.battery : yearlyAvg?.battery,
      )
      unit = "kWh"
    }

    const currentTime = new Date().toLocaleTimeString("ro-RO", {
      hour: "2-digit",
      minute: "2-digit",
    })

    // Calculăm kW stocați în baterie (presupunem o capacitate de 20 kWh)
    const batteryCapacity = 20 // kWh
    const storedEnergy = (batteryPercentage / 100) * batteryCapacity

    // Calculează rata de autoconsum
    const selfConsumption = Math.min(totalProduction, totalConsumption)
    const selfConsumptionRate = totalProduction > 0 ? (selfConsumption / totalProduction) * 100 : 0

    return (
      <div className="space-y-4">
        {/* Header cu informații contextuale */}
        {period === "realtime" && (
          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Ultima actualizare:</span>
              <span className="font-medium">{currentTime}</span>
            </div>
          </div>
        )}

        {/* Grid cu 4 secțiuni */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 1. Consum total */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Zap className="h-5 w-5 mr-2 text-primary" />
              <span className="text-sm font-medium">Consum total</span>
            </div>
            <div className="text-xl font-bold">
              {period === "realtime"
                ? `${totalConsumption.toFixed(2)} ${unit}`
                : `${Math.round(totalConsumption)} ${unit}`}
            </div>
            {period !== "realtime" && (
              <div className="mt-2 text-xs text-muted-foreground">
                {period === "week" && `Medie: ${Math.round(totalConsumption / 7)} kWh/zi`}
                {period === "month" && `Medie: ${Math.round(totalConsumption / 30)} kWh/zi`}
                {period === "year" && `Medie: ${Math.round(totalConsumption / 365)} kWh/zi`}
              </div>
            )}
          </div>

          {/* 2. Producție energie verde */}
          <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Leaf className="h-5 w-5 mr-2 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">Producție energie verde</span>
            </div>
            <div className="text-xl font-bold text-green-700 dark:text-green-300">
              {period === "realtime"
                ? `${totalProduction.toFixed(2)} ${unit}`
                : `${Math.round(totalProduction)} ${unit}`}
            </div>
            {period !== "realtime" && (
              <div className="mt-2 text-xs text-green-700 dark:text-green-300">
                <div className="flex justify-between mb-1">
                  <span>Autoconsum:</span>
                  <span className="font-medium">{Math.round(selfConsumptionRate)}%</span>
                </div>
                <Progress
                  value={selfConsumptionRate}
                  className="h-1.5 bg-green-200 dark:bg-green-900 [&>div]:bg-green-600"
                />
              </div>
            )}
          </div>

          {/* 3. Surplus introdus în rețea */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <ArrowUpFromLine className="h-5 w-5 mr-2 text-blue-600" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Surplus introdus în rețea</span>
            </div>
            <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
              {period === "realtime" ? `${feedInDisplay.toFixed(2)} ${unit}` : `${Math.round(feedInDisplay)} ${unit}`}
            </div>
            <div className="mt-2">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-blue-700 dark:text-blue-300">Din producție</span>
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  {totalProduction > 0 ? ((feedInDisplay / totalProduction) * 100).toFixed(0) : "0"}%
                </span>
              </div>
              <Progress
                value={totalProduction > 0 ? (feedInDisplay / totalProduction) * 100 : 0}
                className="h-1.5 bg-blue-200 dark:bg-blue-900 [&>div]:bg-blue-600"
              />
            </div>
          </div>

          {/* 4. Nivelul bateriei */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <BatteryCharging className={`h-5 w-5 mr-2 ${getBatteryColor(batteryPercentage)}`} />
              <span className="text-sm font-medium">Energie stocată</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <div className={`text-xl font-bold ${getBatteryColor(batteryPercentage)}`}>{batteryPercentage}%</div>
              <div className="text-xs text-muted-foreground">
                {storedEnergy.toFixed(1)}/{batteryCapacity} kWh
              </div>
            </div>
            <Progress
              value={batteryPercentage}
              className={`h-2 [&>div]:${getBatteryColor(batteryPercentage).replace("text-", "bg-")}`}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full h-fit">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="mr-2 h-5 w-5" />
          Monitorizare energie
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="realtime" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="realtime">Timp real</TabsTrigger>
            <TabsTrigger value="week">Săptămână</TabsTrigger>
            <TabsTrigger value="month">Lună</TabsTrigger>
            <TabsTrigger value="year">An</TabsTrigger>
          </TabsList>

          <TabsContent value="realtime" className="space-y-0">
            {renderEnergyDetails("realtime")}
          </TabsContent>

          <TabsContent value="week" className="space-y-4">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData.week}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      `${Number(value).toFixed(1)} kWh`,
                      name === "consumption"
                        ? "Consum total"
                        : name === "production"
                          ? "Producție energie verde"
                          : "Surplus introdus în rețea",
                    ]}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Legend
                    formatter={(value) =>
                      value === "consumption"
                        ? "Consum total"
                        : value === "production"
                          ? "Producție energie verde"
                          : "Surplus introdus în rețea"
                    }
                  />
                  <Line type="monotone" dataKey="consumption" name="consumption" stroke="#6366f1" strokeWidth={2} />
                  <Line type="monotone" dataKey="production" name="production" stroke="#22c55e" strokeWidth={2} />
                  <Line type="monotone" dataKey="feedIn" name="feedIn" stroke="#f97316" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {renderEnergyDetails("week")}
          </TabsContent>

          <TabsContent value="month" className="space-y-4">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData.month}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      `${Number(value).toFixed(1)} kWh`,
                      name === "consumption"
                        ? "Consum total"
                        : name === "production"
                          ? "Producție energie verde"
                          : "Surplus introdus în rețea",
                    ]}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Legend
                    formatter={(value) =>
                      value === "consumption"
                        ? "Consum total"
                        : value === "production"
                          ? "Producție energie verde"
                          : "Surplus introdus în rețea"
                    }
                  />
                  <Line type="monotone" dataKey="consumption" name="consumption" stroke="#6366f1" strokeWidth={2} />
                  <Line type="monotone" dataKey="production" name="production" stroke="#22c55e" strokeWidth={2} />
                  <Line type="monotone" dataKey="feedIn" name="feedIn" stroke="#f97316" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {renderEnergyDetails("month")}
          </TabsContent>

          <TabsContent value="year" className="space-y-4">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData.year}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      `${Number(value).toFixed(1)} kWh`,
                      name === "consumption"
                        ? "Consum total"
                        : name === "production"
                          ? "Producție energie verde"
                          : "Surplus introdus în rețea",
                    ]}
                    labelFormatter={(label) => `Luna: ${label}`}
                  />
                  <Legend
                    formatter={(value) =>
                      value === "consumption"
                        ? "Consum total"
                        : value === "production"
                          ? "Producție energie verde"
                          : "Surplus introdus în rețea"
                    }
                  />
                  <Line type="monotone" dataKey="consumption" name="consumption" stroke="#6366f1" strokeWidth={2} />
                  <Line type="monotone" dataKey="production" name="production" stroke="#22c55e" strokeWidth={2} />
                  <Line type="monotone" dataKey="feedIn" name="feedIn" stroke="#f97316" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {renderEnergyDetails("year")}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
