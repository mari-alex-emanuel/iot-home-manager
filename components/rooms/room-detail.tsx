"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, PlusCircle, ArrowLeft, Info } from "lucide-react"
import { EditRoomDialog } from "./edit-room-dialog"
import { AddDeviceDialog } from "../devices/add-device-dialog"
import { TemperatureControl } from "./temperature-control"
import { useSmartHome } from "@/contexts/smart-home-context"
import Link from "next/link"
import { roomTypes } from "@/lib/types"
import { ActionButton } from "@/components/ui/action-button"
import { getDeviceIcon } from "@/lib/device-utils"
import { useAuth } from "@/contexts/auth-context"

interface RoomDetailProps {
  roomId: number
}

export function RoomDetail({ roomId }: RoomDetailProps) {
  const { data, deleteRoom, updateRoom, getDevicesByRoomId } = useSmartHome()
  const { isAdmin } = useAuth()
  const [editingRoom, setEditingRoom] = useState<null | { id: number; name: string; type: string }>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDeviceDialogOpen, setIsAddDeviceDialogOpen] = useState(false)

  const room = data.rooms.find((r) => r.id === roomId)
  if (!room) return <div>Room not found</div>

  const devices = getDevicesByRoomId(roomId)
  const roomTypeName = roomTypes.find((t) => t.value === room.type)?.label || room.type

  const handleEditRoom = () => {
    setEditingRoom(room)
    setIsEditDialogOpen(true)
  }

  const handleUpdateRoom = (id: number, updatedData: { name: string; type: string }) => {
    updateRoom(id, updatedData)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="outline" size="icon" asChild className="mr-4">
            <Link href="/rooms">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{room.name}</h1>
            <div className="flex items-center">
              <Badge className="mr-2">{roomTypeName}</Badge>
              <span className="text-muted-foreground">{devices.length} devices</span>
            </div>
          </div>
        </div>
        {isAdmin() && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEditRoom}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Room
            </Button>
            <Button variant="destructive" onClick={() => deleteRoom(room.id)} asChild>
              <Link href="/rooms">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Room
              </Link>
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TemperatureControl roomId={roomId} />

        <Card>
          <CardHeader>
            <CardTitle>Devices</CardTitle>
            <CardDescription>Manage devices in this room</CardDescription>
          </CardHeader>
          <CardContent>
            {devices.length > 0 ? (
              <div className="space-y-4">
                {devices.map((device) => (
                  <div key={device.id} className="flex justify-between items-center p-3 border rounded-md">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(device.type)}
                      <div>
                        <div className="font-medium">{device.name}</div>
                        <div className="text-sm text-muted-foreground">{device.type}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={device.status === "Online" ? "default" : "outline"}>{device.status}</Badge>
                      <Link href={`/devices/${device.id}`}>
                        <ActionButton variant="outline" icon={Info} label="Device Details" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">No devices in this room</div>
            )}

            {isAdmin() && (
              <Button className="w-full mt-4" variant="outline" onClick={() => setIsAddDeviceDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Device
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {editingRoom && (
        <EditRoomDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          room={editingRoom}
          onUpdate={handleUpdateRoom}
        />
      )}

      <AddDeviceDialog
        open={isAddDeviceDialogOpen}
        onOpenChange={setIsAddDeviceDialogOpen}
        preselectedRoomId={roomId}
      />
    </div>
  )
}
