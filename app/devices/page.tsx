import { DevicesList } from "@/components/devices/devices-list"

export default function DevicesPage() {
  return (
    <div className="flex flex-col p-4 md:p-6 space-y-6 w-full">
      <DevicesList />
    </div>
  )
}
