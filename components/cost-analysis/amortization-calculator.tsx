"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import type { Device, AmortizationData } from "@/lib/types"

interface AmortizationCalculatorProps {
  devices: Device[]
  onSave: (data: AmortizationData) => void
}

export function AmortizationCalculator({ devices, onSave }: AmortizationCalculatorProps) {
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null)
  const [initialCost, setInitialCost] = useState<number>(0)
  const [installationCost, setInstallationCost] = useState<number>(0)
  const [monthlySavings, setMonthlySavings] = useState<number>(0)
  const [lifespan, setLifespan] = useState<number>(60) // 5 ani în luni
  const [notes, setNotes] = useState<string>("")

  // Calculăm perioada de amortizare
  const totalCost = initialCost + installationCost
  const paybackPeriod = monthlySavings > 0 ? totalCost / monthlySavings : 0
  const isAmortized = paybackPeriod <= lifespan && paybackPeriod > 0

  const handleSave = () => {
    if (!selectedDeviceId) return

    onSave({
      deviceId: selectedDeviceId,
      initialCost,
      installationCost,
      monthlySavings,
      lifespan,
      notes,
    })

    // Resetăm formularul
    setSelectedDeviceId(null)
    setInitialCost(0)
    setInstallationCost(0)
    setMonthlySavings(0)
    setLifespan(60)
    setNotes("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculator de amortizare</CardTitle>
        <CardDescription>Calculează perioada de amortizare pentru dispozitivele tale smart home</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="device">Dispozitiv</Label>
          <Select onValueChange={(value) => setSelectedDeviceId(Number(value))}>
            <SelectTrigger id="device" className="w-full">
              <SelectValue placeholder="Selectează un dispozitiv" />
            </SelectTrigger>
            <SelectContent>
              {devices.map((device) => (
                <SelectItem key={device.id} value={device.id.toString()}>
                  {device.name} ({device.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="initialCost">Cost inițial (RON)</Label>
            <Input
              id="initialCost"
              type="number"
              min="0"
              value={initialCost === 0 ? "" : initialCost}
              onChange={(e) => setInitialCost(e.target.value === "" ? 0 : Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="installationCost">Cost instalare (RON)</Label>
            <Input
              id="installationCost"
              type="number"
              min="0"
              value={installationCost === 0 ? "" : installationCost}
              onChange={(e) => setInstallationCost(e.target.value === "" ? 0 : Number(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="monthlySavings">Economii lunare estimate (RON)</Label>
          <Input
            id="monthlySavings"
            type="number"
            min="0"
            value={monthlySavings === 0 ? "" : monthlySavings}
            onChange={(e) => setMonthlySavings(e.target.value === "" ? 0 : Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap justify-between">
            <Label htmlFor="lifespan" className="mb-1">
              Durata de viață estimată: {Math.floor(lifespan / 12)} ani ({lifespan} luni)
            </Label>
          </div>
          <Slider
            id="lifespan"
            min={12}
            max={120}
            step={12}
            value={[lifespan]}
            onValueChange={(value) => setLifespan(value[0])}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Note</Label>
          <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        {/* Rezultatul calculului */}
        {monthlySavings > 0 && (
          <div className="rounded-lg bg-muted p-4 mt-4">
            <h3 className="text-lg font-medium mb-2">Rezultat calcul</h3>
            <div className="space-y-2">
              <div className="flex justify-between flex-wrap">
                <span>Cost total:</span>
                <span className="font-medium">{totalCost.toFixed(2)} RON</span>
              </div>
              <div className="flex justify-between flex-wrap">
                <span>Perioada de amortizare:</span>
                <span className="font-medium">
                  {paybackPeriod.toFixed(1)} luni ({(paybackPeriod / 12).toFixed(1)} ani)
                </span>
              </div>
              <div className="flex justify-between flex-wrap">
                <span>Status:</span>
                <span className={`font-medium ${isAmortized ? "text-green-600" : "text-red-600"}`}>
                  {isAmortized
                    ? "Investiția se amortizează în perioada de viață"
                    : "Investiția nu se amortizează în perioada de viață"}
                </span>
              </div>
              <div className="flex justify-between flex-wrap">
                <span>ROI anual:</span>
                <span className="font-medium">{(((monthlySavings * 12) / totalCost) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSave}
          disabled={!selectedDeviceId || initialCost <= 0 || monthlySavings <= 0}
          className="w-full"
        >
          Salvează datele de amortizare
        </Button>
      </CardFooter>
    </Card>
  )
}
