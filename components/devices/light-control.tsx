"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { HexColorPicker } from "react-colorful"
import { useDevice } from "@/hooks/use-device"
import type { LightDevice } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { useCustomToast } from "@/components/toast-provider"

interface LightControlProps {
  deviceId: number
}

export function LightControl({ deviceId }: LightControlProps) {
  const { device, updateDeviceState } = useDevice<LightDevice>(deviceId)
  const [brightness, setBrightness] = useState(50)
  const [color, setColor] = useState("#ffffff")
  const { isAuthenticated } = useAuth()
  const { showToast } = useCustomToast()

  useEffect(() => {
    if (device) {
      setBrightness(device.brightness || 50)
      setColor(device.color || "#ffffff")
    }
  }, [device])

  const handleBrightnessChange = (value: number[]) => {
    if (!isAuthenticated()) {
      showToast({
        title: "Permisiune refuzată",
        description: "Nu aveți permisiunea de a controla dispozitivele.",
        variant: "destructive",
      })
      return
    }

    const newBrightness = value[0]
    setBrightness(newBrightness)
    updateDeviceState({ brightness: newBrightness })
  }

  const handleColorChange = (newColor: string) => {
    if (!isAuthenticated()) {
      showToast({
        title: "Permisiune refuzată",
        description: "Nu aveți permisiunea de a controla dispozitivele.",
        variant: "destructive",
      })
      return
    }

    setColor(newColor)
    updateDeviceState({ color: newColor })
  }

  if (!device) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Light Control</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Brightness: {brightness}%</h3>
          <Slider
            value={[brightness]}
            min={0}
            max={100}
            step={1}
            onValueChange={handleBrightnessChange}
            aria-label="Brightness"
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Color</h3>
          <div className="flex justify-center">
            <HexColorPicker color={color} onChange={handleColorChange} />
          </div>
          <div className="flex justify-center mt-2">
            <div
              className="w-16 h-8 rounded-md border"
              style={{ backgroundColor: color }}
              aria-label="Selected color"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
