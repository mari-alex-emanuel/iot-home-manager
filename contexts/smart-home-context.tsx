"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { initialData } from "@/lib/data"
import type { SmartHomeData, Device, Room } from "@/lib/types"
import { useCustomToast } from "@/components/toast-provider"
import { useAuth } from "@/contexts/auth-context"

interface SmartHomeContextType {
  data: SmartHomeData
  getDeviceById: (id: number) => Device | undefined
  getDevicesByRoomId: (roomId: number) => Device[]
  getRoomById: (id: number) => Room | undefined
  getRoomName: (id: number) => string
  addDevice: (device: Omit<Device, "id">) => number
  updateDevice: <T extends Device>(id: number, data: Partial<Omit<T, "id" | "type">>) => void
  deleteDevice: (id: number) => void
  addRoom: (room: Omit<Room, "id">) => number
  updateRoom: (id: number, data: Partial<Omit<Room, "id">>) => void
  deleteRoom: (id: number) => void
  updateDeviceState: <T extends Device>(deviceId: number, state: Partial<T>) => void
}

const SmartHomeContext = createContext<SmartHomeContextType | undefined>(undefined)

// Funcție helper pentru generarea datelor tehnice automate
const generateTechnicalData = (deviceType: string, deviceName: string) => {
  const manufacturers = {
    light: "Philips",
    outlet: "TP-Link",
    thermostat: "Nest",
    humidity: "Xiaomi",
    door: "August",
    window: "Aqara",
    energy: "Shelly",
    ac: "Daikin",
    heating: "Honeywell",
    smoke_detector: "Nest",
    motion_sensor: "Philips Hue",
    other: "Generic",
  }

  const models = {
    light: "Hue White",
    outlet: "Kasa HS100",
    thermostat: "Learning Thermostat",
    humidity: "Mi Temperature",
    door: "Smart Lock Pro",
    window: "Window Sensor",
    energy: "1PM",
    ac: "Smart AC",
    heating: "T6 Pro",
    smoke_detector: "Protect",
    motion_sensor: "Motion Sensor",
    other: "Smart Device",
  }

  const currentDate = new Date().toISOString().split("T")[0]
  const randomSerial = `${deviceType.toUpperCase()}-${new Date().getFullYear()}-${Math.random().toString().substr(2, 8)}`
  const randomIP = `192.168.1.${Math.floor(Math.random() * 200) + 10}`
  const randomMAC = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0"),
  )
    .join(":")
    .toUpperCase()

  return {
    serialNumber: randomSerial,
    manufacturer: manufacturers[deviceType as keyof typeof manufacturers] || "Generic",
    model: models[deviceType as keyof typeof models] || "Smart Device",
    firmwareVersion: `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
    installationDate: currentDate,
    ipAddress: randomIP,
    macAddress: randomMAC,
    powerConsumption: `${Math.floor(Math.random() * 50) + 5}W`,
    batteryLevel: deviceType.includes("sensor") ? `${Math.floor(Math.random() * 40) + 60}%` : undefined,
  }
}

export function SmartHomeProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<SmartHomeData>(initialData)
  const { showToast } = useCustomToast()
  const { isAuthenticated } = useAuth()

  // Încărcăm datele din localStorage la inițializare
  useEffect(() => {
    const storedData = localStorage.getItem("smartHomeData")
    if (storedData) {
      try {
        setData(JSON.parse(storedData))
      } catch (error) {
        console.error("Error parsing stored data:", error)
        setData(initialData)
      }
    }
  }, [])

  // Salvăm datele în localStorage la fiecare modificare
  useEffect(() => {
    localStorage.setItem("smartHomeData", JSON.stringify(data))
  }, [data])

  const getDeviceById = (id: number) => data.devices?.find((device) => device.id === id)

  const getDevicesByRoomId = (roomId: number) => data.devices?.filter((device) => device.roomId === roomId) || []

  const getRoomById = (id: number) => data.rooms?.find((room) => room.id === id)

  const getRoomName = (id: number) => {
    const room = getRoomById(id)
    return room ? room.name : "Unknown Room"
  }

  const checkDeviceControlPermission = () => {
    if (!isAuthenticated()) {
      showToast({
        title: "Permisiune refuzată",
        description: "Nu aveți permisiunea de a controla dispozitivele.",
        variant: "destructive",
      })
      return false
    }
    return true
  }

  const addDevice = (device: Omit<Device, "id">) => {
    const newId = Math.max(0, ...(data.devices?.map((d) => d.id) || [0])) + 1

    // Generăm datele tehnice automat dacă nu sunt furnizate
    const technicalData = generateTechnicalData(device.type, device.name)

    const newDevice = {
      ...device,
      id: newId,
      ...technicalData,
      // Păstrăm valorile furnizate manual dacă există
      ...(device.serialNumber && { serialNumber: device.serialNumber }),
      ...(device.manufacturer && { manufacturer: device.manufacturer }),
      ...(device.model && { model: device.model }),
      ...(device.firmwareVersion && { firmwareVersion: device.firmwareVersion }),
      ...(device.installationDate && { installationDate: device.installationDate }),
      ...(device.ipAddress && { ipAddress: device.ipAddress }),
      ...(device.macAddress && { macAddress: device.macAddress }),
      ...(device.powerConsumption && { powerConsumption: device.powerConsumption }),
      ...(device.batteryLevel && { batteryLevel: device.batteryLevel }),
    } as Device

    setData((prev) => ({
      ...prev,
      devices: [...(prev.devices || []), newDevice],
      rooms: (prev.rooms || []).map((room) =>
        room.id === device.roomId ? { ...room, devices: [...(room.devices || []), newId] } : room,
      ),
    }))

    return newId
  }

  const updateDevice = <T extends Device>(id: number, deviceData: Partial<Omit<T, "id" | "type">>) => {
    if (!checkDeviceControlPermission()) return

    setData((prev) => ({
      ...prev,
      devices: (prev.devices || []).map((device) => (device.id === id ? { ...device, ...deviceData } : device)),
    }))
  }

  const deleteDevice = (id: number) => {
    const device = getDeviceById(id)
    if (!device) return

    setData((prev) => ({
      ...prev,
      devices: (prev.devices || []).filter((d) => d.id !== id),
      rooms: (prev.rooms || []).map((room) =>
        room.id === device.roomId
          ? { ...room, devices: (room.devices || []).filter((deviceId) => deviceId !== id) }
          : room,
      ),
    }))
  }

  const addRoom = (room: Omit<Room, "id">) => {
    const newId = Math.max(0, ...(data.rooms?.map((r) => r.id) || [0])) + 1
    const newRoom = { ...room, id: newId, devices: [] } as Room

    setData((prev) => ({
      ...prev,
      rooms: [...(prev.rooms || []), newRoom],
    }))

    return newId
  }

  const updateRoom = (id: number, roomData: Partial<Omit<Room, "id">>) => {
    setData((prev) => ({
      ...prev,
      rooms: (prev.rooms || []).map((room) => (room.id === id ? { ...room, ...roomData } : room)),
    }))
  }

  const deleteRoom = (id: number) => {
    setData((prev) => ({
      ...prev,
      rooms: (prev.rooms || []).filter((r) => r.id !== id),
      devices: (prev.devices || []).filter((d) => d.roomId !== id),
    }))
  }

  const updateDeviceState = <T extends Device>(deviceId: number, state: Partial<T>) => {
    if (!checkDeviceControlPermission()) return
    updateDevice(deviceId, state)
  }

  return (
    <SmartHomeContext.Provider
      value={{
        data,
        getDeviceById,
        getDevicesByRoomId,
        getRoomById,
        getRoomName,
        addDevice,
        updateDevice,
        deleteDevice,
        addRoom,
        updateRoom,
        deleteRoom,
        updateDeviceState,
      }}
    >
      {children}
    </SmartHomeContext.Provider>
  )
}

export function useSmartHome() {
  const context = useContext(SmartHomeContext)
  if (context === undefined) {
    throw new Error("useSmartHome must be used within a SmartHomeProvider")
  }
  return context
}
