"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
  ReferenceLine,
} from "recharts"

// Sample data for consumption
const generateWeeklyData = (deviceType: string) => {
  const baseValue = deviceType === "light" ? 1.2 : deviceType === "outlet" ? 3.5 : 1
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  return days.map((day) => {
    const peak = baseValue * (0.8 + Math.random() * 0.5)
    const offPeak = baseValue * (0.3 + Math.random() * 0.3)
    const standby = baseValue * 0.1 * (0.8 + Math.random() * 0.4)

    return {
      day,
      peak: Number.parseFloat(peak.toFixed(1)),
      offPeak: Number.parseFloat(offPeak.toFixed(1)),
      standby: Number.parseFloat(standby.toFixed(1)),
      total: Number.parseFloat((peak + offPeak + standby).toFixed(1)),
    }
  })
}

const generateMonthlyData = (deviceType: string) => {
  const baseValue = deviceType === "light" ? 8 : deviceType === "outlet" ? 24 : 10
  const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"]

  return weeks.map((week, index) => {
    // Adăugăm o variație pentru a face datele să pară mai naturale
    const variation = 0.8 + Math.random() * 0.4
    // Pentru prize, adăugăm un vârf de consum în săptămâna 3
    const weekMultiplier = deviceType === "outlet" && index === 2 ? 1.3 : 1

    const peak = baseValue * variation * weekMultiplier * 0.5
    const offPeak = baseValue * variation * weekMultiplier * 0.3
    const standby = baseValue * variation * weekMultiplier * 0.2

    return {
      week,
      peak: Number.parseFloat(peak.toFixed(1)),
      offPeak: Number.parseFloat(offPeak.toFixed(1)),
      standby: Number.parseFloat(standby.toFixed(1)),
      total: Number.parseFloat((peak + offPeak + standby).toFixed(1)),
    }
  })
}

interface ConsumptionChartProps {
  deviceType: string
  deviceName: string
}

export function ConsumptionChart({ deviceType, deviceName }: ConsumptionChartProps) {
  const weeklyData = generateWeeklyData(deviceType)
  const monthlyData = generateMonthlyData(deviceType)

  // Calculăm valorile totale și medii
  const weeklyTotal = weeklyData.reduce((acc, curr) => acc + curr.total, 0)
  const weeklyAverage = weeklyTotal / 7

  const monthlyTotal = monthlyData.reduce((acc, curr) => acc + curr.total, 0)
  const monthlyAverage = monthlyTotal / 4

  // Determinăm ziua cu cel mai mare consum
  const maxDayConsumption = Math.max(...weeklyData.map((d) => d.total))
  const peakDay = weeklyData.find((d) => d.total === maxDayConsumption)?.day

  // Determinăm săptămâna cu cel mai mare consum
  const maxWeekConsumption = Math.max(...monthlyData.map((d) => d.total))
  const peakWeek = monthlyData.find((d) => d.total === maxWeekConsumption)?.week

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Power Consumption</CardTitle>
        <CardDescription>Energy usage for {deviceName}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="weekly" className="mt-2">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis label={{ value: "kWh", angle: -90, position: "insideLeft" }} />
                  <Tooltip
                    formatter={(value, name) => [
                      `${value} kWh`,
                      name === "peak"
                        ? "Peak Hours"
                        : name === "offPeak"
                          ? "Off-Peak Hours"
                          : name === "standby"
                            ? "Standby"
                            : name,
                    ]}
                  />
                  <Legend />
                  <ReferenceLine y={weeklyAverage} label="Avg" stroke="#ff7300" strokeDasharray="3 3" />
                  <Area
                    type="monotone"
                    dataKey="standby"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="offPeak"
                    stackId="1"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.6}
                  />
                  <Area type="monotone" dataKey="peak" stackId="1" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2 bg-muted/50 p-3 rounded-md">
                <h4 className="font-medium">Consumption Summary</h4>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Daily Average:</span>
                  <span className="font-medium">{weeklyAverage.toFixed(2)} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weekly Total:</span>
                  <span className="font-medium">{weeklyTotal.toFixed(2)} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Peak Day:</span>
                  <span className="font-medium">
                    {peakDay} ({maxDayConsumption.toFixed(2)} kWh)
                  </span>
                </div>
              </div>

              <div className="space-y-2 bg-muted/50 p-3 rounded-md">
                <h4 className="font-medium">Usage Breakdown</h4>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Peak Hours:</span>
                  <span className="font-medium">
                    {weeklyData.reduce((acc, curr) => acc + curr.peak, 0).toFixed(2)} kWh
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Off-Peak Hours:</span>
                  <span className="font-medium">
                    {weeklyData.reduce((acc, curr) => acc + curr.offPeak, 0).toFixed(2)} kWh
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Standby Power:</span>
                  <span className="font-medium">
                    {weeklyData.reduce((acc, curr) => acc + curr.standby, 0).toFixed(2)} kWh
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="mt-2">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis label={{ value: "kWh", angle: -90, position: "insideLeft" }} />
                  <Tooltip
                    formatter={(value, name) => [
                      `${value} kWh`,
                      name === "peak"
                        ? "Peak Hours"
                        : name === "offPeak"
                          ? "Off-Peak Hours"
                          : name === "standby"
                            ? "Standby"
                            : name,
                    ]}
                  />
                  <Legend />
                  <ReferenceLine y={monthlyAverage} label="Avg" stroke="#ff7300" strokeDasharray="3 3" />
                  <Area
                    type="monotone"
                    dataKey="standby"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="offPeak"
                    stackId="1"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.6}
                  />
                  <Area type="monotone" dataKey="peak" stackId="1" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2 bg-muted/50 p-3 rounded-md">
                <h4 className="font-medium">Consumption Summary</h4>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weekly Average:</span>
                  <span className="font-medium">{monthlyAverage.toFixed(2)} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Total:</span>
                  <span className="font-medium">{monthlyTotal.toFixed(2)} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Peak Week:</span>
                  <span className="font-medium">
                    {peakWeek} ({maxWeekConsumption.toFixed(2)} kWh)
                  </span>
                </div>
              </div>

              <div className="space-y-2 bg-muted/50 p-3 rounded-md">
                <h4 className="font-medium">Usage Breakdown</h4>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Peak Hours:</span>
                  <span className="font-medium">
                    {monthlyData.reduce((acc, curr) => acc + curr.peak, 0).toFixed(2)} kWh
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Off-Peak Hours:</span>
                  <span className="font-medium">
                    {monthlyData.reduce((acc, curr) => acc + curr.offPeak, 0).toFixed(2)} kWh
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Standby Power:</span>
                  <span className="font-medium">
                    {monthlyData.reduce((acc, curr) => acc + curr.standby, 0).toFixed(2)} kWh
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
