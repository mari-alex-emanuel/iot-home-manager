import { RoomDetail } from "@/components/rooms/room-detail"

interface RoomPageProps {
  params: {
    id: string
  }
}

export default function RoomPage({ params }: RoomPageProps) {
  return (
    <div className="flex flex-col p-4 md:p-6 space-y-6 w-full">
      <RoomDetail roomId={Number.parseInt(params.id)} />
    </div>
  )
}
