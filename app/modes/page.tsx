import { PageHeader } from "@/components/ui/page-header"
import { HomeModesCard } from "@/components/home-modes/home-modes-card"

export default function ModesPage() {
  return (
    <div className="container mx-auto p-4">
      {/* Actualizăm titlul paginii */}
      <PageHeader title="Moduri" description="Gestionează modurile casei tale inteligente" />

      <div className="max-w-md mt-6">
        <HomeModesCard />
      </div>
    </div>
  )
}
