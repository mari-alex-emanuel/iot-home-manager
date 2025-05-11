"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Device, Room, SmartHomeData, DeviceType } from "@/lib/types"
import { initialData } from "@/lib/data"

interface SmartHomeContextType {
  data: SmartHomeData
  addRoom: (room: Omit<Room, "id" | "devices">) => Room
  updateRoom: (id: number, roomData: Partial<Room>) => void
  deleteRoom: (id: number) => void
  addDevice: <T extends DeviceType>(device: Omit<Device, "id"> & { type: T }) => Device
  updateDevice: <T extends Device>(id: number, deviceData: Partial<Omit<T, "id" | "type">>) => void
  deleteDevice: (id: number) => void
  getRoomById: (id: number) => Room | undefined
  getDeviceById: (id: number) => Device | undefined
  getDevicesByRoomId: (roomId: number) => Device[]
  getRoomByDeviceId: (deviceId: number) => Room | undefined
  getRoomName: (roomId: number) => string
  resetData: () => void
  reloadFromStorage: () => void
}

const SmartHomeContext = createContext<SmartHomeContextType | undefined>(undefined)

export function SmartHomeProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<SmartHomeData>(initialData)

  // Current schema version - increment this when you make breaking changes to the data structure
  const CURRENT_SCHEMA_VERSION = "1.2" // Incrementat pentru a forța reîncărcarea datelor inițiale

  // Load data from localStorage with version check
  useEffect(() => {
    const savedVersion = localStorage.getItem("smartHomeDataVersion")
    const savedData = localStorage.getItem("smartHomeData")

    // If the schema version doesn't match or there's no saved data, use initial data
    if (savedVersion !== CURRENT_SCHEMA_VERSION || !savedData) {
      console.log("Using initial data due to version mismatch or missing data")
      setData(initialData)
      localStorage.setItem("smartHomeDataVersion", CURRENT_SCHEMA_VERSION)
      return
    }

    try {
      setData(JSON.parse(savedData))
    } catch (error) {
      console.error("Error parsing saved data:", error)
      setData(initialData)
    }
  }, [])

  // Save data to localStorage with version
  useEffect(() => {
    localStorage.setItem("smartHomeData", JSON.stringify(data))
    localStorage.setItem("smartHomeDataVersion", CURRENT_SCHEMA_VERSION)
  }, [data])

  // Funcții pentru manipularea camerelor
  const addRoom = (room: Omit<Room, "id" | "devices">) => {
    const newId = Math.max(0, ...data.rooms.map((r) => r.id)) + 1
    const newRoom: Room = { ...room, id: newId, devices: [] }

    setData((prev) => ({
      ...prev,
      rooms: [...prev.rooms, newRoom],
    }))

    return newRoom
  }

  const updateRoom = (id: number, roomData: Partial<Room>) => {
    setData((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room) => (room.id === id ? { ...room, ...roomData } : room)),
    }))
  }

  const deleteRoom = (id: number) => {
    // Obținem dispozitivele din camera care va fi ștearsă
    const roomToDelete = data.rooms.find((r) => r.id === id)
    if (!roomToDelete) return

    // Ștergem camera și toate dispozitivele asociate
    setData((prev) => ({
      rooms: prev.rooms.filter((room) => room.id !== id),
      devices: prev.devices.filter((device) => device.roomId !== id),
    }))
  }

  // Funcții pentru manipularea dispozitivelor
  const addDevice = <T extends DeviceType>(device: Omit<Device, "id"> & { type: T }) => {
    const newId = Math.max(0, ...data.devices.map((d) => d.id)) + 1
    const newDevice = { ...device, id: newId } as Device

    setData((prev) => {
      // Adăugăm dispozitivul în lista de dispozitive
      const updatedDevices = [...prev.devices, newDevice]

      // Actualizăm lista de dispozitive a camerei
      const updatedRooms = prev.rooms.map((room) => {
        if (room.id === device.roomId) {
          return {
            ...room,
            devices: [...room.devices, newId],
          }
        }
        return room
      })

      return {
        rooms: updatedRooms,
        devices: updatedDevices,
      }
    })

    return newDevice
  }

  const updateDevice = <T extends Device>(id: number, deviceData: Partial<Omit<T, "id" | "type">>) => {
    const oldDevice = data.devices.find((d) => d.id === id)
    if (!oldDevice) return

    setData((prev) => {
      // Actualizăm dispozitivul
      const updatedDevices = prev.devices.map((device) => (device.id === id ? { ...device, ...deviceData } : device))

      // Dacă s-a schimbat camera, actualizăm și listele de dispozitive ale camerelor
      if (deviceData.roomId && deviceData.roomId !== oldDevice.roomId) {
        const updatedRooms = prev.rooms.map((room) => {
          if (room.id === oldDevice.roomId) {
            // Eliminăm dispozitivul din camera veche
            return {
              ...room,
              devices: room.devices.filter((deviceId) => deviceId !== id),
            }
          } else if (room.id === deviceData.roomId) {
            // Adăugăm dispozitivul în camera nouă
            return {
              ...room,
              devices: [...room.devices, id],
            }
          }
          return room
        })

        return {
          rooms: updatedRooms,
          devices: updatedDevices,
        }
      }

      return {
        ...prev,
        devices: updatedDevices,
      }
    })
  }

  const deleteDevice = (id: number) => {
    const deviceToDelete = data.devices.find((d) => d.id === id)
    if (!deviceToDelete) return

    setData((prev) => {
      // Eliminăm dispozitivul din lista de dispozitive
      const updatedDevices = prev.devices.filter((device) => device.id !== id)

      // Eliminăm dispozitivul din lista de dispozitive a camerei
      const updatedRooms = prev.rooms.map((room) => {
        if (room.id === deviceToDelete.roomId) {
          return {
            ...room,
            devices: room.devices.filter((deviceId) => deviceId !== id),
          }
        }
        return room
      })

      return {
        rooms: updatedRooms,
        devices: updatedDevices,
      }
    })
  }

  // Funcții utilitare
  const getRoomById = (id: number) => {
    return data.rooms.find((room) => room.id === id)
  }

  const getDeviceById = (id: number) => {
    return data.devices.find((device) => device.id === id)
  }

  const getDevicesByRoomId = (roomId: number) => {
    return data.devices.filter((device) => device.roomId === roomId)
  }

  const getRoomByDeviceId = (deviceId: number) => {
    const device = getDeviceById(deviceId)
    if (!device) return undefined
    return getRoomById(device.roomId)
  }

  const getRoomName = (roomId: number) => {
    const room = getRoomById(roomId)
    return room ? room.name : "Unknown Room"
  }

  const resetData = () => {
    localStorage.removeItem("smartHomeData")
    setData(initialData)
  }

  const reloadFromStorage = () => {
    const savedData = localStorage.getItem("smartHomeData")
    if (savedData) {
      try {
        setData(JSON.parse(savedData))
      } catch (error) {
        console.error("Error parsing saved data:", error)
      }
    }
  }

  const value = {
    data,
    addRoom,
    updateRoom,
    deleteRoom,
    addDevice,
    updateDevice,
    deleteDevice,
    getRoomById,
    getDeviceById,
    getDevicesByRoomId,
    getRoomByDeviceId,
    getRoomName,
    resetData,
    reloadFromStorage,
  }

  return <SmartHomeContext.Provider value={value}>{children}</SmartHomeContext.Provider>
}

export function useSmartHome() {
  const context = useContext(SmartHomeContext)
  if (context === undefined) {
    throw new Error("useSmartHome must be used within a SmartHomeProvider")
  }
  return context
}
