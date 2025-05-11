"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Activity, Clock, MoveIcon as Motion, LightbulbIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { MotionSensorDevice } from "@/lib/types"
import { useDeviceControl } from "@/hooks/use-device-control"
import { useSmartHome } from "@/contexts/smart-home-context"

interface MotionSensorControlProps {
  deviceId: number
}

export function MotionSensorControl({ deviceId }: MotionSensorControlProps) {
  const { device, isActive, roomLights, updateMultipleStates } = useDeviceControl<MotionSensorDevice>(deviceId)
  const { updateDevice } = useSmartHome()
  const [autoLightControl, setAutoLightControl] = useState(false)
  const [motionDetected, setMotionDetected] = useState(false)

  useEffect(() => {
    if (device) {
      setAutoLightControl(device.autoLightControl || false)
      setMotionDetected(device.motionDetected || false)
    }
  }, [device])

  // Controlăm becurile în funcție de detecția de mișcare
  useEffect(() => {
    if (device && autoLightControl) {
      // Dacă nu este detectată mișcare, oprim toate becurile din cameră
      if (!motionDetected) {
        roomLights.forEach((light) => {
          if (light.status === "Online") {
            updateDevice(light.id, {
              status: "Offline",
              lastActive: "Just now",
            })
          }
        })
      } else {
        // Dacă este detectată mișcare, aprindem toate becurile din cameră
        roomLights.forEach((light) => {
          if (light.status === "Offline") {
            updateDevice(light.id, {
              status: "Online",
              lastActive: "Just now",
            })
          }
        })
      }
    }
  }, [motionDetected, autoLightControl, roomLights, updateDevice, device])

  const handleAutoLightControlChange = (checked: boolean) => {
    setAutoLightControl(checked)
    updateMultipleStates({ autoLightControl: checked })
  }

  const simulateMotion = () => {
    setMotionDetected(true)
    updateMultipleStates({
      motionDetected: true,
      lastMotionDetected: new Date().toLocaleTimeString(),
    })

    // Resetăm starea după 30 secunde
    setTimeout(() => {
      setMotionDetected(false)
      updateMultipleStates({
        motionDetected: false,
      })
    }, 30000)
  }

  const simulateNoMotion = () => {
    setMotionDetected(false)
    updateMultipleStates({
      motionDetected: false,
    })
  }

  const toggleLight = (lightId: number) => {
    const light = roomLights.find((l) => l.id === lightId)
    if (light) {
      const newStatus = light.status === "Online" ? "Offline" : "Online"
      updateDevice(lightId, {
        status: newStatus,
        lastActive: "Just now",
      })
    }
  }

  if (!device) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Motion className="mr-2 h-5 w-5" />
          Motion Sensor Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className={`h-5 w-5 mr-2 ${motionDetected ? "text-green-500" : "text-gray-400"}`} />
              <Label htmlFor="motion-status">Motion Status</Label>
            </div>
            <Badge variant={motionDetected ? "default" : "outline"}>
              {motionDetected ? "Motion Detected" : "No Motion"}
            </Badge>
          </div>
        </div>

        {device.lastMotionDetected && (
          <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-blue-500" />
              <span className="text-sm">Last Motion</span>
            </div>
            <span className="text-sm font-medium">{device.lastMotionDetected}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <LightbulbIcon className={`h-4 w-4 mr-2 ${autoLightControl ? "text-yellow-500" : "text-gray-400"}`} />
            <Label htmlFor="auto-light-control" className="cursor-pointer">
              Auto Light Control
            </Label>
          </div>
          <Switch id="auto-light-control" checked={autoLightControl} onCheckedChange={handleAutoLightControlChange} />
        </div>

        {/* Lights in Room Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Lights in Room</h3>
          {roomLights.length > 0 ? (
            <div className="space-y-2">
              {roomLights.map((light) => (
                <div key={light.id} className="flex justify-between items-center p-3 border rounded-md">
                  <div className="flex items-center">
                    <LightbulbIcon
                      className={`h-4 w-4 mr-2 ${light.status === "Online" ? "text-yellow-500" : "text-gray-400"}`}
                    />
                    <span>{light.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={light.status === "Online" ? "default" : "outline"}>
                      {light.status === "Online" ? "On" : "Off"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleLight(light.id)}
                      disabled={autoLightControl}
                    >
                      {light.status === "Online" ? "Turn Off" : "Turn On"}
                    </Button>
                  </div>
                </div>
              ))}
              {autoLightControl && (
                <div className="text-xs text-muted-foreground mt-1">
                  Manual control is disabled when Auto Light Control is active
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md">No lights found in this room</div>
          )}
        </div>

        {autoLightControl && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md">
              <p>When motion is detected, lights in this room will turn on automatically.</p>
              <p className="mt-1">When no motion is detected for 30 seconds, lights will turn off.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={simulateMotion} className="flex-1">
                <Activity className="mr-2 h-4 w-4" />
                Simulate Motion
              </Button>
              <Button variant="outline" onClick={simulateNoMotion} className="flex-1">
                <Activity className="mr-2 h-4 w-4 text-gray-400" />
                Simulate No Motion
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
