"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BatteryCharging, Zap, ArrowDownToLine, ArrowUpFromLine, Leaf } from "lucide-react"
import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

// Tipuri pentru datele de energie
interface EnergyDataPoint {
  gridConsumption: { percentage: number; kw: number }
  solarConsumption: { percentage: number; kw: number }
  gridFeedIn: { kw: number }
  batteryLevel: { percentage: number }
  date?: string // Pentru date istorice
}

// Generăm date istorice pentru diferite perioade
const generateHistoricalData = (period: "week" | "month" | "year") => {
  const data: Array<{
    date: string
    grid: number
    solar: number
    feedIn: number
    battery: number
  }> = []

  let days = 7
  let format = "DD/MM"
  let step = 1

  if (period === "month") {
    days = 30
    step = 2
  } else if (period === "year") {
    days = 12
    format = "MMM"
  }

  const now = new Date()

  for (let i = 0; i < days; i += step) {
    const date = new Date()

    if (period === "year") {
      // Pentru an, folosim lunile
      date.setMonth(i)
      data.push({
        date: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
        grid: 5 + Math.random() * 10,
        solar: 10 + Math.random() * 15,
        feedIn: 2 + Math.random() * 5,
        battery: 60 + Math.random() * 30,
      })
    } else {
      // Pentru săptămână și lună, folosim zile
      date.setDate(now.getDate() - (days - i))

      // Variații sezoniere pentru date mai realiste
      const seasonMultiplier = period === "month" ? 0.8 + Math.sin((i / days) * Math.PI) * 0.4 : 1

      data.push({
        date: date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" }),
        grid: (5 + Math.random() * 10) * seasonMultiplier,
        solar: (10 + Math.random() * 15) * seasonMultiplier,
        feedIn: (2 + Math.random() * 5) * seasonMultiplier,
        battery: 60 + Math.random() * 30,
      })
    }
  }

  return data
}

export function EnergyMonitoring() {
  // State pentru perioada selectată
  const [activeTab, setActiveTab] = useState("realtime")

  // Date în timp real
  const [realtimeData, setRealtimeData] = useState<EnergyDataPoint>({
    gridConsumption: { percentage: 35, kw: 8.7 },
    solarConsumption: { percentage: 65, kw: 16.3 },
    gridFeedIn: { kw: 4.2 },
    batteryLevel: { percentage: 78 },
  })

  // Date istorice pentru diferite perioade
  const [historicalData, setHistoricalData] = useState({
    week: generateHistoricalData("week"),
    month: generateHistoricalData("month"),
    year: generateHistoricalData("year"),
  })

  // Calculăm mediile pentru perioadele istorice
  const calculateAverages = (data: any[]) => {
    const totalGrid = data.reduce((sum, item) => sum + item.grid, 0)
    const totalSolar = data.reduce((sum, item) => sum + item.solar, 0)
    const totalFeedIn = data.reduce((sum, item) => sum + item.feedIn, 0)
    const totalBattery = data.reduce((sum, item) => sum + item.battery, 0)

    const avgGrid = totalGrid / data.length
    const avgSolar = totalSolar / data.length
    const avgTotal = avgGrid + avgSolar
    const avgFeedIn = totalFeedIn / data.length
    const avgBattery = totalBattery / data.length

    return {
      grid: { kw: avgGrid.toFixed(1), percentage: ((avgGrid / avgTotal) * 100).toFixed(1) },
      solar: { kw: avgSolar.toFixed(1), percentage: ((avgSolar / avgTotal) * 100).toFixed(1) },
      feedIn: avgFeedIn.toFixed(1),
      battery: avgBattery.toFixed(0),
    }
  }

  const weeklyAvg = calculateAverages(historicalData.week)
  const monthlyAvg = calculateAverages(historicalData.month)
  const yearlyAvg = calculateAverages(historicalData.year)

  // Simulăm actualizări periodice ale datelor în timp real
  useEffect(() => {
    if (activeTab !== "realtime") return

    const interval = setInterval(() => {
      // Generăm variații mici pentru a simula date în timp real
      const variation = () => Math.random() * 0.2 - 0.1 // între -0.1 și +0.1

      // Calculăm noile valori
      let newSolarPercentage = realtimeData.solarConsumption.percentage * (1 + variation())
      newSolarPercentage = Math.min(Math.max(newSolarPercentage, 50), 80) // Menținem între 50% și 80%

      const newGridPercentage = 100 - newSolarPercentage

      const totalConsumption = 25 + Math.random() * 2 - 1 // Între 24 și 26 kW
      const newSolarKw = (totalConsumption * newSolarPercentage) / 100
      const newGridKw = totalConsumption - newSolarKw

      const newGridFeedIn = 4 + Math.random() * 0.8 - 0.4 // Între 3.6 și 4.4 kW

      let newBatteryLevel = realtimeData.batteryLevel.percentage + Math.random() * 2 - 1
      newBatteryLevel = Math.min(Math.max(newBatteryLevel, 65), 95) // Menținem între 65% și 95%

      setRealtimeData({
        gridConsumption: {
          percentage: Number.parseFloat(newGridPercentage.toFixed(1)),
          kw: Number.parseFloat(newGridKw.toFixed(1)),
        },
        solarConsumption: {
          percentage: Number.parseFloat(newSolarPercentage.toFixed(1)),
          kw: Number.parseFloat(newSolarKw.toFixed(1)),
        },
        gridFeedIn: {
          kw: Number.parseFloat(newGridFeedIn.toFixed(1)),
        },
        batteryLevel: {
          percentage: Number.parseFloat(newBatteryLevel.toFixed(0)),
        },
      })
    }, 5000) // Actualizăm la fiecare 5 secunde

    return () => clearInterval(interval)
  }, [realtimeData, activeTab])

  // Determinăm culoarea pentru nivelul bateriei
  const getBatteryColor = (level: number) => {
    if (level >= 70) return "text-green-500"
    if (level >= 40) return "text-yellow-500"
    return "text-red-500"
  }

  // Funcție pentru a afișa detaliile de consum pentru perioada selectată
  const renderConsumptionDetails = (period: "realtime" | "week" | "month" | "year") => {
    let data

    switch (period) {
      case "realtime":
        data = {
          grid: {
            kw: realtimeData.gridConsumption.kw,
            percentage: realtimeData.solarConsumption.percentage,
          },
          solar: {
            kw: realtimeData.solarConsumption.kw,
            percentage: realtimeData.solarConsumption.percentage,
          },
          feedIn: realtimeData.gridFeedIn.kw,
          battery: realtimeData.batteryLevel.percentage,
        }
        break
      case "week":
        data = weeklyAvg
        break
      case "month":
        data = monthlyAvg
        break
      case "year":
        data = yearlyAvg
        break
    }

    const batteryPercentage = period === "realtime" ? realtimeData.batteryLevel.percentage : Number(data.battery)

    return (
      <div className="space-y-6">
        {/* Consumul de energie */}
        <div>
          <h3 className="text-sm font-medium mb-2">
            {period === "realtime"
              ? "Current Energy Consumption"
              : `Average ${period.charAt(0).toUpperCase() + period.slice(1)}ly Consumption`}
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <div className="flex items-center">
                  <ArrowDownToLine className="h-4 w-4 mr-1 text-primary" />
                  <span className="text-sm">Grid Consumption</span>
                </div>
                <div className="text-sm font-medium">
                  {data.grid.kw} kW ({data.grid.percentage}%)
                </div>
              </div>
              <Progress value={Number(data.grid.percentage)} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <div className="flex items-center">
                  <Leaf className="h-4 w-4 mr-1 text-green-500" />
                  <span className="text-sm">Solar Consumption</span>
                </div>
                <div className="text-sm font-medium">
                  {data.solar.kw} kW ({data.solar.percentage}%)
                </div>
              </div>
              <Progress value={Number(data.solar.percentage)} className="h-2 bg-muted [&>div]:bg-green-500" />
            </div>
          </div>
        </div>

        {/* Energia introdusă în rețea */}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <ArrowUpFromLine className="h-4 w-4 mr-1 text-green-500" />
              <span className="text-sm font-medium">Grid Feed-In</span>
            </div>
            <div className="text-sm font-medium text-green-600">+{data.feedIn} kW</div>
          </div>
        </div>

        {/* Nivelul bateriei */}
        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium mb-2">
            {period === "realtime"
              ? "Current Battery Status"
              : `Average ${period.charAt(0).toUpperCase() + period.slice(1)}ly Battery Level`}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BatteryCharging className={`h-5 w-5 mr-2 ${getBatteryColor(batteryPercentage)}`} />
              <span className="text-sm">Energy Reserve</span>
            </div>
            <span className={`text-sm font-medium ${getBatteryColor(batteryPercentage)}`}>{batteryPercentage}%</span>
          </div>
          <Progress
            value={batteryPercentage}
            className={`h-2.5 mt-2 [&>div]:${getBatteryColor(batteryPercentage).replace("text-", "bg-")}`}
          />

          {period === "realtime" && (
            <div className="mt-2 text-xs text-muted-foreground text-center">
              Estimated backup time: {Math.floor(batteryPercentage / 10)} hours
            </div>
          )}
        </div>

        {/* Rezumat */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-muted/50 p-3 rounded-md">
              <div className="text-sm text-muted-foreground">Total Consumption</div>
              <div className="text-lg font-medium">{(Number(data.grid.kw) + Number(data.solar.kw)).toFixed(1)} kW</div>
            </div>
            <div className="bg-muted/50 p-3 rounded-md">
              <div className="text-sm text-muted-foreground">Green Energy Ratio</div>
              <div className="text-lg font-medium text-green-600">{data.solar.percentage}%</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="mr-2 h-5 w-5" />
          Energy Monitoring
        </CardTitle>
        <CardDescription>Energy consumption, production and storage</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="realtime" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="realtime">Real-time</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>

          <TabsContent value="realtime">{renderConsumptionDetails("realtime")}</TabsContent>

          <TabsContent value="week">
            <div className="h-[300px] mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData.week}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis label={{ value: "kW", angle: -90, position: "insideLeft" }} />
                  <Tooltip formatter={(value) => [`${value} kW`]} />
                  <Legend />
                  <Line type="monotone" dataKey="grid" name="Grid" stroke="#6366f1" strokeWidth={2} />
                  <Line type="monotone" dataKey="solar" name="Solar" stroke="#22c55e" strokeWidth={2} />
                  <Line type="monotone" dataKey="feedIn" name="Feed-In" stroke="#f97316" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {renderConsumptionDetails("week")}
          </TabsContent>

          <TabsContent value="month">
            <div className="h-[300px] mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData.month}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis label={{ value: "kW", angle: -90, position: "insideLeft" }} />
                  <Tooltip formatter={(value) => [`${value} kW`]} />
                  <Legend />
                  <Line type="monotone" dataKey="grid" name="Grid" stroke="#6366f1" strokeWidth={2} />
                  <Line type="monotone" dataKey="solar" name="Solar" stroke="#22c55e" strokeWidth={2} />
                  <Line type="monotone" dataKey="feedIn" name="Feed-In" stroke="#f97316" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {renderConsumptionDetails("month")}
          </TabsContent>

          <TabsContent value="year">
            <div className="h-[300px] mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData.year}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis label={{ value: "kW", angle: -90, position: "insideLeft" }} />
                  <Tooltip formatter={(value) => [`${value} kW`]} />
                  <Legend />
                  <Line type="monotone" dataKey="grid" name="Grid" stroke="#6366f1" strokeWidth={2} />
                  <Line type="monotone" dataKey="solar" name="Solar" stroke="#22c55e" strokeWidth={2} />
                  <Line type="monotone" dataKey="feedIn" name="Feed-In" stroke="#f97316" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {renderConsumptionDetails("year")}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
