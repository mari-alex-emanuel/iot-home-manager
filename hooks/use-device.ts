"use client"

import { useState, useEffect } from "react"
import { useSmartHome } from "@/contexts/smart-home-context"
import { useAuth } from "@/contexts/auth-context"
import { useCustomToast } from "@/components/toast-provider"

export function useDevice<T>(deviceId: number) {
  const { getDeviceById, updateDevice } = useSmartHome()
  const { isAuthenticated } = useAuth()
  const { showToast } = useCustomToast()
  const [device, setDevice] = useState<T | null>(null)

  useEffect(() => {
    const fetchedDevice = getDeviceById(deviceId) as T | undefined
    setDevice(fetchedDevice || null)
  }, [deviceId, getDeviceById])

  const updateDeviceState = (data: Partial<T>) => {
    if (!isAuthenticated()) {
      showToast({
        title: "Permisiune refuzată",
        description: "Nu aveți permisiunea de a controla dispozitivele.",
        variant: "destructive",
      })
      return
    }

    updateDevice(deviceId, data)
    if (device) {
      setDevice({ ...device, ...data } as T)
    }
  }

  return { device, updateDeviceState }
}
