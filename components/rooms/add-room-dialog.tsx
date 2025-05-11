"use client"

import type React from "react"

import { useState } from "react"
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
import { roomTypes } from "@/lib/types"

interface AddRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddRoomDialog({ open, onOpenChange }: AddRoomDialogProps) {
  const { addRoom } = useSmartHome()
  const [roomName, setRoomName] = useState("")
  const [roomType, setRoomType] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addRoom({ name: roomName, type: roomType })
    // Reset form
    setRoomName("")
    setRoomType("")
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        // Reset form when dialog closes
        if (!isOpen) {
          setRoomName("")
          setRoomType("")
        }
        onOpenChange(isOpen)
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Room</DialogTitle>
          <DialogDescription>Create a new room and associate devices with it.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="col-span-3"
                placeholder="Living Room"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select value={roomType} onValueChange={setRoomType} required>
                <SelectTrigger id="type" className="col-span-3">
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
            <Button type="submit">Add Room</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
