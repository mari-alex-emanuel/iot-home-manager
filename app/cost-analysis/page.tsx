import { CostAmortizationDashboard } from "@/components/cost-analysis/cost-amortization-dashboard"
import { PageHeader } from "@/components/ui/page-header"

export default function CostAnalysisPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <PageHeader
        heading="Analiză Amortizare Costuri"
        text="Monitorizează și analizează amortizarea investițiilor în dispozitivele smart home"
      />
      <CostAmortizationDashboard />
    </div>
  )
}
