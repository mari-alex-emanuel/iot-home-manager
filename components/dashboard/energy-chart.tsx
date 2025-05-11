"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Generăm date statice pentru grafic pentru a evita dependența de context
const generateEnergyData = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  return days.map((day, index) => ({
    day,
    grid: 30 - index * 3,
    solar: 20 + index * 4,
  }))
}

export function EnergyConsumptionChart() {
  // Folosim date statice în loc să depindem de context
  const energyData = generateEnergyData()

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Energy Consumption</CardTitle>
        <CardDescription>Grid vs Solar energy consumption for the last week</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="week">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-primary mr-1"></div>
                <span className="text-sm text-muted-foreground">Grid</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                <span className="text-sm text-muted-foreground">Solar</span>
              </div>
            </div>
          </div>
          <TabsContent value="day" className="mt-2">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={energyData.slice(-1)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis label={{ value: "kWh", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Line type="monotone" dataKey="grid" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line type="monotone" dataKey="solar" stroke="#22c55e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="week" className="mt-2">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={energyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis label={{ value: "kWh", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Line type="monotone" dataKey="grid" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line type="monotone" dataKey="solar" stroke="#22c55e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="month" className="mt-2">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={[...energyData, ...energyData, ...energyData].slice(0, 30)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis label={{ value: "kWh", angle: -90, position: "insideLeft" }} />
                <Tooltip />
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
