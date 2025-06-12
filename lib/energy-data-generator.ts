// Utilități pentru generarea de date energetice realiste
export interface EnergyDataPoint {
  date: string
  consumption: number // Consum total (kWh)
  production: number // Producție solară (kWh)
  feedIn: number // Energie introdusă în rețea (kWh)
  battery: number // Nivel baterie (%)
}

export interface RealtimeEnergyData {
  gridConsumption: { percentage: number; kw: number }
  solarConsumption: { percentage: number; kw: number }
  gridFeedIn: { kw: number }
  batteryLevel: { percentage: number }
}

// Valori țintă anuale
const TARGET_ANNUAL_CONSUMPTION = 5000 // kWh/an
const TARGET_ANNUAL_PRODUCTION = 6000 // kWh/an - crescut de la 5300 la 6000

// Determină sezonul pe baza lunii
const getSeason = (month: number): "winter" | "spring" | "summer" | "autumn" => {
  if (month >= 12 || month <= 2) return "winter"
  if (month >= 3 && month <= 5) return "spring"
  if (month >= 6 && month <= 8) return "summer"
  return "autumn"
}

// Multiplicatori sezonieri pentru consum
const getSeasonalConsumptionMultiplier = (season: "winter" | "spring" | "summer" | "autumn"): number => {
  const multipliers = {
    winter: 1.2, // Iarna - mai mult consum (încălzire)
    spring: 0.9, // Primăvara - consum redus
    summer: 1.0, // Vara - consum mediu (aer condiționat)
    autumn: 0.95, // Toamna - consum ușor redus
  }
  return multipliers[season]
}

// Multiplicatori sezonieri pentru producție
const getSeasonalProductionMultiplier = (season: "winter" | "spring" | "summer" | "autumn"): number => {
  const multipliers = {
    winter: 0.6, // Iarna - producție redusă
    spring: 1.1, // Primăvara - producție bună
    summer: 1.4, // Vara - producție maximă
    autumn: 0.9, // Toamna - producție medie
  }
  return multipliers[season]
}

// Generează date istorice realiste
export const generateRealisticHistoricalData = (period: "week" | "month" | "year"): EnergyDataPoint[] => {
  const data: EnergyDataPoint[] = []
  const now = new Date()

  // Configurare perioadă
  let days: number
  let daysInPeriod: number
  let step = 1

  if (period === "week") {
    days = 7
    daysInPeriod = 7
  } else if (period === "month") {
    days = 30
    daysInPeriod = 30
  } else {
    days = 12 // 12 luni pentru an
    daysInPeriod = 365
    step = 1
  }

  // Calculează valorile medii zilnice/lunare
  const dailyConsumption = TARGET_ANNUAL_CONSUMPTION / 365 // kWh/zi
  const dailyProduction = TARGET_ANNUAL_PRODUCTION / 365 // kWh/zi
  const monthlyConsumption = TARGET_ANNUAL_CONSUMPTION / 12 // kWh/lună
  const monthlyProduction = TARGET_ANNUAL_PRODUCTION / 12 // kWh/lună

  // Generează datele inițiale
  for (let i = 0; i < days; i += step) {
    const date = new Date()

    if (period === "year") {
      // Pentru an: generează date lunare
      date.setMonth(now.getMonth() - (12 - i - 1))
      date.setDate(1)
    } else {
      // Pentru săptămână și lună: generează date zilnice
      date.setDate(now.getDate() - (days - i - 1))
    }

    const month = date.getMonth() + 1
    const season = getSeason(month)
    const seasonalConsumptionMultiplier = getSeasonalConsumptionMultiplier(season)
    const seasonalProductionMultiplier = getSeasonalProductionMultiplier(season)

    // Calculează valorile pentru această zi/lună
    let consumption: number
    let production: number

    if (period === "year") {
      // Pentru an: valori lunare
      consumption = monthlyConsumption * seasonalConsumptionMultiplier
      production = monthlyProduction * seasonalProductionMultiplier
    } else {
      // Pentru săptămână/lună: valori zilnice
      consumption = dailyConsumption * seasonalConsumptionMultiplier
      production = dailyProduction * seasonalProductionMultiplier

      // Adaugă variabilitate zilnică (±10%)
      const dailyVariation = 0.9 + Math.random() * 0.2
      consumption *= dailyVariation
      production *= dailyVariation
    }

    // Nivelul bateriei (simulat pe baza balanței energetice) - MAXIM 95%
    const energyBalance = production - consumption
    const batteryLevel = Math.min(95, Math.max(20, 60 + (energyBalance / Math.max(0.1, consumption)) * 100))

    const formatDate =
      period === "year"
        ? date.toLocaleDateString("ro-RO", { month: "short" })
        : date.toLocaleDateString("ro-RO", { day: "2-digit", month: "2-digit" })

    data.push({
      date: formatDate,
      consumption: Number(consumption.toFixed(1)),
      production: Number(production.toFixed(1)),
      feedIn: 0, // Calculăm mai târziu
      battery: Number(batteryLevel.toFixed(0)),
    })
  }

  // Ajustează valorile pentru a atinge exact țintele anuale
  const totalConsumption = data.reduce((sum, item) => sum + item.consumption, 0)
  const totalProduction = data.reduce((sum, item) => sum + item.production, 0)

  // Factori de scalare pentru a atinge țintele
  const consumptionScaleFactor =
    period === "year"
      ? TARGET_ANNUAL_CONSUMPTION / totalConsumption
      : ((TARGET_ANNUAL_CONSUMPTION / 365) * daysInPeriod) / totalConsumption
  const productionScaleFactor =
    period === "year"
      ? TARGET_ANNUAL_PRODUCTION / totalProduction
      : ((TARGET_ANNUAL_PRODUCTION / 365) * daysInPeriod) / totalProduction

  // Aplică factorii de scalare și calculează feed-in-ul corect
  const scaledData = data.map((item) => {
    const scaledConsumption = Number((item.consumption * consumptionScaleFactor).toFixed(1))
    const scaledProduction = Number((item.production * productionScaleFactor).toFixed(1))

    return {
      ...item,
      consumption: scaledConsumption,
      production: scaledProduction,
    }
  })

  // Calculează feed-in-ul total și distribuie-l proporțional
  const finalTotalConsumption = scaledData.reduce((sum, item) => sum + item.consumption, 0)
  const finalTotalProduction = scaledData.reduce((sum, item) => sum + item.production, 0)
  const totalSurplus = Math.max(0, finalTotalProduction - finalTotalConsumption)
  const totalFeedIn = totalSurplus // Feed-in = surplus complet (fără reducere)

  // Distribuie feed-in-ul proporțional cu surplusul zilnic/lunar
  const dailySurpluses = scaledData.map((item) => Math.max(0, item.production - item.consumption))
  const totalDailySurplus = dailySurpluses.reduce((sum, surplus) => sum + surplus, 0)

  return scaledData.map((item, index) => {
    const dailySurplus = dailySurpluses[index]
    const feedInProportion = totalDailySurplus > 0 ? dailySurplus / totalDailySurplus : 0
    const feedIn = Number((totalFeedIn * feedInProportion).toFixed(1))

    return {
      ...item,
      feedIn,
    }
  })
}

// Generează date în timp real realiste
export const generateRealisticRealtimeData = (previousData?: RealtimeEnergyData): RealtimeEnergyData => {
  const now = new Date()
  const hour = now.getHours()
  const month = now.getMonth() + 1
  const season = getSeason(month)

  // Consumul curent pe baza orei și sezonului
  const dailyAverageConsumption = TARGET_ANNUAL_CONSUMPTION / 365 / 24 // kW mediu
  const dailyAverageProduction = TARGET_ANNUAL_PRODUCTION / 365 / 24 // kW mediu

  // Pattern-uri de consum pe ore
  const hourlyPatterns = [
    0.3,
    0.25,
    0.2,
    0.2,
    0.25,
    0.4, // 00-05: noapte
    0.6,
    0.8,
    1.0,
    0.9,
    0.8,
    0.9, // 06-11: dimineața
    1.0,
    0.9,
    0.8,
    0.7,
    0.8,
    1.2, // 12-17: după-amiaza
    1.4,
    1.3,
    1.1,
    0.9,
    0.7,
    0.5, // 18-23: seara
  ]
  const hourlyPattern = hourlyPatterns[hour] || 0.5

  const seasonalConsumptionMultiplier = getSeasonalConsumptionMultiplier(season)
  const seasonalProductionMultiplier = getSeasonalProductionMultiplier(season)

  // Variabilitate mică pentru simularea fluctuațiilor în timp real
  const variation = previousData ? (Math.random() - 0.5) * 0.1 : 0

  const currentConsumption = dailyAverageConsumption * hourlyPattern * seasonalConsumptionMultiplier * (1 + variation)

  // Producția solară curentă (doar ziua)
  let currentSolar = 0
  if (hour >= 6 && hour <= 19) {
    const peakHour = 13
    const distance = Math.abs(hour - peakHour)
    const efficiency = Math.max(0, 1 - (distance / 7) ** 2)
    currentSolar = dailyAverageProduction * 12 * efficiency * seasonalProductionMultiplier * (1 + variation) // 12 ore de lumină
  }

  // Calculează distribuția
  const consumptionFromSolar = Math.min(currentConsumption, currentSolar)
  const consumptionFromGrid = Math.max(0, currentConsumption - currentSolar)

  // Feed-in (energia în plus introdusă în rețea)
  const feedIn = Math.max(0, currentSolar - currentConsumption)

  // Calculează procentajele
  const solarPercentage = currentConsumption > 0 ? (consumptionFromSolar / currentConsumption) * 100 : 0
  const gridPercentage = 100 - solarPercentage

  // Nivelul bateriei (se încarcă ziua, se descarcă noaptea) - MAXIM 95%
  let batteryLevel = previousData?.batteryLevel.percentage || 75

  if (currentSolar > currentConsumption && batteryLevel < 95) {
    batteryLevel += 0.5
  } else if (currentSolar < currentConsumption && batteryLevel > 20) {
    batteryLevel -= 0.3
  }

  batteryLevel = Math.min(95, Math.max(20, batteryLevel))

  return {
    gridConsumption: {
      percentage: Number(gridPercentage.toFixed(1)),
      kw: Number(consumptionFromGrid.toFixed(3)),
    },
    solarConsumption: {
      percentage: Number(solarPercentage.toFixed(1)),
      kw: Number(consumptionFromSolar.toFixed(3)),
    },
    gridFeedIn: {
      kw: Number(feedIn.toFixed(3)),
    },
    batteryLevel: {
      percentage: Number(batteryLevel.toFixed(0)),
    },
  }
}

// Calculează mediile pentru perioadele istorice
export const calculateAverages = (data: EnergyDataPoint[]) => {
  if (data.length === 0) return null

  const totals = data.reduce(
    (acc, item) => ({
      consumption: acc.consumption + item.consumption,
      production: acc.production + item.production,
      feedIn: acc.feedIn + item.feedIn,
      battery: acc.battery + item.battery,
    }),
    { consumption: 0, production: 0, feedIn: 0, battery: 0 },
  )

  const avgConsumption = totals.consumption / data.length
  const avgProduction = totals.production / data.length
  const avgFeedIn = totals.feedIn / data.length
  const avgBattery = totals.battery / data.length

  // Pentru compatibilitate cu interfața existentă
  const avgGrid = Math.max(0, avgConsumption - avgProduction)
  const avgSolar = Math.min(avgConsumption, avgProduction)

  return {
    grid: {
      kw: avgGrid.toFixed(1),
      percentage: avgConsumption > 0 ? ((avgGrid / avgConsumption) * 100).toFixed(1) : "0",
    },
    solar: {
      kw: avgSolar.toFixed(1),
      percentage: avgConsumption > 0 ? ((avgSolar / avgConsumption) * 100).toFixed(1) : "0",
    },
    feedIn: avgFeedIn.toFixed(1),
    battery: avgBattery.toFixed(0),
    // Adăugăm valorile noi pentru grafice
    consumption: avgConsumption.toFixed(1),
    production: avgProduction.toFixed(1),
  }
}
