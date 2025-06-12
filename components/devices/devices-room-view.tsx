"use client"

import { useState, useEffect } from "react"
import { useSmartHome } from "@/contexts/smart-home-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DeviceCard } from "./device-card"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface DevicesRoomViewProps {
  onDeleteDevice: (id: number) => void
}

export function DevicesRoomView({ onDeleteDevice }: DevicesRoomViewProps) {
  const { data } = useSmartHome()
  const [expandedRooms, setExpandedRooms] = useState<Record<number, boolean>>(() => {
    // Get saved expanded state from localStorage or default to all expanded
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("expandedRooms")
      return saved ? JSON.parse(saved) : {}
    }
    return {}
  })

  // Initialize all rooms as expanded by default if not in localStorage
  useEffect(() => {
    const initialState: Record<number, boolean> = {}
    data.rooms.forEach((room) => {
      if (expandedRooms[room.id] === undefined) {
        initialState[room.id] = true
      }
    })

    if (Object.keys(initialState).length > 0) {
      setExpandedRooms((prev) => ({ ...prev, ...initialState }))
    }
  }, [data.rooms, expandedRooms])

  // Save expanded state to localStorage
  useEffect(() => {
    localStorage.setItem("expandedRooms", JSON.stringify(expandedRooms))
  }, [expandedRooms])

  const toggleRoomExpanded = (roomId: number) => {
    setExpandedRooms((prev) => ({
      ...prev,
      [roomId]: !prev[roomId],
    }))
  }

  // Group devices by room
  const devicesByRoom = data.rooms
    .map((room) => {
      const roomDevices = data.devices.filter((device) => device.roomId === room.id)
      return {
        room,
        devices: roomDevices,
      }
    })
    .filter((group) => group.devices.length > 0) // Only show rooms with devices

  return (
    <div className="space-y-6">
      {devicesByRoom.map(({ room, devices }) => (
        <Card key={room.id} className="overflow-hidden">
          <CardHeader
            className="bg-muted/50 cursor-pointer flex flex-row items-center justify-between py-3"
            onClick={() => toggleRoomExpanded(room.id)}
          >
            <div className="flex items-center">
              <CardTitle className="text-lg">{room.name}</CardTitle>
              <Badge variant="secondary" className="ml-2">
                {devices.length} {devices.length === 1 ? "device" : "devices"}
              </Badge>
            </div>
            {expandedRooms[room.id] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CardHeader>

          {expandedRooms[room.id] && (
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {devices.map((device) => (
                  <DeviceCard key={device.id} device={device} roomName={room.name} onDelete={onDeleteDevice} compact />
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      ))}

      {devicesByRoom.length === 0 && (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">No devices found in any room.</CardContent>
        </Card>
      )}
    </div>
  )
}
