"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { generateRealisticHistoricalData } from "@/lib/energy-data-generator"
import { useMemo } from "react"

export function EnergyConsumptionChart() {
  // Generăm date realiste pentru grafic
  const energyData = useMemo(
    () => ({
      day: generateRealisticHistoricalData("week").slice(-1), // Ultima zi
      week: generateRealisticHistoricalData("week"),
      month: generateRealisticHistoricalData("month"),
    }),
    [],
  )

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Consum de Energie</CardTitle>
        <CardDescription>Consumul de energie din rețea vs. solar pentru perioada selectată</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="week">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="day">Zi</TabsTrigger>
              <TabsTrigger value="week">Săptămână</TabsTrigger>
              <TabsTrigger value="month">Lună</TabsTrigger>
            </TabsList>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                <span className="text-sm text-muted-foreground">Rețea</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm text-muted-foreground">Solar</span>
              </div>
            </div>
          </div>

          <TabsContent value="day" className="mt-2">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={energyData.day}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: "kW", angle: -90, position: "insideLeft" }} />
                <Tooltip formatter={(value, name) => [`${value} kW`, name === "grid" ? "Rețea" : "Solar"]} />
                <Line type="monotone" dataKey="grid" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line type="monotone" dataKey="solar" stroke="#22c55e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="week" className="mt-2">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={energyData.week}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: "kW", angle: -90, position: "insideLeft" }} />
                <Tooltip formatter={(value, name) => [`${value} kW`, name === "grid" ? "Rețea" : "Solar"]} />
                <Line type="monotone" dataKey="grid" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line type="monotone" dataKey="solar" stroke="#22c55e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="month" className="mt-2">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={energyData.month}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: "kW", angle: -90, position: "insideLeft" }} />
                <Tooltip formatter={(value, name) => [`${value} kW`, name === "grid" ? "Rețea" : "Solar"]} />
                <Line type="monotone" dataKey="grid" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line type="monotone" dataKey="solar" stroke="#22c55e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
