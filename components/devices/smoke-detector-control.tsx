"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Bell, BellOff, AlertTriangle, ShieldCheck, AlarmSmokeIcon as Smoke, Flame, ShieldAlert } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import type { SmokeDetectorDevice } from "@/lib/types"
import { useDeviceControl } from "@/hooks/use-device-control"

interface SmokeDetectorControlProps {
  deviceId: number
}

export function SmokeDetectorControl({ deviceId }: SmokeDetectorControlProps) {
  const { device, isActive, updateMultipleStates } = useDeviceControl<SmokeDetectorDevice>(deviceId)
  const [smokeDetected, setSmokeDetected] = useState(false)
  const [alarmActive, setAlarmActive] = useState(false)
  const [batteryLevel, setBatteryLevel] = useState(100)
  const [testInProgress, setTestInProgress] = useState(false)
  const [testProgress, setTestProgress] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (device) {
      setSmokeDetected(device.smokeDetected || false)
      setAlarmActive(device.alarmActive || false)

      // Extrage nivelul bateriei din string
      if (device.batteryLevel) {
        const match = device.batteryLevel.match(/(\d+)%?/)
        if (match && match[1]) {
          setBatteryLevel(Number.parseInt(match[1], 10))
        }
      }
    }

    // Cleanup interval la unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [device])

  // Efect separat pentru a gestiona finalizarea testului
  useEffect(() => {
    if (testProgress === 100 && testInProgress) {
      // Actualizăm starea doar când testul s-a finalizat
      setSmokeDetected(true)
      setAlarmActive(true)
      setTestInProgress(false)

      // Actualizăm starea în context într-un efect separat
      updateMultipleStates({
        smokeDetected: true,
        alarmActive: true,
      })
    }
  }, [testProgress, testInProgress, updateMultipleStates])

  const testAlarm = () => {
    // Curățăm orice interval existent
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    setTestInProgress(true)
    setTestProgress(0)

    // Simulăm un test care durează 5 secunde
    intervalRef.current = setInterval(() => {
      setTestProgress((prev) => {
        const newProgress = prev + 20
        if (newProgress >= 100) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          return 100
        }
        return newProgress
      })
    }, 1000)
  }

  const resetAlarm = () => {
    setSmokeDetected(false)
    setAlarmActive(false)

    // Actualizăm starea în context separat de actualizarea stării locale
    setTimeout(() => {
      updateMultipleStates({
        smokeDetected: false,
        alarmActive: false,
      })
    }, 0)
  }

  if (!device) {
    return <div>Loading...</div>
  }

  // Determinăm culoarea pentru nivelul bateriei
  const getBatteryColor = () => {
    if (batteryLevel >= 70) return "bg-green-500"
    if (batteryLevel >= 30) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className={alarmActive ? "bg-red-500 text-white animate-pulse" : ""}>
        <CardTitle className="flex items-center">
          {alarmActive ? <AlertTriangle className="mr-2 h-5 w-5" /> : <Smoke className="mr-2 h-5 w-5" />}
          {alarmActive ? "ALARM ACTIVE" : "Smoke Detector Control"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 mt-4">
        {/* Status Display */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center p-3 rounded-md bg-background">
              <div className="text-sm text-muted-foreground mb-1">Status</div>
              <div className="flex items-center">
                {isActive ? (
                  <ShieldCheck className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <ShieldAlert className="h-5 w-5 text-red-500 mr-2" />
                )}
                <span className={`font-medium ${isActive ? "text-green-500" : "text-red-500"}`}>
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-3 rounded-md bg-background">
              <div className="text-sm text-muted-foreground mb-1">Smoke</div>
              <div className="flex items-center">
                {smokeDetected ? (
                  <Flame className="h-5 w-5 text-red-500 mr-2" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-gray-400 mr-2" />
                )}
                <span className={`font-medium ${smokeDetected ? "text-red-500" : "text-gray-500"}`}>
                  {smokeDetected ? "Detected" : "Clear"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Battery Level */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Battery Level</Label>
            <span className="font-medium">{batteryLevel}%</span>
          </div>
          <Progress value={batteryLevel} className={`h-2 ${getBatteryColor()}`} />
        </div>

        {/* Alarm Status */}
        <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
          <div className="flex items-center">
            {alarmActive ? (
              <Bell className="h-5 w-5 text-red-500 mr-2" />
            ) : (
              <BellOff className="h-5 w-5 text-gray-400 mr-2" />
            )}
            <Label>Alarm Status</Label>
          </div>
          <span className={`font-medium ${alarmActive ? "text-red-500" : "text-gray-500"}`}>
            {alarmActive ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Controls */}
        {isActive && (
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={testAlarm}
              disabled={testInProgress || alarmActive}
              className="relative overflow-hidden"
            >
              {testInProgress && (
                <div className="absolute inset-0 bg-primary/20" style={{ width: `${testProgress}%` }} />
              )}
              <span className="relative z-10">Test Alarm</span>
            </Button>
            <Button
              variant={alarmActive ? "destructive" : "outline"}
              onClick={resetAlarm}
              disabled={!alarmActive && !smokeDetected}
            >
              Reset Alarm
            </Button>
          </div>
        )}

        {/* Notification */}
        {alarmActive && (
          <div className="p-3 bg-red-100 border border-red-300 rounded-md text-red-800 animate-pulse">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span className="font-medium">SMOKE DETECTED! Please check the area immediately.</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
