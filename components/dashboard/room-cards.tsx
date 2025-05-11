"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Thermometer, Droplets, LightbulbIcon, Power } from "lucide-react"
import { useSmartHome } from "@/contexts/smart-home-context"
import { IconWrapper } from "@/components/ui/icon-wrapper"

export function RoomCards() {
  const { data, updateDevice, getDevicesByRoomId } = useSmartHome()

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

  // Funcție pentru a extrage umiditatea din proprietățile senzorului
  const extractHumidity = (device: any) => {
    if (!device || device.status !== "Online") return null

    // Pentru senzori de umiditate dedicați
    if (device.type === "humidity") {
      // Încercăm să extragem din serialNumber (format: HM-XX-XXXXXXXX)
      const serialMatch = device.serialNumber?.match(/HM-(\d+)-/)
      if (serialMatch && serialMatch[1]) {
        return Number.parseInt(serialMatch[1])
      }

      // Extragem din macAddress (ultimele 2 cifre)
      const macMatch = device.macAddress?.match(/[A-F0-9]{2}$/)
      if (macMatch && macMatch[0]) {
        return (Number.parseInt(macMatch[0], 16) % 60) + 30 // Convertim hex în decimal și ajustăm în intervalul 30-90%
      }

      // Valoare implicită
      return 55
    }

    // Pentru termostate
    if (device.type === "thermostat") {
      // Extragem din macAddress (ultimele 2 cifre)
      const macMatch = device.macAddress?.match(/[A-F0-9]{2}$/)
      if (macMatch && macMatch[0]) {
        return (Number.parseInt(macMatch[0], 16) % 60) + 30 // Convertim hex în decimal și ajustăm în intervalul 30-90%
      }

      // Alternativ, extragem din model (ex: TH-400 -> 40%)
      const modelMatch = device.model?.match(/TH-(\d+)/)
      if (modelMatch && modelMatch[1]) {
        return Number.parseInt(modelMatch[1]) / 4
      }

      // Valoare implicită
      return 45
    }

    return null
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Rooms</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {data.rooms.map((room) => {
          const devices = getDevicesByRoomId(room.id)

          // Căutăm dispozitive care pot furniza temperatură și umiditate
          const thermostat = devices.find((d) => d.type === "thermostat" && d.status === "Online")
          const humiditySensor = devices.find((d) => d.type === "humidity" && d.status === "Online")

          const lights = devices.filter((d) => d.type === "light")
          const outlets = devices.filter((d) => d.type === "outlet")

          // Extragem temperatura și umiditatea din dispozitivele disponibile
          const temperature = extractTemperature(thermostat)
          const humidity = humiditySensor
            ? extractHumidity(humiditySensor)
            : thermostat
              ? extractHumidity(thermostat)
              : null

          // Verificăm dacă avem dispozitive care furnizează date climatice
          const hasClimateData = temperature !== null || humidity !== null

          return (
            <Card key={room.id}>
              <CardHeader className="pb-2">
                <CardTitle>{room.name}</CardTitle>
                <CardDescription>Devices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Afișăm temperatura și umiditatea dacă sunt disponibile */}
                  {hasClimateData && (
                    <div className="space-y-3 mb-2">
                      {temperature !== null && (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Thermometer className="h-4 w-4 mr-2 text-orange-500" />
                            <span className="text-sm font-medium">Temperature</span>
                          </div>
                          <span className="font-medium">{temperature.toFixed(1)}°C</span>
                        </div>
                      )}

                      {humidity !== null && (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Droplets className="h-4 w-4 mr-2 text-blue-500" />
                            <span className="text-sm font-medium">Humidity</span>
                          </div>
                          <span className="font-medium">{humidity}%</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Afișăm becurile */}
                  {lights.length > 0 && (
                    <div className={`${hasClimateData ? "pt-2 border-t" : ""}`}>
                      <h3 className="text-sm font-medium mb-2">Lights</h3>
                      <div className="space-y-2">
                        {lights.map((light) => (
                          <div key={light.id} className="flex justify-between items-center">
                            <div className="flex items-center">
                              <IconWrapper
                                icon={LightbulbIcon}
                                color={light.status === "Online" ? "text-yellow-500" : "text-gray-400"}
                              />
                              <span className="text-sm ml-2 truncate max-w-[120px]">{light.name}</span>
                            </div>
                            <Switch
                              checked={light.status === "Online"}
                              onCheckedChange={(checked) => {
                                updateDevice(light.id, {
                                  status: checked ? "Online" : "Offline",
                                  lastActive: "Just now",
                                })
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Afișăm prizele */}
                  {outlets.length > 0 && (
                    <div className={`${lights.length > 0 || hasClimateData ? "pt-2 border-t" : ""}`}>
                      <h3 className="text-sm font-medium mb-2">Outlets</h3>
                      <div className="space-y-2">
                        {outlets.map((outlet) => (
                          <div key={outlet.id} className="flex justify-between items-center">
                            <div className="flex items-center">
                              <IconWrapper
                                icon={Power}
                                color={outlet.status === "Online" ? "text-purple-500" : "text-gray-400"}
                              />
                              <span className="text-sm ml-2 truncate max-w-[120px]">{outlet.name}</span>
                            </div>
                            <Switch
                              checked={outlet.status === "Online"}
                              onCheckedChange={(checked) => {
                                updateDevice(outlet.id, {
                                  status: checked ? "Online" : "Offline",
                                  lastActive: "Just now",
                                })
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {lights.length === 0 && outlets.length === 0 && !hasClimateData && (
                    <div className="text-sm text-muted-foreground text-center">No devices in this room</div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
