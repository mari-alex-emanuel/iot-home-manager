"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Home, Bed, CookingPotIcon as Kitchen, Bath, Warehouse, Thermometer } from "lucide-react"
import { AddRoomDialog } from "./add-room-dialog"
import { PageHeader } from "@/components/ui/page-header"
import { CardGrid } from "@/components/ui/card-grid"
import { ActionButton } from "@/components/ui/action-button"
import { IconWrapper } from "@/components/ui/icon-wrapper"
import { useSmartHome } from "@/contexts/smart-home-context"
import { roomTypes } from "@/lib/types"
import Link from "next/link"

const roomTypeIcons = {
  living: Home,
  bedroom: Bed,
  kitchen: Kitchen,
  bathroom: Bath,
  garage: Warehouse,
  entrance: Home,
  other: Home,
}

export function RoomsList() {
  const { data, getDevicesByRoomId } = useSmartHome()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  return (
    <>
      <PageHeader
        title="Rooms"
        action={<ActionButton onClick={() => setIsAddDialogOpen(true)} icon={PlusCircle} label="Add Room" />}
      />
      <CardGrid>
        {data.rooms.map((room) => {
          const RoomIcon = roomTypeIcons[room.type as keyof typeof roomTypeIcons] || Home
          const devices = getDevicesByRoomId(room.id)
          const roomTypeName = roomTypes.find((t) => t.value === room.type)?.label || room.type

          // Check if room has temperature range set
          const hasTemperatureControl = room.temperatureRange !== undefined

          // Check if room has thermostats, AC or heating devices
          const hasThermostats = devices.some((d) => d.type === "thermostat")
          const hasClimateDevices = devices.some((d) => d.type === "ac" || d.type === "heating")

          return (
            <Link href={`/rooms/${room.id}`} key={room.id}>
              <Card className="h-full hover:bg-muted/30 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <IconWrapper icon={RoomIcon} color="text-primary" />
                      <span className="ml-2">{room.name}</span>
                    </CardTitle>
                    <Badge>{roomTypeName}</Badge>
                  </div>
                  <CardDescription>{devices.length} connected devices</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {devices.length > 0 ? (
                      <>
                        {devices.slice(0, 3).map((device) => (
                          <Badge key={device.id} variant="outline">
                            {device.type}
                          </Badge>
                        ))}
                        {devices.length > 3 && <Badge variant="outline">+{devices.length - 3} more</Badge>}
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">No devices</span>
                    )}
                  </div>

                  {(hasThermostats || hasClimateDevices) && (
                    <div className="mt-4 flex items-center text-sm">
                      <Thermometer className="h-4 w-4 mr-1 text-orange-500" />
                      {hasTemperatureControl ? (
                        <span>
                          {room.temperatureRange?.min}°C - {room.temperatureRange?.max}°C
                        </span>
                      ) : (
                        <span>20°C - 24°C</span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </CardGrid>

      <AddRoomDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </>
  )
}
