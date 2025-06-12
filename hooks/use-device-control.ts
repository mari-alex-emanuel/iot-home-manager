"use client"

import { useState, useEffect, useCallback } from "react"
import { useSmartHome } from "@/contexts/smart-home-context"
import { useCustomToast } from "@/components/toast-provider"
import { useAuth } from "@/contexts/auth-context"
import type { Device, LightDevice } from "@/lib/types"

type DeviceWithStatus = Device & { status: "Online" | "Offline" }

export interface DeviceControlState<T extends DeviceWithStatus> {
  device: T | null
  loading: boolean
  isActive: boolean
  roomLights: LightDevice[]
  togglePower: () => void
  updateDeviceState: <K extends keyof Omit<T, "id" | "type">>(key: K, value: T[K]) => void
  updateMultipleStates: (data: Partial<Omit<T, "id" | "type">>) => void
}

export function useDeviceControl<T extends DeviceWithStatus>(deviceId: number): DeviceControlState<T> {
  const { getDeviceById, updateDevice, getDevicesByRoomId } = useSmartHome()
  const { showToast } = useCustomToast()
  const { isAuthenticated } = useAuth()
  const [device, setDevice] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [roomLights, setRoomLights] = useState<LightDevice[]>([])

  useEffect(() => {
    const fetchedDevice = getDeviceById(deviceId) as T | undefined
    setDevice(fetchedDevice || null)
    setLoading(false)

    // Obținem toate becurile din aceeași cameră
    if (fetchedDevice) {
      const allDevicesInRoom = getDevicesByRoomId(fetchedDevice.roomId)
      const lightsInRoom = allDevicesInRoom.filter((d) => d.type === "light") as LightDevice[]
      setRoomLights(lightsInRoom)
    }
  }, [deviceId, getDeviceById, getDevicesByRoomId])

  const isActive = device?.status === "Online"

  const togglePower = useCallback(() => {
    if (!device) return

    // Verificăm dacă utilizatorul are permisiunea de a controla dispozitivele
    if (!isAuthenticated()) {
      showToast({
        title: "Permisiune refuzată",
        description: "Nu aveți permisiunea de a controla dispozitivele.",
        variant: "destructive",
      })
      return
    }

    const newStatus = device.status === "Online" ? "Offline" : "Online"
    updateDevice<T>(deviceId, {
      status: newStatus,
      lastActive: "Just now",
    } as Partial<Omit<T, "id" | "type">>)

    setDevice({
      ...device,
      status: newStatus,
      lastActive: "Just now",
    } as T)
  }, [device, deviceId, updateDevice, isAuthenticated, showToast])

  const updateDeviceState = useCallback(
    <K extends keyof Omit<T, "id" | "type">>(key: K, value: T[K]) => {
      if (!device) return

      // Verificăm dacă utilizatorul are permisiunea de a controla dispozitivele
      if (!isAuthenticated()) {
        showToast({
          title: "Permisiune refuzată",
          description: "Nu aveți permisiunea de a controla dispozitivele.",
          variant: "destructive",
        })
        return
      }

      const updateData = {
        [key]: value,
        lastActive: "Just now",
      } as Partial<Omit<T, "id" | "type">>

      updateDevice<T>(deviceId, updateData)

      setDevice({
        ...device,
        [key]: value,
        lastActive: "Just now",
      } as T)
    },
    [device, deviceId, updateDevice, isAuthenticated, showToast],
  )

  const updateMultipleStates = useCallback(
    (data: Partial<Omit<T, "id" | "type">>) => {
      if (!device) return

      // Verificăm dacă utilizatorul are permisiunea de a controla dispozitivele
      if (!isAuthenticated()) {
        showToast({
          title: "Permisiune refuzată",
          description: "Nu aveți permisiunea de a controla dispozitivele.",
          variant: "destructive",
        })
        return
      }

      const updateData = {
        ...data,
        lastActive: "Just now",
      }

      updateDevice<T>(deviceId, updateData)

      setDevice({
        ...device,
        ...data,
        lastActive: "Just now",
      } as T)
    },
    [device, deviceId, updateDevice, isAuthenticated, showToast],
  )

  return {
    device,
    loading,
    isActive,
    roomLights,
    togglePower,
    updateDeviceState,
    updateMultipleStates,
  }
}
