"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { AmortizationData, Device } from "@/lib/types"

interface AmortizationChartProps {
  amortizationData: AmortizationData[]
  devices: Device[]
  detailed?: boolean
}

export function AmortizationChart({ amortizationData, devices, detailed = false }: AmortizationChartProps) {
  // Dacă nu avem date, afișăm un mesaj
  if (amortizationData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Grafice amortizare</CardTitle>
          <CardDescription>Nu există date de amortizare disponibile</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">Adaugă date de amortizare pentru a vedea graficele</p>
        </CardContent>
      </Card>
    )
  }

  // Funcție pentru a obține numele dispozitivului
  const getDeviceName = (deviceId: number) => {
    const device = devices.find((d) => d.id === deviceId)
    return device ? device.name : "Dispozitiv necunoscut"
  }

  // Calculăm datele pentru graficul de amortizare vs. durata de viață
  const paybackData = amortizationData
    .map((item) => {
      const totalCost = item.initialCost + item.installationCost
      const paybackPeriod = item.monthlySavings > 0 ? totalCost / item.monthlySavings : 0
      const paybackYears = paybackPeriod / 12
      const lifespanYears = item.lifespan / 12

      return {
        name: getDeviceName(item.deviceId),
        paybackYears,
        lifespanYears,
        isAmortized: paybackPeriod <= item.lifespan,
      }
    })
    .sort((a, b) => a.paybackYears - b.paybackYears)

  // Calculăm datele pentru graficul de distribuție a costurilor
  const costDistribution = amortizationData
    .map((item) => {
      return {
        name: getDeviceName(item.deviceId),
        initialCost: item.initialCost,
        installationCost: item.installationCost,
        totalCost: item.initialCost + item.installationCost,
      }
    })
    .sort((a, b) => b.totalCost - a.totalCost)

  // Calculăm datele pentru graficul de economii
  const savingsData = amortizationData
    .map((item) => {
      return {
        name: getDeviceName(item.deviceId),
        monthlySavings: item.monthlySavings,
        annualSavings: item.monthlySavings * 12,
      }
    })
    .sort((a, b) => b.monthlySavings - a.monthlySavings)

  // Calculăm datele pentru graficul de distribuție procentuală
  const totalInvestment = amortizationData.reduce((sum, item) => sum + item.initialCost + item.installationCost, 0)

  const percentageDistribution = amortizationData
    .map((item) => {
      const totalCost = item.initialCost + item.installationCost
      return {
        name: getDeviceName(item.deviceId),
        percentage: (totalCost / totalInvestment) * 100,
      }
    })
    .sort((a, b) => b.percentage - a.percentage)

  // Calculăm înălțimea dinamică pentru grafice în funcție de numărul de dispozitive
  const getChartHeight = (dataLength: number) => {
    // Înălțimea minimă pentru grafic
    const minHeight = 300
    // Înălțimea adăugată pentru fiecare element
    // Acum avem două rânduri per element, deci dublăm înălțimea per item
    const heightPerItem = 80
    // Înălțimea calculată
    const calculatedHeight = minHeight + dataLength * heightPerItem
    // Limităm înălțimea maximă
    return Math.min(calculatedHeight, 600)
  }

  // Înălțimea pentru fiecare grafic
  const paybackChartHeight = getChartHeight(paybackData.length)
  const costChartHeight = getChartHeight(costDistribution.length)
  const savingsChartHeight = getChartHeight(savingsData.length)
  const percentageChartHeight = getChartHeight(percentageDistribution.length)

  return (
    <Tabs defaultValue="payback">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
        <TabsTrigger value="payback">Amortizare</TabsTrigger>
        <TabsTrigger value="costs">Costuri</TabsTrigger>
        <TabsTrigger value="savings">Economii</TabsTrigger>
        <TabsTrigger value="percentage">Distribuție %</TabsTrigger>
      </TabsList>

      <TabsContent value="payback">
        <Card>
          <CardHeader>
            <CardTitle>Perioada de amortizare vs. Durata de viață</CardTitle>
            <CardDescription>
              Compară perioada de amortizare cu durata de viață estimată pentru fiecare dispozitiv
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`overflow-y-auto`} style={{ height: `${paybackChartHeight}px` }}>
              <div className="flex flex-col">
                {paybackData.map((item, index) => (
                  <div key={index} className="mb-6">
                    <div className="font-medium mb-2 break-words">{item.name}</div>
                    <div className="pl-2 space-y-3">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Perioada de amortizare</div>
                        <div className="flex items-center">
                          <div
                            className={`h-6 ${item.isAmortized ? "bg-green-500" : "bg-red-500"}`}
                            style={{ width: `${Math.min(item.paybackYears * 10, 100)}%` }}
                          ></div>
                          <div className="ml-2 text-xs whitespace-nowrap">{item.paybackYears.toFixed(1)} ani</div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Durata de viață estimată</div>
                        <div className="flex items-center">
                          <div
                            className="h-6 bg-gray-300"
                            style={{ width: `${Math.min(item.lifespanYears * 5, 50)}%` }}
                          ></div>
                          <div className="ml-2 text-xs whitespace-nowrap">{item.lifespanYears.toFixed(1)} ani</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-4 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 mr-2"></div>
                    <span>Perioada de amortizare (se amortizează în durata de viață)</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <div className="w-4 h-4 bg-red-500 mr-2"></div>
                    <span>Perioada de amortizare (nu se amortizează în durata de viață)</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <div className="w-4 h-4 bg-gray-300 mr-2"></div>
                    <span>Durata de viață estimată</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="costs">
        <Card>
          <CardHeader>
            <CardTitle>Distribuția costurilor</CardTitle>
            <CardDescription>
              Vizualizează distribuția costurilor inițiale și de instalare pentru fiecare dispozitiv
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`overflow-y-auto`} style={{ height: `${costChartHeight}px` }}>
              <div className="flex flex-col">
                {costDistribution.map((item, index) => (
                  <div key={index} className="mb-6">
                    <div className="font-medium mb-2 break-words">{item.name}</div>
                    <div className="pl-2 space-y-3">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Cost inițial</div>
                        <div className="flex items-center">
                          <div
                            className="h-6 bg-blue-500"
                            style={{ width: `${Math.min((item.initialCost / 1000) * 20, 100)}%` }}
                          ></div>
                          <div className="ml-2 text-xs whitespace-nowrap">{item.initialCost.toFixed(0)} RON</div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Cost instalare</div>
                        <div className="flex items-center">
                          <div
                            className="h-6 bg-purple-500"
                            style={{ width: `${Math.min((item.installationCost / 500) * 20, 100)}%` }}
                          ></div>
                          <div className="ml-2 text-xs whitespace-nowrap">{item.installationCost.toFixed(0)} RON</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-4 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 mr-2"></div>
                    <span>Cost inițial</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <div className="w-4 h-4 bg-purple-500 mr-2"></div>
                    <span>Cost instalare</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="savings">
        <Card>
          <CardHeader>
            <CardTitle>Economii lunare și anuale</CardTitle>
            <CardDescription>
              Vizualizează economiile lunare și anuale estimate pentru fiecare dispozitiv
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`overflow-y-auto`} style={{ height: `${savingsChartHeight}px` }}>
              <div className="flex flex-col">
                {savingsData.map((item, index) => (
                  <div key={index} className="mb-6">
                    <div className="font-medium mb-2 break-words">{item.name}</div>
                    <div className="pl-2 space-y-3">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Economii lunare</div>
                        <div className="flex items-center">
                          <div
                            className="h-6 bg-green-500"
                            style={{ width: `${Math.min(item.monthlySavings * 5, 100)}%` }}
                          ></div>
                          <div className="ml-2 text-xs whitespace-nowrap">
                            {item.monthlySavings.toFixed(0)} RON/lună
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Economii anuale</div>
                        <div className="flex items-center">
                          <div
                            className="h-6 bg-emerald-700"
                            style={{ width: `${Math.min(item.annualSavings / 50, 100)}%` }}
                          ></div>
                          <div className="ml-2 text-xs whitespace-nowrap">{item.annualSavings.toFixed(0)} RON/an</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-4 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 mr-2"></div>
                    <span>Economii lunare</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <div className="w-4 h-4 bg-emerald-700 mr-2"></div>
                    <span>Economii anuale</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="percentage">
        <Card>
          <CardHeader>
            <CardTitle>Distribuția procentuală a investițiilor</CardTitle>
            <CardDescription>Vizualizează procentul din investiția totală pentru fiecare dispozitiv</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`overflow-y-auto`} style={{ height: `${percentageChartHeight}px` }}>
              <div className="flex flex-col">
                {percentageDistribution.map((item, index) => (
                  <div key={index} className="mb-4">
                    <div className="font-medium mb-2 break-words">{item.name}</div>
                    <div className="pl-2">
                      <div className="flex items-center">
                        <div className="h-6 bg-amber-500" style={{ width: `${Math.min(item.percentage, 100)}%` }}></div>
                        <div className="ml-2 text-xs whitespace-nowrap">{item.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-4 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-amber-500 mr-2"></div>
                    <span>Procent din investiția totală ({totalInvestment.toFixed(0)} RON)</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
