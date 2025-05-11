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
import { roomTypes } from "@/lib/types"

interface Room {
  id: number
  name: string
  type: string
}

interface EditRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  room: Room
  onUpdate: (id: number, data: { name: string; type: string }) => void
}

export function EditRoomDialog({ open, onOpenChange, room, onUpdate }: EditRoomDialogProps) {
  const [roomName, setRoomName] = useState(room.name)
  const [roomType, setRoomType] = useState(room.type)

  // Update state when room prop changes
  useEffect(() => {
    if (room) {
      setRoomName(room.name)
      setRoomType(room.type)
    }
  }, [room])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(room.id, { name: roomName, type: roomType })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Room</DialogTitle>
          <DialogDescription>Update the room details and associated devices.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="col-span-3"
                placeholder="Living Room"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-type" className="text-right">
                Type
              </Label>
              <Select value={roomType} onValueChange={setRoomType} required>
                <SelectTrigger id="edit-type" className="col-span-3">
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Update Room</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
