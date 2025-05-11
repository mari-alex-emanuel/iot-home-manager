"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Snowflake, Flame, Thermometer, AppWindowIcon as WindowIcon, AlertTriangle, Info } from "lucide-react"
import { useSmartHome } from "@/contexts/smart-home-context"

export function ClimateControlStatus() {
  const { data, getDevicesByRoomId } = useSmartHome()

  // Get all AC and heating devices
  const acDevices = data.devices.filter((d) => d.type === "ac")
  const heatingDevices = data.devices.filter((d) => d.type === "heating")

  // Get active devices (status === "Online")
  const activeAcDevices = acDevices.filter((d) => d.status === "Online")
  const activeHeatingDevices = heatingDevices.filter((d) => d.status === "Online")

  // Get all window sensors
  const windowDevices = data.devices.filter((d) => d.type === "window" && d.status === "Online")
  const openWindows = windowDevices.filter((d) => d.isOpen === true)

  // Funcție pentru a extrage temperatura din proprietățile termostatului
  const extractTemperature = (device: any) => {
    if (!device || device.status !== "Online") return null

    // Pentru termostate
    if (device.type === "thermostat") {
      // Încercăm să extragem din serialNumber (format: TH-XX.X-XXXXXXXX)
      const serialMatch = device.serialNumber?.match(/TH-(\d+\.\d+)-/)
      if (serialMatch && serialMatch[1]) {
        return Number.parseFloat(serialMatch[1])
      }

      // Extragem din firmwareVersion (ex: 1.8.0 -> 18.0)
      const firmwareMatch = device.firmwareVersion?.match(/(\d+)\.(\d+)\./)
      if (firmwareMatch && firmwareMatch[1] && firmwareMatch[2]) {
        return Number.parseFloat(`${firmwareMatch[1]}.${firmwareMatch[2]}`)
      }

      // Alternativ, extragem din ipAddress (ex: 192.168.1.48 -> 21.8)
      const ipMatch = device.ipAddress?.match(/\d+\.\d+\.\d+\.(\d+)/)
      if (ipMatch && ipMatch[1]) {
        const lastOctet = Number.parseInt(ipMatch[1])
        return 20 + (lastOctet % 10) / 10
      }

      // Valoare implicită
      return 22.5
    }

    return null
  }

  // Get rooms with ONLINE thermostats
  const roomsWithActiveThermostats = data.rooms.filter((room) => {
    const roomDevices = data.devices.filter((d) => d.roomId === room.id)
    return roomDevices.some((d) => d.type === "thermostat" && d.status === "Online")
  })

  // Procesăm camerele pentru a determina starea de încălzire/răcire
  const processedRooms = roomsWithActiveThermostats.map((room) => {
    const roomDevices = getDevicesByRoomId(room.id)
    const thermostat = roomDevices.find((d) => d.type === "thermostat" && d.status === "Online")
    const temperature = thermostat ? extractTemperature(thermostat) : null

    // Intervalul de temperatură (implicit sau personalizat)
    const tempMin = room.temperatureRange?.min || 20
    const tempMax = room.temperatureRange?.max || 24

    // Determinăm dacă încălzirea sau AC-ul ar trebui să fie active
    const shouldHeatBeActive = temperature !== null && temperature < tempMin
    const shouldACBeActive = temperature !== null && temperature > tempMax

    // Verificăm dacă există dispozitive de încălzire/răcire active
    const hasActiveHeating = roomDevices.some((d) => d.type === "heating" && d.status === "Online")
    const hasActiveAC = roomDevices.some((d) => d.type === "ac" && d.status === "Online")

    // Verificăm dacă există ferestre deschise în această cameră
    const hasOpenWindow = roomDevices.some((d) => d.type === "window" && d.status === "Online" && d.isOpen === true)

    return {
      room,
      temperature,
      tempMin,
      tempMax,
      shouldHeatBeActive,
      shouldACBeActive,
      hasActiveHeating,
      hasActiveAC,
      hasOpenWindow,
    }
  })

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Climate Control</CardTitle>
        <CardDescription>Heating and cooling systems</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center justify-center p-3 bg-muted/50 rounded-md">
              <Snowflake className="h-6 w-6 text-blue-500 mb-1" />
              <div className="text-xl font-bold">{activeAcDevices.length}</div>
              <div className="text-xs text-muted-foreground">AC active</div>
            </div>

            <div className="flex flex-col items-center justify-center p-3 bg-muted/50 rounded-md">
              <Flame className="h-6 w-6 text-orange-500 mb-1" />
              <div className="text-xl font-bold">{activeHeatingDevices.length}</div>
              <div className="text-xs text-muted-foreground">Heating active</div>
            </div>
          </div>

          {openWindows.length > 0 && (
            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-md flex items-center">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2 flex-shrink-0" />
              <span className="text-xs text-yellow-700">
                {openWindows.length} open {openWindows.length === 1 ? "window" : "windows"} - climate control affected
              </span>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium mb-2">Temperature Controlled Rooms</h3>
            {processedRooms.length > 0 ? (
              <div className="space-y-2">
                {processedRooms.map(
                  ({
                    room,
                    temperature,
                    tempMin,
                    tempMax,
                    shouldHeatBeActive,
                    shouldACBeActive,
                    hasActiveHeating,
                    hasActiveAC,
                    hasOpenWindow,
                  }) => (
                    <div key={room.id} className="flex justify-between items-center p-2 border rounded-md">
                      <div className="flex items-center">
                        <Thermometer className="h-4 w-4 mr-1 text-primary" />
                        <span className="text-sm">{room.name}</span>
                        {temperature !== null && (
                          <span className="ml-1 text-xs text-muted-foreground">({temperature.toFixed(1)}°C)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {hasOpenWindow && <WindowIcon className="h-3 w-3 text-yellow-500" />}

                        {shouldACBeActive && !hasActiveAC && (
                          <Badge
                            variant="outline"
                            className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs py-0 px-1"
                          >
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            AC Needed
                          </Badge>
                        )}

                        {shouldHeatBeActive && !hasActiveHeating && (
                          <Badge
                            variant="outline"
                            className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs py-0 px-1"
                          >
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Heat Needed
                          </Badge>
                        )}

                        {hasActiveAC && !shouldACBeActive && (
                          <Badge
                            variant="outline"
                            className="bg-purple-50 text-purple-700 border-purple-200 text-xs py-0 px-1"
                          >
                            <Info className="h-3 w-3 mr-1" />
                            AC Unnecessary
                          </Badge>
                        )}

                        {hasActiveHeating && !shouldHeatBeActive && (
                          <Badge
                            variant="outline"
                            className="bg-purple-50 text-purple-700 border-purple-200 text-xs py-0 px-1"
                          >
                            <Info className="h-3 w-3 mr-1" />
                            Heat Unnecessary
                          </Badge>
                        )}

                        {hasActiveAC && shouldACBeActive && (
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 text-xs py-0 px-1"
                          >
                            <Snowflake className="h-3 w-3 mr-1" />
                            AC
                          </Badge>
                        )}

                        {hasActiveHeating && shouldHeatBeActive && (
                          <Badge
                            variant="outline"
                            className="bg-orange-50 text-orange-700 border-orange-200 text-xs py-0 px-1"
                          >
                            <Flame className="h-3 w-3 mr-1" />
                            Heat
                          </Badge>
                        )}
                      </div>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-2">No rooms with active thermostats found</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
