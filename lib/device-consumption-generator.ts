// Utilități pentru generarea de date realiste de consum pentru dispozitive
export interface DeviceConsumptionData {
  period: string
  peak: number
  offPeak: number
  standby: number
  total: number
}

// Pattern-uri de utilizare pe ore pentru diferite tipuri de dispozitive
const getDeviceUsagePattern = (hour: number, deviceType: string): number => {
  const patterns: Record<string, number[]> = {
    // Becuri - mai mult seara și dimineața
    light: [
      0.1,
      0.05,
      0.05,
      0.05,
      0.1,
      0.3, // 00-05: noapte
      0.8,
      0.9,
      0.7,
      0.4,
      0.3,
      0.3, // 06-11: dimineața
      0.4,
      0.3,
      0.3,
      0.4,
      0.6,
      0.8, // 12-17: după-amiaza
      1.0,
      1.0,
      0.9,
      0.7,
      0.4,
      0.2, // 18-23: seara
    ],
    // Prize - consum mai constant, vârfuri dimineața și seara
    outlet: [
      0.3,
      0.2,
      0.2,
      0.2,
      0.3,
      0.5, // 00-05: noapte
      0.8,
      1.0,
      0.9,
      0.7,
      0.6,
      0.7, // 06-11: dimineața
      0.8,
      0.7,
      0.6,
      0.7,
      0.8,
      0.9, // 12-17: după-amiaza
      1.0,
      0.9,
      0.8,
      0.7,
      0.5,
      0.4, // 18-23: seara
    ],
    // Termostat - mai mult iarna, pattern constant cu vârfuri
    thermostat: [
      0.6,
      0.5,
      0.5,
      0.5,
      0.6,
      0.8, // 00-05: noapte
      1.0,
      0.9,
      0.7,
      0.6,
      0.6,
      0.7, // 06-11: dimineața
      0.8,
      0.7,
      0.7,
      0.8,
      0.9,
      1.0, // 12-17: după-amiaza
      1.0,
      0.9,
      0.8,
      0.7,
      0.6,
      0.6, // 18-23: seara
    ],
    // Senzori - consum constant și mic
    motion_sensor: [
      0.8,
      0.8,
      0.8,
      0.8,
      0.8,
      0.8, // 00-05: noapte
      0.8,
      0.8,
      0.8,
      0.8,
      0.8,
      0.8, // 06-11: dimineața
      0.8,
      0.8,
      0.8,
      0.8,
      0.8,
      0.8, // 12-17: după-amiaza
      0.8,
      0.8,
      0.8,
      0.8,
      0.8,
      0.8, // 18-23: seara
    ],
    smoke_detector: [
      0.9,
      0.9,
      0.9,
      0.9,
      0.9,
      0.9, // 00-05: noapte
      0.9,
      0.9,
      0.9,
      0.9,
      0.9,
      0.9, // 06-11: dimineața
      0.9,
      0.9,
      0.9,
      0.9,
      0.9,
      0.9, // 12-17: după-amiaza
      0.9,
      0.9,
      0.9,
      0.9,
      0.9,
      0.9, // 18-23: seara
    ],
  }

  const devicePattern = patterns[deviceType] || patterns.outlet
  return devicePattern[hour] || 0.5
}

// Consumul de bază pe tipuri de dispozitive (kW)
const getDeviceBaseConsumption = (deviceType: string): { peak: number; offPeak: number; standby: number } => {
  const consumptionMap: Record<string, { peak: number; offPeak: number; standby: number }> = {
    light: { peak: 0.015, offPeak: 0.01, standby: 0.001 }, // 15W peak, 10W off-peak, 1W standby
    outlet: { peak: 0.08, offPeak: 0.05, standby: 0.005 }, // 80W peak, 50W off-peak, 5W standby
    thermostat: { peak: 0.15, offPeak: 0.1, standby: 0.003 }, // 150W peak, 100W off-peak, 3W standby
    motion_sensor: { peak: 0.002, offPeak: 0.002, standby: 0.002 }, // 2W constant (battery)
    smoke_detector: { peak: 0.001, offPeak: 0.001, standby: 0.001 }, // 1W constant (battery)
  }

  return consumptionMap[deviceType] || consumptionMap.outlet
}

// Pattern-uri pentru zilele săptămânii
const getWeekdayMultiplier = (dayOfWeek: number): number => {
  // 0 = Duminică, 6 = Sâmbătă
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return 1.3 // Weekend - mai mult timp acasă
  }
  return 1.0 // Zile lucrătoare
}

// Multiplicator sezonier
const getSeasonalMultiplier = (month: number, deviceType: string): number => {
  const season =
    month >= 12 || month <= 2
      ? "winter"
      : month >= 3 && month <= 5
        ? "spring"
        : month >= 6 && month <= 8
          ? "summer"
          : "autumn"

  const seasonalMultipliers: Record<string, Record<string, number>> = {
    light: { winter: 1.4, spring: 1.0, summer: 0.8, autumn: 1.2 }, // Mai mult iarna (nopți lungi)
    outlet: { winter: 1.2, spring: 1.0, summer: 1.1, autumn: 1.0 }, // Puțin mai mult iarna și vara
    thermostat: { winter: 2.0, spring: 0.8, summer: 1.5, autumn: 1.0 }, // Mult mai mult iarna (încălzire) și vara (AC)
    motion_sensor: { winter: 1.0, spring: 1.0, summer: 1.0, autumn: 1.0 }, // Constant
    smoke_detector: { winter: 1.0, spring: 1.0, summer: 1.0, autumn: 1.0 }, // Constant
  }

  return seasonalMultipliers[deviceType]?.[season] || 1.0
}

// Generează date săptămânale realiste
export const generateRealisticWeeklyData = (deviceType: string): DeviceConsumptionData[] => {
  const data: DeviceConsumptionData[] = []
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const baseConsumption = getDeviceBaseConsumption(deviceType)
  const seasonalMultiplier = getSeasonalMultiplier(currentMonth, deviceType)

  const days = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"]

  for (let i = 0; i < 7; i++) {
    const date = new Date()
    date.setDate(now.getDate() - (6 - i))
    const dayOfWeek = date.getDay()
    const weekdayMultiplier = getWeekdayMultiplier(dayOfWeek)

    let dailyPeak = 0
    let dailyOffPeak = 0
    let dailyStandby = 0

    // Simulează 24 de ore pentru a obține consumul zilnic
    for (let hour = 0; hour < 24; hour++) {
      const usagePattern = getDeviceUsagePattern(hour, deviceType)
      const hourlyMultiplier = usagePattern * weekdayMultiplier * seasonalMultiplier

      // Variabilitate mică pentru realisme
      const variation = 0.9 + Math.random() * 0.2

      if (hour >= 7 && hour <= 22) {
        // Ore de vârf
        dailyPeak += baseConsumption.peak * hourlyMultiplier * variation
      } else {
        // Ore cu tarif redus
        dailyOffPeak += baseConsumption.offPeak * hourlyMultiplier * variation
      }

      // Standby constant
      dailyStandby += baseConsumption.standby * variation
    }

    const total = dailyPeak + dailyOffPeak + dailyStandby

    data.push({
      period: days[i],
      peak: Number(dailyPeak.toFixed(3)),
      offPeak: Number(dailyOffPeak.toFixed(3)),
      standby: Number(dailyStandby.toFixed(3)),
      total: Number(total.toFixed(3)),
    })
  }

  return data
}

// Generează date lunare realiste
export const generateRealisticMonthlyData = (deviceType: string): DeviceConsumptionData[] => {
  const data: DeviceConsumptionData[] = []
  const now = new Date()
  const baseConsumption = getDeviceBaseConsumption(deviceType)

  const weeks = ["Săpt 1", "Săpt 2", "Săpt 3", "Săpt 4"]

  for (let week = 0; week < 4; week++) {
    const currentMonth = now.getMonth() + 1
    const seasonalMultiplier = getSeasonalMultiplier(currentMonth, deviceType)

    let weeklyPeak = 0
    let weeklyOffPeak = 0
    let weeklyStandby = 0

    // Simulează 7 zile pentru fiecare săptămână
    for (let day = 0; day < 7; day++) {
      const dayOfWeek = day
      const weekdayMultiplier = getWeekdayMultiplier(dayOfWeek)

      // Simulează 24 de ore pentru fiecare zi
      for (let hour = 0; hour < 24; hour++) {
        const usagePattern = getDeviceUsagePattern(hour, deviceType)
        const hourlyMultiplier = usagePattern * weekdayMultiplier * seasonalMultiplier

        // Variabilitate săptămânală
        const weekVariation = week === 2 ? 1.2 : 0.9 + Math.random() * 0.2

        if (hour >= 7 && hour <= 22) {
          weeklyPeak += baseConsumption.peak * hourlyMultiplier * weekVariation
        } else {
          weeklyOffPeak += baseConsumption.offPeak * hourlyMultiplier * weekVariation
        }

        weeklyStandby += baseConsumption.standby * weekVariation
      }
    }

    const total = weeklyPeak + weeklyOffPeak + weeklyStandby

    data.push({
      period: weeks[week],
      peak: Number(weeklyPeak.toFixed(2)),
      offPeak: Number(weeklyOffPeak.toFixed(2)),
      standby: Number(weeklyStandby.toFixed(2)),
      total: Number(total.toFixed(2)),
    })
  }

  return data
}

// Calculează statistici realiste
export const calculateRealisticStats = (data: DeviceConsumptionData[], period: "weekly" | "monthly") => {
  if (data.length === 0) return null

  const totals = data.reduce(
    (acc, item) => ({
      peak: acc.peak + item.peak,
      offPeak: acc.offPeak + item.offPeak,
      standby: acc.standby + item.standby,
      total: acc.total + item.total,
    }),
    { peak: 0, offPeak: 0, standby: 0, total: 0 },
  )

  const average = totals.total / data.length
  const maxConsumption = Math.max(...data.map((d) => d.total))
  const peakPeriod = data.find((d) => d.total === maxConsumption)?.period

  return {
    average: average.toFixed(period === "weekly" ? 3 : 2),
    total: totals.total.toFixed(period === "weekly" ? 2 : 1),
    peakPeriod,
    maxConsumption: maxConsumption.toFixed(period === "weekly" ? 3 : 2),
    breakdown: {
      peak: totals.peak.toFixed(period === "weekly" ? 2 : 1),
      offPeak: totals.offPeak.toFixed(period === "weekly" ? 2 : 1),
      standby: totals.standby.toFixed(period === "weekly" ? 2 : 1),
    },
  }
}
