"use client"

import { useState, useEffect } from "react"
import { useSmartHome } from "@/contexts/smart-home-context"
import type { Device } from "@/lib/types"

export function useDevice<T extends Device>(deviceId: number) {
  const { getDeviceById, updateDevice } = useSmartHome()
  const [device, setDevice] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchedDevice = getDeviceById(deviceId) as T | undefined
    setDevice(fetchedDevice || null)
    setLoading(false)
  }, [deviceId, getDeviceById])

  const updateDeviceState = (data: Partial<Omit<T, "id" | "type">>) => {
    if (!device) return

    // Actualizăm starea locală pentru feedback imediat
    setDevice({ ...device, ...data } as T)

    // Actualizăm starea în context
    updateDevice<T>(deviceId, data)
  }

  const togglePower = () => {
    if (!device) return

    const newStatus = device.status === "Online" ? "Offline" : "Online"
    updateDeviceState({
      status: newStatus,
      lastActive: "Just now",
    } as Partial<Omit<T, "id" | "type">>)
  }

  return {
    device,
    loading,
    updateDeviceState,
    togglePower,
  }
}
