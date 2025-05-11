import { DashboardHeader } from "@/components/dashboard/header"
import { RoomCards } from "@/components/dashboard/room-cards"
import { DoorStatus } from "@/components/dashboard/door-status"
import { ClimateControlStatus } from "@/components/dashboard/climate-control-status"
import { EnergyMonitoring } from "@/components/dashboard/energy-monitoring"

export default function Dashboard() {
  return (
    <div className="flex flex-col p-4 md:p-6 space-y-6 w-full">
      <DashboardHeader />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <EnergyMonitoring />
        <div className="lg:col-span-1 space-y-6">
          <DoorStatus />
          <ClimateControlStatus />
        </div>
      </div>
      <RoomCards />
    </div>
  )
}
