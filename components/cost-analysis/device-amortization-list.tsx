"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Pencil, Trash2, CheckCircle, XCircle } from "lucide-react"
import type { Device, AmortizationData } from "@/lib/types"

interface DeviceAmortizationListProps {
  amortizationData: AmortizationData[]
  devices: Device[]
  onDelete: (deviceId: number) => void
  onUpdate: (data: AmortizationData) => void
}

export function DeviceAmortizationList({ amortizationData, devices, onDelete, onUpdate }: DeviceAmortizationListProps) {
  const [editingData, setEditingData] = useState<AmortizationData | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleEdit = (data: AmortizationData) => {
    setEditingData(data)
    setIsDialogOpen(true)
  }

  const handleUpdate = () => {
    if (editingData) {
      onUpdate(editingData)
      setIsDialogOpen(false)
      setEditingData(null)
    }
  }

  const getDeviceName = (deviceId: number) => {
    const device = devices.find((d) => d.id === deviceId)
    return device ? device.name : "Dispozitiv necunoscut"
  }

  const getDeviceType = (deviceId: number) => {
    const device = devices.find((d) => d.id === deviceId)
    return device ? device.type : "unknown"
  }

  // Sortăm datele după perioada de amortizare
  const sortedData = [...amortizationData].sort((a, b) => {
    const paybackA = (a.initialCost + a.installationCost) / a.monthlySavings
    const paybackB = (b.initialCost + b.installationCost) / b.monthlySavings
    return paybackA - paybackB
  })

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Dispozitive cu amortizare</CardTitle>
          <CardDescription>Lista dispozitivelor pentru care ai configurat date de amortizare</CardDescription>
        </CardHeader>
        <CardContent>
          {amortizationData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nu ai configurat date de amortizare pentru niciun dispozitiv.
              <div className="mt-2">Folosește tab-ul "Calculator" pentru a adăuga date de amortizare.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dispozitiv</TableHead>
                    <TableHead className="text-right">Cost total</TableHead>
                    <TableHead className="text-right">Economii lunare</TableHead>
                    <TableHead className="text-right">Perioada amortizare</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Acțiuni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.map((item) => {
                    const totalCost = item.initialCost + item.installationCost
                    const paybackPeriod = item.monthlySavings > 0 ? totalCost / item.monthlySavings : 0
                    const isAmortized = paybackPeriod <= item.lifespan && paybackPeriod > 0

                    return (
                      <TableRow key={item.deviceId}>
                        <TableCell className="font-medium">
                          {getDeviceName(item.deviceId)}
                          <div className="text-xs text-muted-foreground">{getDeviceType(item.deviceId)}</div>
                        </TableCell>
                        <TableCell className="text-right">{totalCost.toFixed(2)} RON</TableCell>
                        <TableCell className="text-right">{item.monthlySavings.toFixed(2)} RON</TableCell>
                        <TableCell className="text-right">
                          {paybackPeriod.toFixed(1)} luni
                          <div className="text-xs text-muted-foreground">({(paybackPeriod / 12).toFixed(1)} ani)</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={isAmortized ? "outline" : "destructive"}
                            className={`inline-flex justify-center items-center gap-1 whitespace-nowrap ${
                              isAmortized
                                ? "border-green-500 text-green-600 bg-green-50"
                                : "bg-red-700 text-white border-red-800 hover:bg-red-800"
                            }`}
                          >
                            {isAmortized ? (
                              <>
                                <CheckCircle className="h-3.5 w-3.5" />
                                <span>Se amortizează</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3.5 w-3.5" />
                                <span>Nu se amortizează</span>
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editează</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => onDelete(item.deviceId)}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Șterge</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog pentru editare */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editare date amortizare</DialogTitle>
            <DialogDescription>
              Actualizează datele de amortizare pentru {editingData ? getDeviceName(editingData.deviceId) : ""}
            </DialogDescription>
          </DialogHeader>

          {editingData && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-initialCost">Cost inițial (RON)</Label>
                  <Input
                    id="edit-initialCost"
                    type="number"
                    min="0"
                    value={editingData.initialCost === 0 ? "" : editingData.initialCost}
                    onChange={(e) =>
                      setEditingData({
                        ...editingData,
                        initialCost: e.target.value === "" ? 0 : Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-installationCost">Cost instalare (RON)</Label>
                  <Input
                    id="edit-installationCost"
                    type="number"
                    min="0"
                    value={editingData.installationCost === 0 ? "" : editingData.installationCost}
                    onChange={(e) =>
                      setEditingData({
                        ...editingData,
                        installationCost: e.target.value === "" ? 0 : Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-monthlySavings">Economii lunare estimate (RON)</Label>
                <Input
                  id="edit-monthlySavings"
                  type="number"
                  min="0"
                  value={editingData.monthlySavings === 0 ? "" : editingData.monthlySavings}
                  onChange={(e) =>
                    setEditingData({
                      ...editingData,
                      monthlySavings: e.target.value === "" ? 0 : Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="edit-lifespan">
                    Durata de viață estimată: {Math.floor(editingData.lifespan / 12)} ani ({editingData.lifespan} luni)
                  </Label>
                </div>
                <Slider
                  id="edit-lifespan"
                  min={12}
                  max={120}
                  step={12}
                  value={[editingData.lifespan]}
                  onValueChange={(value) =>
                    setEditingData({
                      ...editingData,
                      lifespan: value[0],
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-notes">Note</Label>
                <Input
                  id="edit-notes"
                  value={editingData.notes || ""}
                  onChange={(e) =>
                    setEditingData({
                      ...editingData,
                      notes: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Anulează
            </Button>
            <Button onClick={handleUpdate}>Salvează modificările</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
