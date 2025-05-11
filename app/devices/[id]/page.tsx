import { DeviceDetails } from "@/components/devices/device-details"

interface DevicePageProps {
  params: {
    id: string
  }
}

export default function DevicePage({ params }: DevicePageProps) {
  return (
    <div className="flex flex-col p-4 md:p-6 space-y-6 w-full">
      <DeviceDetails id={Number.parseInt(params.id)} />
    </div>
  )
}
