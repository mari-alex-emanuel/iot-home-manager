"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Thermometer, Snowflake, Flame, AppWindowIcon as WindowIcon, AlertTriangle } from "lucide-react"
import { useSmartHome } from "@/contexts/smart-home-context"
import { IconWrapper } from "@/components/ui/icon-wrapper"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TemperatureControlProps {
  roomId: number
}

export function TemperatureControl({ roomId }: TemperatureControlProps) {
  const { getRoomById, updateRoom, getDevicesByRoomId, updateDevice, data } = useSmartHome()
  const room = getRoomById(roomId)

  // Default temperature range if not set
  const defaultMin = 20
  const defaultMax = 24

  const [minTemp, setMinTemp] = useState(room?.temperatureRange?.min || defaultMin)
  const [maxTemp, setMaxTemp] = useState(room?.temperatureRange?.max || defaultMax)
  const [isEditing, setIsEditing] = useState(false)

  // Get thermostats, AC, heating and window devices in this room
  const devices = getDevicesByRoomId(roomId)
  const thermostats = devices.filter((d) => d.type === "thermostat" && d.status === "Online")
  const acDevices = devices.filter((d) => d.type === "ac")
  const heatingDevices = devices.filter((d) => d.type === "heating")
  const windowDevices = devices.filter((d) => d.type === "window" && d.status === "Online")

  // Check if any window is open - use only isOpen property
  const isAnyWindowOpen = windowDevices.some((d) => d.isOpen === true)

  // Extract current temperature from thermostat
  const extractTemperature = (device: any) => {
    if (!device) return null

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

  // Get current temperature from the first available thermostat
  const currentTemperature = thermostats.length > 0 ? extractTemperature(thermostats[0]) : null

  // Save temperature range
  const saveTemperatureRange = () => {
    if (room) {
      updateRoom(roomId, {
        temperatureRange: {
          min: minTemp,
          max: maxTemp,
        },
      })
      setIsEditing(false)
    }
  }

  // Toggle AC or heating manually
  const toggleDevice = (deviceId: number, newStatus: "Online" | "Offline", manualOverride = true) => {
    updateDevice(deviceId, {
      status: newStatus,
      lastActive: "Just now",
      manualOverride: manualOverride,
    })
  }

  // Adăugăm o funcție pentru a reseta modul manual și a reveni la modul automat
  const resetToAutoMode = (deviceId: number) => {
    updateDevice(deviceId, {
      manualOverride: false,
      lastActive: "Just now",
    })
  }

  // Toggle window open/closed status
  const toggleWindow = (deviceId: number) => {
    const device = data.devices.find((d) => d.id === deviceId)
    if (!device) return

    updateDevice(deviceId, {
      isOpen: !device.isOpen,
      lastActive: "Just now",
    })
  }

  // Control AC and heating devices based on temperature
  useEffect(() => {
    if (currentTemperature === null) return

    // Folosim intervalul setat sau cel implicit
    const tempRange = room?.temperatureRange || { min: defaultMin, max: defaultMax }

    // If any window is open, turn off both AC and heating
    if (isAnyWindowOpen) {
      ;[...acDevices, ...heatingDevices].forEach((device) => {
        if (device.status !== "Offline" && !device.manualOverride) {
          updateDevice(device.id, {
            status: "Offline",
            lastActive: "Just now",
            manualOverride: false,
          })
        }
      })
      return
    }

    // If temperature is above max, turn on AC and turn off heating
    if (currentTemperature > tempRange.max) {
      acDevices.forEach((device) => {
        if (device.status !== "Online" && !device.manualOverride) {
          updateDevice(device.id, {
            status: "Online",
            lastActive: "Just now",
            manualOverride: false,
          })
        }
      })

      heatingDevices.forEach((device) => {
        if (device.status !== "Offline" && !device.manualOverride) {
          updateDevice(device.id, {
            status: "Offline",
            lastActive: "Just now",
            manualOverride: false,
          })
        }
      })
    }
    // If temperature is below min, turn on heating and turn off AC
    else if (currentTemperature < tempRange.min) {
      heatingDevices.forEach((device) => {
        if (device.status !== "Online" && !device.manualOverride) {
          updateDevice(device.id, {
            status: "Online",
            lastActive: "Just now",
            manualOverride: false,
          })
        }
      })

      acDevices.forEach((device) => {
        if (device.status !== "Offline" && !device.manualOverride) {
          updateDevice(device.id, {
            status: "Offline",
            lastActive: "Just now",
            manualOverride: false,
          })
        }
      })
    }
    // If temperature is within range, turn off both AC and heating
    else {
      ;[...acDevices, ...heatingDevices].forEach((device) => {
        if (device.status !== "Offline" && !device.manualOverride) {
          updateDevice(device.id, {
            status: "Offline",
            lastActive: "Just now",
            manualOverride: false,
          })
        }
      })
    }
  }, [currentTemperature, room?.temperatureRange, data.devices, isAnyWindowOpen])

  if (!room) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Thermometer className="mr-2 h-5 w-5" />
          Temperature Control
        </CardTitle>
        <CardDescription>Set temperature range for automatic climate control</CardDescription>
      </CardHeader>
      <CardContent>
        {currentTemperature !== null ? (
          <div className="mb-6 text-center">
            <div className="text-3xl font-bold">{currentTemperature.toFixed(1)}°C</div>
            <div className="text-sm text-muted-foreground">Current Temperature</div>
          </div>
        ) : (
          <div className="mb-6 text-center text-muted-foreground">No active thermostat in this room</div>
        )}

        <div className="space-y-6">
          {isEditing ? (
            <>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Minimum Temperature: {minTemp}°C</span>
                    <IconWrapper icon={Flame} color="text-orange-500" />
                  </div>
                  <Slider
                    value={[minTemp]}
                    min={15}
                    max={30}
                    step={0.5}
                    onValueChange={(value) => setMinTemp(value[0])}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span>Maximum Temperature: {maxTemp}°C</span>
                    <IconWrapper icon={Snowflake} color="text-blue-500" />
                  </div>
                  <Slider
                    value={[maxTemp]}
                    min={15}
                    max={30}
                    step={0.5}
                    onValueChange={(value) => setMaxTemp(value[0])}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={saveTemperatureRange}>Save</Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <IconWrapper icon={Flame} color="text-orange-500" />
                    <span className="ml-2">Heating activates below</span>
                  </div>
                  <span className="font-medium">{room.temperatureRange?.min || defaultMin}°C</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <IconWrapper icon={Snowflake} color="text-blue-500" />
                    <span className="ml-2">AC activates above</span>
                  </div>
                  <span className="font-medium">{room.temperatureRange?.max || defaultMax}°C</span>
                </div>
              </div>

              {/* Window status warning */}
              {isAnyWindowOpen && (
                <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md flex items-center">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                  <span className="text-sm text-yellow-700">Window open - climate control is disabled</span>
                </div>
              )}

              {/* Manual controls for AC and heating */}
              <div className="mt-4 border-t pt-4">
                <h3 className="text-sm font-medium mb-3">Manual Control</h3>
                <div className="space-y-3">
                  {acDevices.map((device) => (
                    <div key={device.id} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Snowflake className="h-4 w-4 mr-2 text-blue-500" />
                        <span>{device.name}</span>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center">
                              {device.manualOverride && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => resetToAutoMode(device.id)}
                                  className="mr-2 text-xs h-7 px-2"
                                >
                                  Auto
                                </Button>
                              )}
                              <Switch
                                checked={device.status === "Online"}
                                onCheckedChange={(checked) => {
                                  toggleDevice(device.id, checked ? "Online" : "Offline")
                                }}
                                disabled={isAnyWindowOpen}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isAnyWindowOpen ? (
                              <p>Close window to enable climate control</p>
                            ) : (
                              <p>{device.status === "Online" ? "Turn off" : "Turn on"} AC</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ))}

                  {heatingDevices.map((device) => (
                    <div key={device.id} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Flame className="h-4 w-4 mr-2 text-orange-500" />
                        <span>{device.name}</span>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center">
                              {device.manualOverride && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => resetToAutoMode(device.id)}
                                  className="mr-2 text-xs h-7 px-2"
                                >
                                  Auto
                                </Button>
                              )}
                              <Switch
                                checked={device.status === "Online"}
                                onCheckedChange={(checked) => {
                                  toggleDevice(device.id, checked ? "Online" : "Offline")
                                }}
                                disabled={isAnyWindowOpen}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isAnyWindowOpen ? (
                              <p>Close window to enable climate control</p>
                            ) : (
                              <p>{device.status === "Online" ? "Turn off" : "Turn on"} heating</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ))}

                  {acDevices.length === 0 && heatingDevices.length === 0 && (
                    <div className="text-center text-muted-foreground py-2">No climate devices in this room</div>
                  )}
                </div>
              </div>

              {/* Window status */}
              <div className="mt-4 border-t pt-4">
                <h3 className="text-sm font-medium mb-3">Windows</h3>
                <div className="space-y-3">
                  {windowDevices.map((device) => (
                    <div key={device.id} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <WindowIcon className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{device.name}</span>
                      </div>
                      <Button
                        variant={device.isOpen ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => toggleWindow(device.id)}
                      >
                        {device.isOpen ? "Close" : "Open"}
                      </Button>
                    </div>
                  ))}

                  {windowDevices.length === 0 && (
                    <div className="text-center text-muted-foreground py-2">No window sensors in this room</div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <div className="text-sm font-medium">Climate Devices</div>
                  <div className="text-sm text-muted-foreground">
                    {acDevices.length} AC, {heatingDevices.length} Heating
                  </div>
                </div>
                <Button onClick={() => setIsEditing(true)}>Edit Range</Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
