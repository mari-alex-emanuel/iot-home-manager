"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { AddRoomDialog } from "./add-room-dialog"

export function RoomsHeader() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Rooms</h1>
        <p className="text-muted-foreground">Manage rooms and associated devices</p>
      </div>
      <Button onClick={() => setOpen(true)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Room
      </Button>
      <AddRoomDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}
