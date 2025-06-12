import { DashboardHeader } from "@/components/dashboard/header"
import { RoomCards } from "@/components/dashboard/room-cards"
import { DoorStatus } from "@/components/dashboard/door-status"
import { ClimateControlStatus } from "@/components/dashboard/climate-control-status"
import { EnergyMonitoring } from "@/components/dashboard/energy-monitoring"
import { WeatherEnergyCard } from "@/components/dashboard/weather-energy-card"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <DashboardHeader />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Energy Monitoring + Door Status */}
          <div className="space-y-6">
            <EnergyMonitoring />
            <ClimateControlStatus />
          </div>

          {/* Right Column - Weather + Climate Control */}
          <div className="space-y-6">
            <WeatherEnergyCard />
            <DoorStatus />
          </div>
        </div>

        {/* Rooms Section */}
        <div className="w-full">
          <RoomCards />
        </div>
      </div>
    </div>
  )
}
