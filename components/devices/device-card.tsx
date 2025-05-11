"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ActionButton } from "@/components/ui/action-button"
import { Info, Trash2 } from "lucide-react"
import Link from "next/link"
import type { Device } from "@/lib/types"
import { getDeviceIcon } from "@/lib/device-utils"

interface DeviceCardProps {
  device: Device
  roomName: string
  onDelete: (id: number) => void
  actions?: React.ReactNode
}

export function DeviceCard({ device, roomName, onDelete, actions }: DeviceCardProps) {
  return (
    <Card className="h-full hover:bg-muted/30 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getDeviceIcon(device.type)}
            <CardTitle className="ml-2 text-lg">{device.name}</CardTitle>
          </div>
          <Badge variant={device.status === "Online" ? "default" : "outline"}>{device.status}</Badge>
        </div>
        <CardDescription>Room: {roomName}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Type: {device.type}</p>

          {/* Acțiuni */}
          <div className="flex justify-end gap-2 mt-4">
            {actions}
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
      </CardContent>
    </Card>
  )
}
