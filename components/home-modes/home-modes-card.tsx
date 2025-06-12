"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
// Importăm noul hook pentru notificări
import { useCustomToast } from "@/components/toast-provider"
import { useSmartHome } from "@/contexts/smart-home-context"
import { ChevronDown, ChevronUp, DoorClosed, Lightbulb, Thermometer, Home, RotateCcw } from "lucide-react"
import { isDoorDevice, isLightDevice, isThermostatDevice, isACDevice, isHeatingDevice } from "@/lib/device-utils"

// Tipuri pentru starea salvată
interface SavedDeviceState {
  id: number
  status?: string
  isLocked?: boolean
  temperature?: number
  lastActive: string
}

// Salvăm întreaga cameră pentru a fi siguri că restaurăm toate proprietățile
interface SavedRoomState {
  id: number
  name: string
  type: string
  devices: number[]
  temperatureRange: {
    min: number
    max: number
  }
}

// Constante pentru localStorage
const AWAY_MODE_ACTIVE_KEY = "awayModeActive"
const SAVED_DEVICE_STATES_KEY = "awayModeSavedDeviceStates"
const SAVED_ROOM_STATES_KEY = "awayModeSavedRoomStates"
const AWAY_MODE_OPTIONS_KEY = "awayModeOptions"

export function HomeModesCard() {
  const { data, updateDevice, updateRoom } = useSmartHome()
  // Folosim noul hook pentru notificări
  const { showToast } = useCustomToast()
  const originalRoomsRef = useRef<SavedRoomState[]>([])

  const [isAwayModeActive, setIsAwayModeActive] = useState<boolean>(false)
  const [savedDeviceStates, setSavedDeviceStates] = useState<SavedDeviceState[]>([])
  const [options, setOptions] = useState({
    turnOffLights: true,
    lockDoors: true,
    setTemperature: true,
    targetTemperature: 21,
  })
  const [showDetails, setShowDetails] = useState(false)

  // Încarcă starea din localStorage la inițializare
  useEffect(() => {
    // Încarcă starea modului
    const savedAwayModeActive = localStorage.getItem(AWAY_MODE_ACTIVE_KEY)
    if (savedAwayModeActive) {
      setIsAwayModeActive(savedAwayModeActive === "true")
    }

    // Încarcă stările salvate ale dispozitivelor
    const savedDeviceStatesJson = localStorage.getItem(SAVED_DEVICE_STATES_KEY)
    if (savedDeviceStatesJson) {
      try {
        setSavedDeviceStates(JSON.parse(savedDeviceStatesJson))
      } catch (error) {
        console.error("Eroare la parsarea stărilor dispozitivelor:", error)
      }
    }

    // Încarcă stările salvate ale camerelor
    const savedRoomStatesJson = localStorage.getItem(SAVED_ROOM_STATES_KEY)
    if (savedRoomStatesJson) {
      try {
        const parsedRoomStates = JSON.parse(savedRoomStatesJson)
        originalRoomsRef.current = parsedRoomStates
      } catch (error) {
        console.error("Eroare la parsarea stărilor camerelor:", error)
      }
    }

    // Încarcă opțiunile modului
    const savedOptionsJson = localStorage.getItem(AWAY_MODE_OPTIONS_KEY)
    if (savedOptionsJson) {
      try {
        setOptions(JSON.parse(savedOptionsJson))
      } catch (error) {
        console.error("Eroare la parsarea opțiunilor:", error)
      }
    }
  }, [])

  // Verificăm dacă există dispozitive care pot fi actualizate
  const hasActiveLights = data.devices.some((device) => isLightDevice(device) && device.status === "Online")
  const hasUnlockedClosedDoors = data.devices.some(
    (device) => isDoorDevice(device) && !device.isOpen && !device.isLocked,
  )
  const hasThermostatDevices = data.devices.some(
    (device) => isThermostatDevice(device) || isACDevice(device) || isHeatingDevice(device),
  )

  const toggleDetails = () => {
    setShowDetails(!showDetails)
  }

  const updateOption = (key: keyof typeof options, value: any) => {
    const newOptions = { ...options, [key]: value }
    setOptions(newOptions)
    localStorage.setItem(AWAY_MODE_OPTIONS_KEY, JSON.stringify(newOptions))
  }

  // Salvează starea curentă înainte de a face modificări
  const saveCurrentState = () => {
    // Salvăm starea dispozitivelor care vor fi modificate
    const devicesToSave: SavedDeviceState[] = []

    // Salvăm luminile care sunt aprinse
    if (options.turnOffLights) {
      const activeLights = data.devices.filter((device) => isLightDevice(device) && device.status === "Online")
      for (const light of activeLights) {
        devicesToSave.push({
          id: light.id,
          status: light.status,
          lastActive: light.lastActive,
        })
      }
    }

    // Salvăm ușile care vor fi blocate
    if (options.lockDoors) {
      const closedDoors = data.devices.filter((device) => isDoorDevice(device) && !device.isOpen && !device.isLocked)
      for (const door of closedDoors) {
        devicesToSave.push({
          id: door.id,
          isLocked: door.isLocked,
          lastActive: door.lastActive,
        })
      }
    }

    // Salvăm dispozitivele de temperatură
    if (options.setTemperature) {
      const temperatureDevices = data.devices.filter(
        (device) => isThermostatDevice(device) || isACDevice(device) || isHeatingDevice(device),
      )
      for (const device of temperatureDevices) {
        devicesToSave.push({
          id: device.id,
          temperature: device.temperature,
          lastActive: device.lastActive,
        })
      }

      // Salvăm camerele cu valorile de temperatură
      const roomsToSave: SavedRoomState[] = data.rooms.map((room) => {
        // Folosim valorile existente din cameră, fără a hardcoda valori implicite
        return {
          id: room.id,
          name: room.name,
          type: room.type,
          devices: [...room.devices],
          temperatureRange: room.temperatureRange || {
            // Obținem valorile implicite din altă cameră care are temperatureRange setat
            min: data.rooms.find((r) => r.temperatureRange)?.temperatureRange?.min || 20,
            max: data.rooms.find((r) => r.temperatureRange)?.temperatureRange?.max || 24,
          },
        }
      })

      originalRoomsRef.current = roomsToSave
      localStorage.setItem(SAVED_ROOM_STATES_KEY, JSON.stringify(roomsToSave))
    }

    setSavedDeviceStates(devicesToSave)
    localStorage.setItem(SAVED_DEVICE_STATES_KEY, JSON.stringify(devicesToSave))
  }

  const activateAwayMode = () => {
    // Salvăm starea curentă înainte de a face modificări
    saveCurrentState()

    let affectedDevices = 0

    // 1. Stinge toate luminile
    if (options.turnOffLights) {
      const activeLights = data.devices.filter((device) => isLightDevice(device) && device.status === "Online")
      for (const light of activeLights) {
        updateDevice(
          light.id,
          {
            status: "Offline",
            lastActive: "Just now",
          },
          true,
        ) // Bypass permission check
        affectedDevices++
      }
    }

    // 2. Blochează ușile închise
    if (options.lockDoors) {
      const closedDoors = data.devices.filter((device) => isDoorDevice(device) && !device.isOpen && !device.isLocked)
      for (const door of closedDoors) {
        updateDevice(
          door.id,
          {
            isLocked: true,
            lastActive: "Just now",
          },
          true,
        ) // Bypass permission check
        affectedDevices++
      }
    }

    // 3. Setează temperatura în toate camerele
    if (options.setTemperature) {
      // Actualizăm temperatura pentru toate camerele
      for (const room of data.rooms) {
        updateRoom(
          room.id,
          {
            temperatureRange: {
              min: options.targetTemperature - 1,
              max: options.targetTemperature + 1,
            },
          },
          true,
        ) // Bypass permission check
        affectedDevices++
      }

      // Actualizăm și dispozitivele de temperatură
      const temperatureDevices = data.devices.filter(
        (device) => isThermostatDevice(device) || isACDevice(device) || isHeatingDevice(device),
      )

      for (const device of temperatureDevices) {
        updateDevice(
          device.id,
          {
            temperature: options.targetTemperature,
            lastActive: "Just now",
          },
          true,
        ) // Bypass permission check
        affectedDevices++
      }
    }

    // Setăm modul ca activ și salvăm în localStorage
    setIsAwayModeActive(true)
    localStorage.setItem(AWAY_MODE_ACTIVE_KEY, "true")

    // Afișează notificare de confirmare folosind noul sistem
    showToast({
      title: "Mod Plecat activat",
      description: `${affectedDevices} dispozitive au fost actualizate.`,
      duration: 5000,
      variant: "success",
    })
  }

  const deactivateAwayMode = () => {
    let restoredDevices = 0

    // Restaurăm starea dispozitivelor
    for (const savedDevice of savedDeviceStates) {
      const updateData: any = { lastActive: "Just now" }

      if (savedDevice.status !== undefined) {
        updateData.status = savedDevice.status
      }

      if (savedDevice.isLocked !== undefined) {
        updateData.isLocked = savedDevice.isLocked
      }

      if (savedDevice.temperature !== undefined) {
        updateData.temperature = savedDevice.temperature
      }

      updateDevice(savedDevice.id, updateData, true) // Bypass permission check
      restoredDevices++
    }

    // Restaurăm starea camerelor
    for (const savedRoom of originalRoomsRef.current) {
      // Verificăm dacă camera există
      const room = data.rooms.find((r) => r.id === savedRoom.id)
      if (!room) continue

      // Actualizăm camera cu valorile salvate
      updateRoom(
        savedRoom.id,
        {
          temperatureRange: {
            min: savedRoom.temperatureRange.min,
            max: savedRoom.temperatureRange.max,
          },
        },
        true,
      ) // Bypass permission check
      restoredDevices++
    }

    // Dezactivăm modul și actualizăm localStorage
    setIsAwayModeActive(false)
    localStorage.setItem(AWAY_MODE_ACTIVE_KEY, "false")

    // Resetăm stările salvate
    setSavedDeviceStates([])
    localStorage.removeItem(SAVED_DEVICE_STATES_KEY)
    localStorage.removeItem(SAVED_ROOM_STATES_KEY)

    // Afișează notificare folosind noul sistem
    showToast({
      title: "Mod Plecat dezactivat",
      description: `${restoredDevices} dispozitive au fost restaurate la starea anterioară.`,
      duration: 5000,
      variant: "success",
    })
  }

  // Verifică dacă există dispozitive care pot fi actualizate
  const hasDevicesToUpdate =
    (options.turnOffLights && hasActiveLights) ||
    (options.lockDoors && hasUnlockedClosedDoors) ||
    (options.setTemperature && hasThermostatDevices)

  return (
    <Card>
      <CardHeader className="pb-2 border-b">
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5 text-green-500" />
          Mod Plecat
        </CardTitle>
        <CardDescription>Pregătește casa ta pentru când pleci</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {isAwayModeActive ? (
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="bg-green-100 dark:bg-green-800/30 p-2 rounded-full sm:mr-3">
              <Home className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-green-800 dark:text-green-300 font-medium">Mod Plecat este activ</h3>
              <p className="text-green-700 dark:text-green-400 text-sm mt-1">
                Casa ta este pregătită pentru absența ta. Toate setările configurate au fost aplicate.
              </p>
              <div className="mt-3 text-sm text-green-700 dark:text-green-400">
                <p>La dezactivare, toate dispozitivele vor reveni la starea lor anterioară.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <span className="text-sm">Stinge luminile</span>
              </div>
              <Switch
                checked={options.turnOffLights}
                onCheckedChange={(checked) => updateOption("turnOffLights", checked)}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <DoorClosed className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Blochează ușile închise</span>
              </div>
              <Switch checked={options.lockDoors} onCheckedChange={(checked) => updateOption("lockDoors", checked)} />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Thermometer className="h-4 w-4 text-red-500" />
                <span className="text-sm">Setează temperatura</span>
              </div>
              <Switch
                checked={options.setTemperature}
                onCheckedChange={(checked) => updateOption("setTemperature", checked)}
              />
            </div>

            {showDetails && (
              <>
                <Separator className="my-4" />

                {options.setTemperature && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="temperature">Temperatura țintă: {options.targetTemperature}°C</Label>
                    </div>
                    <Slider
                      id="temperature"
                      min={16}
                      max={28}
                      step={0.5}
                      value={[options.targetTemperature]}
                      onValueChange={(value) => updateOption("targetTemperature", value[0])}
                    />
                  </div>
                )}

                <div className="mt-4 text-sm text-muted-foreground">
                  <p className="font-medium">Rezumat acțiuni:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {options.turnOffLights && (
                      <li>
                        Stingerea tuturor luminilor aprinse (
                        {hasActiveLights ? "disponibil" : "nu există lumini aprinse"})
                      </li>
                    )}
                    {options.lockDoors && (
                      <li>
                        Blocarea ușilor închise și deblocate (
                        {hasUnlockedClosedDoors ? "disponibil" : "nu există uși de blocat"})
                      </li>
                    )}
                    {options.setTemperature && (
                      <li>
                        Setarea temperaturii la {options.targetTemperature}°C în toate camerele (
                        {hasThermostatDevices ? "disponibil" : "nu există dispozitive de temperatură"})
                      </li>
                    )}
                  </ul>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4 p-4 sm:p-6 pt-0">
        {isAwayModeActive ? (
          <Button
            onClick={deactivateAwayMode}
            className="w-full flex items-center gap-2 bg-green-100 hover:bg-green-200 text-green-800 border-green-300"
            variant="outline"
          >
            <RotateCcw className="h-4 w-4" />
            Dezactivează și restaurează starea anterioară
          </Button>
        ) : (
          <>
            <Button
              onClick={activateAwayMode}
              className="w-full bg-primary hover:bg-primary/90"
              disabled={!hasDevicesToUpdate}
            >
              Activează Mod Plecat
            </Button>
            <Button
              variant="ghost"
              className="w-full flex items-center gap-1 text-muted-foreground"
              onClick={toggleDetails}
            >
              {showDetails ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  <span>Ascunde detalii</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  <span>Arată detalii</span>
                </>
              )}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
