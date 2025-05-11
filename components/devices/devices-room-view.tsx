"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ActionButton } from "@/components/ui/action-button"
import { Info, Trash2 } from "lucide-react"
import Link from "next/link"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { getDeviceIcon } from "@/lib/device-utils"

interface DevicesRoomViewProps {
  devices: {
    id: number
    name: string
    type: string
    room: string
    status: string
    lastActive: string
  }[]
  onDelete: (id: number) => void
}

export function DevicesRoomView({ devices, onDelete }: DevicesRoomViewProps) {
  // Grupăm dispozitivele după cameră
  const devicesByRoom = devices.reduce(
    (acc, device) => {
      if (!acc[device.room]) {
        acc[device.room] = []
      }
      acc[device.room].push(device)
      return acc
    },
    {} as Record<string, typeof devices>,
  )

  // Sortăm camerele alfabetic
  const sortedRooms = Object.keys(devicesByRoom).sort()

  // State pentru a ține evidența camerelor expandate
  const [expandedRooms, setExpandedRooms] = useState<Record<string, boolean>>(
    sortedRooms.reduce(
      (acc, room) => {
        acc[room] = true // Toate camerele sunt expandate inițial
        return acc
      },
      {} as Record<string, boolean>,
    ),
  )

  const toggleRoom = (room: string) => {
    setExpandedRooms((prev) => ({
      ...prev,
      [room]: !prev[room],
    }))
  }

  return (
    <div className="space-y-6">
      {sortedRooms.map((room) => (
        <Card key={room} className="overflow-hidden">
          <Collapsible open={expandedRooms[room]} onOpenChange={() => toggleRoom(room)}>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="pb-2 cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle>{room}</CardTitle>
                  <Badge variant="outline">{devicesByRoom[room].length} devices</Badge>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="space-y-4">
                  {devicesByRoom[room].map((device) => (
                    <div
                      key={device.id}
                      className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">{getDeviceIcon(device.type)}</div>
                        <div>
                          <div className="font-medium">{device.name}</div>
                          <div className="text-sm text-muted-foreground">Last active: {device.lastActive}</div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Link href={`/devices/${device.id}`}>
                          <ActionButton variant="outline" icon={Info} label="Device Details" />
                        </Link>
                        <ActionButton
                          variant="destructive"
                          icon={Trash2}
                          label="Delete Device"
                          onClick={() => onDelete(device.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      ))}
    </div>
  )
}
