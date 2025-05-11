"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DoorOpen, DoorClosed, Lock, LockOpen } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { StatusBadge } from "@/components/ui/status-badge"
import { IconWrapper } from "@/components/ui/icon-wrapper"
import { useSmartHome } from "@/contexts/smart-home-context"

export function DoorStatus() {
  const { data, updateDevice } = useSmartHome()

  // Filtrăm dispozitivele de tip ușă
  const doorDevices = data.devices.filter((device) => device.type === "door")

  const toggleLock = (doorId: number) => {
    // Găsim dispozitivul în date
    const device = data.devices.find((d) => d.id === doorId)
    if (!device) return

    // Verificăm dacă ușa este deschisă
    const isOpen = device.isOpen ?? device.serialNumber?.includes("open") ?? false
    if (isOpen) return // Nu putem încuia o ușă deschisă

    // Determinăm starea curentă de blocare
    const isCurrentlyLocked = device.isLocked ?? device.macAddress?.includes("locked") ?? false

    console.log(`Toggling lock for door ${doorId}. Currently locked: ${isCurrentlyLocked}`)

    // Actualizăm dispozitivul în context
    updateDevice(doorId, {
      isLocked: !isCurrentlyLocked,
      lastActive: "Just now",
    })
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Door Status</CardTitle>
        <CardDescription>Current status of all doors</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {doorDevices.map((door) => {
            // Determinăm starea ușii
            const isOpen = door.isOpen ?? door.serialNumber?.includes("open") ?? false
            const isLocked = door.isLocked ?? door.macAddress?.includes("locked") ?? false

            return (
              <div
                key={door.id}
                className="flex flex-wrap sm:flex-nowrap items-center justify-between border-b pb-2 last:border-0"
              >
                <div className="flex items-center mb-1 sm:mb-0 w-full sm:w-auto">
                  <IconWrapper
                    icon={isOpen ? DoorOpen : DoorClosed}
                    color={isOpen ? "text-orange-500" : "text-green-500"}
                  />
                  <span className="font-medium ml-2">{door.name}</span>
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                  <StatusBadge status={isOpen ? "Open" : "Closed"} />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => toggleLock(door.id)} disabled={isOpen}>
                          <IconWrapper
                            icon={isLocked ? Lock : LockOpen}
                            color={isLocked ? "text-green-500" : "text-gray-400"}
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isOpen ? <p>Cannot lock an open door</p> : <p>{isLocked ? "Unlock" : "Lock"} door</p>}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            )
          })}

          {doorDevices.length === 0 && (
            <div className="text-center text-muted-foreground py-2">No door sensors found</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
