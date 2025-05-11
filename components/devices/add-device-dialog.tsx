"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSmartHome } from "@/contexts/smart-home-context"
import { deviceTypes } from "@/lib/types"

interface AddDeviceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preselectedRoomId?: number
}

export function AddDeviceDialog({ open, onOpenChange, preselectedRoomId }: AddDeviceDialogProps) {
  const { data, addDevice } = useSmartHome()
  const [deviceName, setDeviceName] = useState("")
  const [deviceType, setDeviceType] = useState("")
  const [deviceRoom, setDeviceRoom] = useState(preselectedRoomId ? preselectedRoomId.toString() : "")

  // Update deviceRoom when preselectedRoomId changes
  useEffect(() => {
    if (preselectedRoomId) {
      setDeviceRoom(preselectedRoomId.toString())
    }
  }, [preselectedRoomId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const roomId = Number.parseInt(deviceRoom)
    if (isNaN(roomId)) return

    addDevice({
      name: deviceName,
      type: deviceType,
      roomId: roomId,
      status: "Online",
      lastActive: "Just now",
    })

    setDeviceName("")
    setDeviceType("")
    if (!preselectedRoomId) {
      setDeviceRoom("")
    }
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setDeviceName("")
          setDeviceType("")
          if (!preselectedRoomId) {
            setDeviceRoom("")
          }
        }
        onOpenChange(isOpen)
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Device</DialogTitle>
          <DialogDescription>Add a new IoT device to your smart home system.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="device-name" className="text-right">
                Name
              </Label>
              <Input
                id="device-name"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                className="col-span-3"
                placeholder="Device Name"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="device-type" className="text-right">
                Type
              </Label>
              <Select value={deviceType} onValueChange={setDeviceType} required>
                <SelectTrigger id="device-type" className="col-span-3">
                  <SelectValue placeholder="Select device type" />
                </SelectTrigger>
                <SelectContent>
                  {deviceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {preselectedRoomId ? (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="device-room" className="text-right">
                  Room
                </Label>
                <Select value={deviceRoom} disabled>
                  <SelectTrigger id="device-room" className="col-span-3">
                    <SelectValue>
                      {data.rooms.find((room) => room.id === preselectedRoomId)?.name || "Selected Room"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {data.rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id.toString()}>
                        {room.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="device-room" className="text-right">
                  Room
                </Label>
                <Select value={deviceRoom} onValueChange={setDeviceRoom} required>
                  <SelectTrigger id="device-room" className="col-span-3">
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id.toString()}>
                        {room.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit">Add Device</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
