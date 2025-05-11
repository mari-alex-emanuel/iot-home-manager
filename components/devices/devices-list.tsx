"use client"

import { useState } from "react"
import { ActionCard, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/action-card"
import { Info, Trash2, PlusCircle, LayoutGrid, Home } from "lucide-react"
import { AddDeviceDialog } from "./add-device-dialog"
import { PageHeader } from "@/components/ui/page-header"
import { CardGrid } from "@/components/ui/card-grid"
import { ActionButton } from "@/components/ui/action-button"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { useSmartHome } from "@/contexts/smart-home-context"
import { getDeviceIcon } from "@/lib/device-utils"

export function DevicesList() {
  const { data, deleteDevice, getRoomName } = useSmartHome()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "rooms">("grid")

  // Grupăm dispozitivele după cameră
  const devicesByRoom = data.devices.reduce(
    (acc, device) => {
      const roomName = getRoomName(device.roomId)
      if (!acc[roomName]) {
        acc[roomName] = []
      }
      acc[roomName].push(device)
      return acc
    },
    {} as Record<string, typeof data.devices>,
  )

  // Sortăm camerele alfabetic
  const sortedRooms = Object.keys(devicesByRoom).sort()

  return (
    <>
      <PageHeader
        title="Devices"
        action={
          <div className="flex flex-wrap gap-2">
            <div className="bg-muted rounded-md p-1 flex">
              <button
                className={`p-1 rounded-md ${viewMode === "grid" ? "bg-background shadow-sm" : ""}`}
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
              <button
                className={`p-1 rounded-md ${viewMode === "rooms" ? "bg-background shadow-sm" : ""}`}
                onClick={() => setViewMode("rooms")}
                aria-label="Room view"
              >
                <Home className="h-5 w-5" />
              </button>
            </div>
            <ActionButton onClick={() => setIsAddDialogOpen(true)} icon={PlusCircle} label="Add Device" />
          </div>
        }
      />

      {viewMode === "grid" ? (
        <CardGrid>
          {data.devices.map((device) => (
            <DeviceCard key={device.id} device={device} roomName={getRoomName(device.roomId)} onDelete={deleteDevice} />
          ))}
        </CardGrid>
      ) : (
        <div className="space-y-6">
          {sortedRooms.map((room) => (
            <Card key={room} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>{room}</CardTitle>
                  <div className="bg-muted px-2 py-1 rounded-md text-sm">{devicesByRoom[room].length} devices</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {devicesByRoom[room].map((device) => (
                    <div
                      key={device.id}
                      className="flex flex-col p-3 rounded-md border bg-card hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {getDeviceIcon(device.type)}
                        <div className="font-medium truncate">{device.name}</div>
                      </div>
                      <div className="flex justify-end gap-1 mt-auto">
                        <Link href={`/devices/${device.id}`}>
                          <ActionButton variant="outline" icon={Info} label="Device Details" />
                        </Link>
                        <ActionButton
                          variant="destructive"
                          icon={Trash2}
                          label="Delete Device"
                          onClick={() => deleteDevice(device.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddDeviceDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </>
  )
}

interface DeviceCardProps {
  device: {
    id: number
    name: string
    type: string
    status: "Online" | "Offline"
  }
  roomName: string
  onDelete: (id: number) => void
}

function DeviceCard({ device, roomName, onDelete }: DeviceCardProps) {
  return (
    <ActionCard
      footer={
        <>
          <Link href={`/devices/${device.id}`}>
            <ActionButton variant="outline" icon={Info} label="Device Details" />
          </Link>

          <ActionButton variant="destructive" icon={Trash2} label="Delete Device" onClick={() => onDelete(device.id)} />
        </>
      }
    >
      <CardHeader className="pb-2">
        <div className="flex items-center">
          {getDeviceIcon(device.type)}
          <CardTitle className="ml-2 text-lg">{device.name}</CardTitle>
        </div>
        <CardDescription>Room: {roomName}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Type: {device.type}</p>
      </CardContent>
    </ActionCard>
  )
}
