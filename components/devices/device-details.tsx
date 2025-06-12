"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Power } from "lucide-react"
import { ConsumptionChart } from "./consumption-chart"
import { useSmartHome } from "@/contexts/smart-home-context"
import { LightControl } from "./light-control"
import { SmokeDetectorControl } from "./smoke-detector-control"
import { MotionSensorControl } from "./motion-sensor-control"
import { isLightDevice, isMotionSensorDevice, isSmokeDetectorDevice } from "@/lib/types"

interface DeviceDetailsProps {
  id: number
}

export function DeviceDetails({ id }: DeviceDetailsProps) {
  const { getDeviceById, getRoomName, updateDevice } = useSmartHome()
  const deviceData = getDeviceById(id)
  const [isOn, setIsOn] = useState(deviceData?.status === "Online")

  useEffect(() => {
    if (deviceData) {
      setIsOn(deviceData.status === "Online")
    }
  }, [deviceData])

  if (!deviceData) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Device not found</h1>
        <p className="mt-2">The device you are looking for does not exist.</p>
        <Button asChild className="mt-4">
          <Link href="/devices">Back to Devices</Link>
        </Button>
      </div>
    )
  }

  const showConsumptionChart = isLightDevice(deviceData) || deviceData.type === "outlet"
  const roomName = getRoomName(deviceData.roomId)

  const togglePower = () => {
    const newStatus = !isOn
    setIsOn(newStatus)
    updateDevice(id, {
      status: newStatus ? "Online" : "Offline",
      lastActive: "Just now",
    })
  }

  // Verificăm dacă dispozitivul are cel puțin câteva informații tehnice
  const hasDeviceInfo = Boolean(
    deviceData.serialNumber ||
      deviceData.manufacturer ||
      deviceData.model ||
      deviceData.firmwareVersion ||
      deviceData.installationDate ||
      deviceData.ipAddress ||
      deviceData.macAddress ||
      deviceData.powerConsumption ||
      deviceData.batteryLevel,
  )

  // Determinăm ce taburi să afișăm
  const tabs = [
    ...(hasDeviceInfo ? [{ id: "info", label: "Device Info" }] : []),
    ...(isLightDevice(deviceData) ? [{ id: "control", label: "Light Control" }] : []),
    ...(isSmokeDetectorDevice(deviceData) ? [{ id: "smoke", label: "Smoke Detector" }] : []),
    ...(isMotionSensorDevice(deviceData) ? [{ id: "motion", label: "Motion Sensor" }] : []),
    ...(showConsumptionChart ? [{ id: "consumption", label: "Consumption" }] : []),
  ]

  const defaultTab = tabs.length > 0 ? tabs[0].id : ""

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <Button variant="outline" size="icon" asChild className="mr-4">
            <Link href="/devices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{deviceData.name}</h1>
            <p className="text-muted-foreground">
              {deviceData.type} • {roomName}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={isOn ? "default" : "outline"} onClick={togglePower}>
            <Power className="mr-2 h-4 w-4" />
            {isOn ? "Turn Off" : "Turn On"}
          </Button>
        </div>
      </div>

      {tabs.length > 0 && (
        <div className="overflow-x-auto">
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="flex flex-wrap h-auto">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {hasDeviceInfo && (
              <TabsContent value="info" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Device Information</CardTitle>
                    <CardDescription>Technical details about this device</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <DeviceInfoItem label="Serial Number" value={deviceData.serialNumber} />
                        <DeviceInfoItem label="Manufacturer" value={deviceData.manufacturer} />
                        <DeviceInfoItem label="Model" value={deviceData.model} />
                        <DeviceInfoItem label="Firmware Version" value={deviceData.firmwareVersion} />
                        <DeviceInfoItem label="Installation Date" value={deviceData.installationDate} />
                      </div>
                      <div className="space-y-2">
                        <DeviceInfoItem label="IP Address" value={deviceData.ipAddress} />
                        <DeviceInfoItem label="MAC Address" value={deviceData.macAddress} />
                        <DeviceInfoItem label="Power Consumption" value={deviceData.powerConsumption} />
                        <DeviceInfoItem label="Battery Level" value={deviceData.batteryLevel} />
                        <DeviceInfoItem label="Status" value={isOn ? "Online" : "Offline"} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {isLightDevice(deviceData) && (
              <TabsContent value="control" className="space-y-4">
                <LightControl deviceId={id} />
              </TabsContent>
            )}

            {isSmokeDetectorDevice(deviceData) && (
              <TabsContent value="smoke" className="space-y-4">
                <SmokeDetectorControl deviceId={id} />
              </TabsContent>
            )}

            {isMotionSensorDevice(deviceData) && (
              <TabsContent value="motion" className="space-y-4">
                <MotionSensorControl deviceId={id} />
              </TabsContent>
            )}

            {showConsumptionChart && (
              <TabsContent value="consumption" className="space-y-4">
                <ConsumptionChart deviceType={deviceData.type} deviceName={deviceData.name} />
              </TabsContent>
            )}
          </Tabs>
        </div>
      )}
    </div>
  )
}

interface DeviceInfoItemProps {
  label: string
  value?: string
}

function DeviceInfoItem({ label, value }: DeviceInfoItemProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value || "N/A"}</span>
    </div>
  )
}
