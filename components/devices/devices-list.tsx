"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, Home, List } from "lucide-react"
import { AddDeviceDialog } from "./add-device-dialog"
import { useSmartHome } from "@/contexts/smart-home-context"
import { CardGrid } from "@/components/ui/card-grid"
import { DeviceCard } from "./device-card"
import { useCustomToast } from "@/components/toast-provider"
import { useAuth } from "@/contexts/auth-context"
import { DevicesRoomView } from "./devices-room-view"

export function DevicesList() {
  const { data, deleteDevice, getRoomName } = useSmartHome()
  const { showToast } = useCustomToast()
  const { isAdmin } = useAuth()
  const [isAddDeviceDialogOpen, setIsAddDeviceDialogOpen] = useState(false)
  const [viewByRooms, setViewByRooms] = useState(() => {
    // Get saved preference from localStorage or default to false
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("viewDevicesByRooms")
      return saved ? JSON.parse(saved) : false
    }
    return false
  })

  // Save preference to localStorage
  useEffect(() => {
    localStorage.setItem("viewDevicesByRooms", JSON.stringify(viewByRooms))
  }, [viewByRooms])

  const handleDeleteDevice = (id: number) => {
    deleteDevice(id)
    showToast({
      title: "Device deleted",
      description: "The device has been removed from your smart home system.",
      variant: "default",
    })
  }

  const toggleView = () => {
    setViewByRooms(!viewByRooms)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Devices</h1>
          <p className="text-muted-foreground">Manage your smart home devices</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={toggleView} className="flex items-center">
            {viewByRooms ? (
              <>
                <List className="mr-2 h-4 w-4" />
                View as List
              </>
            ) : (
              <>
                <Home className="mr-2 h-4 w-4" />
                View by Rooms
              </>
            )}
          </Button>
          {isAdmin() && (
            <Button onClick={() => setIsAddDeviceDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Device
            </Button>
          )}
        </div>
      </div>

      {viewByRooms ? (
        <DevicesRoomView onDeleteDevice={handleDeleteDevice} />
      ) : (
        <CardGrid>
          {data.devices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              roomName={getRoomName(device.roomId)}
              onDelete={handleDeleteDevice}
            />
          ))}
        </CardGrid>
      )}

      <AddDeviceDialog open={isAddDeviceDialogOpen} onOpenChange={setIsAddDeviceDialogOpen} />
    </>
  )
}
