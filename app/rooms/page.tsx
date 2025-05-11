import { RoomsList } from "@/components/rooms/rooms-list"

export default function RoomsPage() {
  return (
    <div className="flex flex-col p-4 md:p-6 space-y-6 w-full">
      <RoomsList />
    </div>
  )
}
