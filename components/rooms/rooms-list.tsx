"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { AddRoomDialog } from "./add-room-dialog"
import { useSmartHome } from "@/contexts/smart-home-context"
import { CardGrid } from "@/components/ui/card-grid"
import Link from "next/link"
import { roomTypes } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"

export function RoomsList() {
  const { data } = useSmartHome()
  const { isAdmin } = useAuth()
  const [isAddRoomDialogOpen, setIsAddRoomDialogOpen] = useState(false)

  // Add safety check for data and rooms
  const rooms = data?.rooms || []

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rooms</h1>
          <p className="text-muted-foreground">Manage your smart home rooms and associated devices</p>
        </div>
        {isAdmin() && (
          <Button onClick={() => setIsAddRoomDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Room
          </Button>
        )}
      </div>

      <CardGrid>
        {rooms.map((room) => {
          const roomType = roomTypes.find((t) => t.value === room.type)
          const deviceCount = room.devices?.length || 0

          return (
            <Link href={`/rooms/${room.id}`} key={room.id} className="block h-full">
              <Card className="h-full hover:bg-muted/30 transition-colors">
                <CardHeader>
                  <CardTitle>{room.name}</CardTitle>
                  <CardDescription>{roomType?.label || room.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {deviceCount} {deviceCount === 1 ? "device" : "devices"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </CardGrid>

      <AddRoomDialog open={isAddRoomDialogOpen} onOpenChange={setIsAddRoomDialogOpen} />
    </>
  )
}
