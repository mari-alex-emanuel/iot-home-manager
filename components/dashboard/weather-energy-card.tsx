"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Cloud, CloudRain, CloudSun, Droplets, Sun, Wind } from "lucide-react"

type WeatherCondition = "sunny" | "partly-cloudy" | "cloudy" | "rainy" | "stormy"

interface WeatherData {
  temperature: number
  condition: WeatherCondition
  humidity: number
  windSpeed: number
  solarRadiation: number
  cloudCover: number
  forecast: {
    hour: number
    condition: WeatherCondition
    temperature: number
    solarRadiation: number
    productionImpact: number
  }[]
}

// Funcție pentru a genera un număr pseudo-aleator deterministic bazat pe seed
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// Funcție pentru a obține un seed bazat pe data curentă (an, lună, zi)
function getDaySeed() {
  const now = new Date()
  return now.getFullYear() * 10000 + now.getMonth() * 100 + now.getDate()
}

// Funcție pentru a obține un seed bazat pe ora curentă
function getHourSeed(hour: number) {
  return getDaySeed() + hour * 0.1
}

// Adaugă funcția pentru determinarea anotimpului după funcția getHourSeed:

// Funcție pentru a determina anotimpul curent
function getCurrentSeason() {
  const month = new Date().getMonth() + 1 // 1-12
  if (month >= 3 && month <= 5) return "spring"
  if (month >= 6 && month <= 8) return "summer"
  if (month >= 9 && month <= 11) return "autumn"
  return "winter"
}

// Funcție pentru a obține configurația anotimpului
function getSeasonConfig(season: string) {
  switch (season) {
    case "spring":
      return {
        baseTemp: 15,
        tempRange: 20, // -10 până la +10 față de baseTemp
        maxRadiation: 900,
        sunriseHour: 6,
        sunsetHour: 20,
        conditionProbabilities: {
          sunny: 0.35,
          "partly-cloudy": 0.35,
          cloudy: 0.2,
          rainy: 0.08,
          stormy: 0.02,
        },
        baseHumidity: 60,
        baseWindSpeed: 5,
      }
    case "summer":
      return {
        baseTemp: 25,
        tempRange: 15, // -7.5 până la +7.5 față de baseTemp
        maxRadiation: 1000,
        sunriseHour: 5,
        sunsetHour: 21,
        conditionProbabilities: {
          sunny: 0.5,
          "partly-cloudy": 0.3,
          cloudy: 0.15,
          rainy: 0.04,
          stormy: 0.01,
        },
        baseHumidity: 50,
        baseWindSpeed: 3,
      }
    case "autumn":
      return {
        baseTemp: 12,
        tempRange: 18, // -9 până la +9 față de baseTemp
        maxRadiation: 700,
        sunriseHour: 7,
        sunsetHour: 19,
        conditionProbabilities: {
          sunny: 0.25,
          "partly-cloudy": 0.3,
          cloudy: 0.3,
          rainy: 0.12,
          stormy: 0.03,
        },
        baseHumidity: 70,
        baseWindSpeed: 6,
      }
    case "winter":
      return {
        baseTemp: 2,
        tempRange: 16, // -8 până la +8 față de baseTemp
        maxRadiation: 500,
        sunriseHour: 8,
        sunsetHour: 17,
        conditionProbabilities: {
          sunny: 0.2,
          "partly-cloudy": 0.25,
          cloudy: 0.35,
          rainy: 0.15,
          stormy: 0.05,
        },
        baseHumidity: 80,
        baseWindSpeed: 8,
      }
    default:
      return getSeasonConfig("spring")
  }
}

// Înlocuiește întreaga funcție generatePersistentWeatherData cu următoarea versiune:

function generatePersistentWeatherData(): WeatherData {
  const now = new Date()
  const currentHour = now.getHours()
  const daySeed = getDaySeed()
  const season = getCurrentSeason()
  const seasonConfig = getSeasonConfig(season)

  // Determinăm tipul general de vreme pentru ziua curentă folosind probabilitățile anotimpului
  const dayWeatherType = seededRandom(daySeed)
  let baseCondition: WeatherCondition = "partly-cloudy"
  let cumulativeProbability = 0

  for (const [condition, probability] of Object.entries(seasonConfig.conditionProbabilities)) {
    cumulativeProbability += probability
    if (dayWeatherType <= cumulativeProbability) {
      baseCondition = condition as WeatherCondition
      break
    }
  }

  // Ajustăm condițiile în funcție de ora zilei și anotimp
  let condition = baseCondition
  const hourVariation = seededRandom(getHourSeed(currentHour))
  const isDaytime = currentHour >= seasonConfig.sunriseHour && currentHour <= seasonConfig.sunsetHour

  // Dimineața și seara sunt mai probabil să fie parțial înnorat
  if (
    (currentHour >= seasonConfig.sunriseHour && currentHour <= seasonConfig.sunriseHour + 3) ||
    (currentHour >= seasonConfig.sunsetHour - 3 && currentHour <= seasonConfig.sunsetHour)
  ) {
    if (hourVariation < 0.4 && baseCondition !== "stormy") {
      condition = "partly-cloudy"
    }
  }

  // La prânz este mai probabil să fie însorit dacă nu e o zi ploioasă
  const noonStart = seasonConfig.sunriseHour + 4
  const noonEnd = seasonConfig.sunsetHour - 4
  if (currentHour >= noonStart && currentHour <= noonEnd) {
    if (hourVariation < 0.5 && (baseCondition === "partly-cloudy" || baseCondition === "cloudy")) {
      condition = "sunny"
    }
  }

  // Noaptea este mai probabil să fie înnorat
  if (!isDaytime) {
    if (hourVariation < 0.6 && baseCondition !== "stormy" && baseCondition !== "rainy") {
      condition = "cloudy"
    }
  }

  // Generăm temperatura în funcție de anotimp și oră
  let baseTemp = seasonConfig.baseTemp

  // Ajustăm temperatura în funcție de ora zilei
  if (isDaytime) {
    const dayLength = seasonConfig.sunsetHour - seasonConfig.sunriseHour
    const midDay = seasonConfig.sunriseHour + dayLength / 2
    const hourFactor = 1 - Math.abs(currentHour - midDay) / (dayLength / 2)
    baseTemp += hourFactor * (seasonConfig.tempRange / 2) // Maxim în mijlocul zilei
  } else {
    baseTemp -= seasonConfig.tempRange / 4 // Mai rece noaptea
  }

  // Ajustăm temperatura în funcție de condiții
  if (condition === "sunny") baseTemp += 3
  else if (condition === "cloudy") baseTemp -= 2
  else if (condition === "rainy") baseTemp -= 4
  else if (condition === "stormy") baseTemp -= 6

  // Adăugăm o mică variație aleatorie dar deterministică
  const tempVariation = seededRandom(getHourSeed(currentHour) + 0.1) * 4 - 2
  const temperature = baseTemp + tempVariation

  // Calculăm radiația solară (0 în afara orelor de lumină)
  let solarRadiation = 0
  if (isDaytime) {
    const dayLength = seasonConfig.sunsetHour - seasonConfig.sunriseHour
    const midDay = seasonConfig.sunriseHour + dayLength / 2
    const hourFactor = 1 - Math.abs(currentHour - midDay) / (dayLength / 2)

    const conditionFactor =
      condition === "sunny"
        ? 1
        : condition === "partly-cloudy"
          ? 0.7
          : condition === "cloudy"
            ? 0.3
            : condition === "rainy"
              ? 0.15
              : 0.05

    solarRadiation = seasonConfig.maxRadiation * hourFactor * conditionFactor

    // Adăugăm variație deterministică
    const radiationVariation = seededRandom(getHourSeed(currentHour) + 0.2) * 0.2 - 0.1
    solarRadiation *= 1 + radiationVariation
  }

  // Radiație foarte mică la răsărit/apus
  if (currentHour === seasonConfig.sunriseHour || currentHour === seasonConfig.sunsetHour) {
    solarRadiation *= 0.2
  }

  // Umiditate în funcție de anotimp și condiții
  const conditionHumidityModifier =
    condition === "sunny"
      ? -20
      : condition === "partly-cloudy"
        ? -10
        : condition === "cloudy"
          ? 0
          : condition === "rainy"
            ? +15
            : +20

  const humidityVariation = seededRandom(getHourSeed(currentHour) + 0.3) * 10 - 5
  const humidity = Math.min(
    100,
    Math.max(10, seasonConfig.baseHumidity + conditionHumidityModifier + humidityVariation),
  )

  // Acoperire cu nori în funcție de condiții
  const baseCloudCover =
    condition === "sunny"
      ? 5
      : condition === "partly-cloudy"
        ? 40
        : condition === "cloudy"
          ? 80
          : condition === "rainy"
            ? 90
            : 95

  const cloudVariation = seededRandom(getHourSeed(currentHour) + 0.4) * 10 - 5
  const cloudCover = Math.min(100, Math.max(0, baseCloudCover + cloudVariation))

  // Viteza vântului în funcție de anotimp și condiții
  const conditionWindModifier =
    condition === "sunny"
      ? -2
      : condition === "partly-cloudy"
        ? 0
        : condition === "cloudy"
          ? +1
          : condition === "rainy"
            ? +3
            : +8

  const windVariation = seededRandom(getHourSeed(currentHour) + 0.5) * 4 - 2
  const windSpeed = Math.max(0, seasonConfig.baseWindSpeed + conditionWindModifier + windVariation)

  // Generăm prognoză pentru următoarele ore
  const forecast = []
  for (let i = 1; i <= 6; i++) {
    const forecastHour = (currentHour + i) % 24
    const forecastHourSeed = getHourSeed(forecastHour)
    const isDaytimeForecast = forecastHour >= seasonConfig.sunriseHour && forecastHour <= seasonConfig.sunsetHour

    // Determinăm condiția pentru ora de prognoză
    let forecastCondition = baseCondition
    const forecastHourVariation = seededRandom(forecastHourSeed)

    // Ajustăm condiția în funcție de ora din prognoză
    if (
      (forecastHour >= seasonConfig.sunriseHour && forecastHour <= seasonConfig.sunriseHour + 3) ||
      (forecastHour >= seasonConfig.sunsetHour - 3 && forecastHour <= seasonConfig.sunsetHour)
    ) {
      if (forecastHourVariation < 0.4 && baseCondition !== "stormy") {
        forecastCondition = "partly-cloudy"
      }
    }

    const forecastNoonStart = seasonConfig.sunriseHour + 4
    const forecastNoonEnd = seasonConfig.sunsetHour - 4
    if (forecastHour >= forecastNoonStart && forecastHour <= forecastNoonEnd) {
      if (forecastHourVariation < 0.5 && (baseCondition === "partly-cloudy" || baseCondition === "cloudy")) {
        forecastCondition = "sunny"
      }
    }

    if (!isDaytimeForecast) {
      if (forecastHourVariation < 0.6 && baseCondition !== "stormy" && baseCondition !== "rainy") {
        forecastCondition = "cloudy"
      }
    }

    // Temperatura pentru prognoză
    let forecastBaseTemp = seasonConfig.baseTemp

    if (isDaytimeForecast) {
      const dayLength = seasonConfig.sunsetHour - seasonConfig.sunriseHour
      const midDay = seasonConfig.sunriseHour + dayLength / 2
      const forecastHourFactor = 1 - Math.abs(forecastHour - midDay) / (dayLength / 2)
      forecastBaseTemp += forecastHourFactor * (seasonConfig.tempRange / 2)
    } else {
      forecastBaseTemp -= seasonConfig.tempRange / 4
    }

    if (forecastCondition === "sunny") forecastBaseTemp += 3
    else if (forecastCondition === "cloudy") forecastBaseTemp -= 2
    else if (forecastCondition === "rainy") forecastBaseTemp -= 4
    else if (forecastCondition === "stormy") forecastBaseTemp -= 6

    const forecastTempVariation = seededRandom(forecastHourSeed + 0.1) * 4 - 2
    const forecastTemperature = forecastBaseTemp + forecastTempVariation

    // Radiația solară pentru prognoză
    let forecastSolarRadiation = 0
    if (isDaytimeForecast) {
      const dayLength = seasonConfig.sunsetHour - seasonConfig.sunriseHour
      const midDay = seasonConfig.sunriseHour + dayLength / 2
      const forecastHourFactor = 1 - Math.abs(forecastHour - midDay) / (dayLength / 2)

      const forecastConditionFactor =
        forecastCondition === "sunny"
          ? 1
          : forecastCondition === "partly-cloudy"
            ? 0.7
            : forecastCondition === "cloudy"
              ? 0.3
              : forecastCondition === "rainy"
                ? 0.15
                : 0.05

      forecastSolarRadiation = seasonConfig.maxRadiation * forecastHourFactor * forecastConditionFactor

      const forecastRadiationVariation = seededRandom(forecastHourSeed + 0.2) * 0.2 - 0.1
      forecastSolarRadiation *= 1 + forecastRadiationVariation
    }

    // Radiație foarte mică la răsărit/apus
    if (forecastHour === seasonConfig.sunriseHour || forecastHour === seasonConfig.sunsetHour) {
      forecastSolarRadiation *= 0.2
    }

    // Impactul asupra producției (0-100%)
    let productionImpact = 0
    if (isDaytimeForecast) {
      productionImpact = (forecastSolarRadiation / seasonConfig.maxRadiation) * 100

      // Ajustăm impactul în funcție de condiții
      if (forecastCondition === "sunny") {
        productionImpact = Math.min(100, productionImpact * 1.1)
      } else if (forecastCondition === "partly-cloudy") {
        productionImpact = Math.min(100, productionImpact * 0.9)
      } else if (forecastCondition === "cloudy") {
        productionImpact = Math.min(100, productionImpact * 0.7)
      } else if (forecastCondition === "rainy") {
        productionImpact = Math.min(100, productionImpact * 0.5)
      } else {
        productionImpact = Math.min(100, productionImpact * 0.3)
      }
    }

    forecast.push({
      hour: forecastHour,
      condition: forecastCondition,
      temperature: forecastTemperature,
      solarRadiation: forecastSolarRadiation,
      productionImpact: productionImpact,
    })
  }

  return {
    temperature,
    condition,
    humidity,
    windSpeed,
    solarRadiation,
    cloudCover,
    forecast,
  }
}

// Funcție pentru a obține iconița pentru condiția meteo
function getWeatherIcon(condition: WeatherCondition) {
  switch (condition) {
    case "sunny":
      return <Sun className="h-8 w-8 text-amber-500" />
    case "partly-cloudy":
      return <CloudSun className="h-8 w-8 text-blue-400" />
    case "cloudy":
      return <Cloud className="h-8 w-8 text-gray-400" />
    case "rainy":
      return <CloudRain className="h-8 w-8 text-blue-500" />
    case "stormy":
      return <CloudRain className="h-8 w-8 text-purple-500" />
  }
}

// Funcție pentru a obține descrierea condiției meteo
function getWeatherDescription(condition: WeatherCondition) {
  switch (condition) {
    case "sunny":
      return "Însorit"
    case "partly-cloudy":
      return "Parțial noros"
    case "cloudy":
      return "Înnorat"
    case "rainy":
      return "Ploios"
    case "stormy":
      return "Furtună"
  }
}

// Funcție pentru a obține culoarea pentru impactul producției
function getProductionImpactColor(impact: number) {
  if (impact >= 80) return "text-green-500"
  if (impact >= 60) return "text-green-400"
  if (impact >= 40) return "text-yellow-500"
  if (impact >= 20) return "text-orange-500"
  return "text-red-500"
}

// Funcție pentru a obține clasa pentru bara de progres a impactului producției
function getProductionImpactBarClass(impact: number) {
  if (impact >= 80) return "bg-green-200 dark:bg-green-900 [&>div]:bg-green-500"
  if (impact >= 60) return "bg-green-200 dark:bg-green-900 [&>div]:bg-green-400"
  if (impact >= 40) return "bg-yellow-200 dark:bg-yellow-900 [&>div]:bg-yellow-500"
  if (impact >= 20) return "bg-orange-200 dark:bg-orange-900 [&>div]:bg-orange-500"
  return "bg-red-200 dark:bg-red-900 [&>div]:bg-red-500"
}

export function WeatherEnergyCard() {
  const [weatherData, setWeatherData] = useState<WeatherData>(generatePersistentWeatherData())
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Actualizăm datele meteo la fiecare 5 minute
  useEffect(() => {
    const interval = setInterval(() => {
      setWeatherData(generatePersistentWeatherData())
      setLastUpdate(new Date())
    }, 300000) // 5 minute

    return () => clearInterval(interval)
  }, [])

  // Actualizează calculul impactului actual pentru a folosi radiația maximă a anotimpului:

  const currentProductionImpact = Math.min(
    100,
    (weatherData.solarRadiation / getSeasonConfig(getCurrentSeason()).maxRadiation) * 100,
  )

  // Formatăm ora ultimei actualizări
  const formattedLastUpdate = lastUpdate.toLocaleTimeString("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sun className="mr-2 h-5 w-5" />
          Meteo și producție solară
        </CardTitle>
        <CardDescription>Condiții meteo actuale și impactul asupra producției de energie</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informații meteo actuale */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {getWeatherIcon(weatherData.condition)}
            <div>
              <div className="text-2xl font-bold">{Math.round(weatherData.temperature)}°C</div>
              <div className="text-sm text-muted-foreground">{getWeatherDescription(weatherData.condition)}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Ultima actualizare</div>
            <div className="font-medium">{formattedLastUpdate}</div>
          </div>
        </div>

        {/* Detalii meteo */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="flex flex-col items-center">
            <Droplets className="h-5 w-5 text-blue-500 mb-1" />
            <div className="text-sm text-muted-foreground">Umiditate</div>
            <div className="font-medium">{Math.round(weatherData.humidity)}%</div>
          </div>
          <div className="flex flex-col items-center">
            <Wind className="h-5 w-5 text-blue-400 mb-1" />
            <div className="text-sm text-muted-foreground">Vânt</div>
            <div className="font-medium">{weatherData.windSpeed.toFixed(1)} km/h</div>
          </div>
          <div className="flex flex-col items-center">
            <Cloud className="h-5 w-5 text-gray-400 mb-1" />
            <div className="text-sm text-muted-foreground">Nori</div>
            <div className="font-medium">{Math.round(weatherData.cloudCover)}%</div>
          </div>
        </div>

        <Separator />

        {/* Impactul asupra producției */}
        <div>
          <h3 className="text-sm font-medium mb-3">Impactul asupra producției solare</h3>
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <Sun className="h-5 w-5 mr-2 text-amber-500" />
                  <span className="text-sm font-medium">Radiație solară</span>
                </div>
                <div className="text-lg font-bold">{Math.round(weatherData.solarRadiation)} W/m²</div>
              </div>
              <div className="text-xs text-muted-foreground">
                {weatherData.solarRadiation > 800
                  ? "Condiții excelente pentru producția de energie"
                  : weatherData.solarRadiation > 500
                    ? "Condiții bune pentru producția de energie"
                    : weatherData.solarRadiation > 200
                      ? "Condiții moderate pentru producția de energie"
                      : weatherData.solarRadiation > 0
                        ? "Condiții slabe pentru producția de energie"
                        : "Fără producție de energie (noapte)"}
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Eficiență actuală</span>
                <span className={`text-lg font-bold ${getProductionImpactColor(currentProductionImpact)}`}>
                  {Math.round(currentProductionImpact)}%
                </span>
              </div>
              <Progress
                value={currentProductionImpact}
                className={`h-2 ${getProductionImpactBarClass(currentProductionImpact)}`}
              />
              <div className="text-xs text-muted-foreground mt-2">
                {currentProductionImpact > 80
                  ? "Producție la capacitate maximă"
                  : currentProductionImpact > 60
                    ? "Producție bună"
                    : currentProductionImpact > 40
                      ? "Producție moderată"
                      : currentProductionImpact > 20
                        ? "Producție redusă"
                        : currentProductionImpact > 0
                          ? "Producție minimă"
                          : "Fără producție (noapte)"}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Prognoză pentru următoarele ore */}
        <div>
          <h3 className="text-sm font-medium mb-3">Prognoză producție următoarele ore</h3>
          <div className="grid grid-cols-3 gap-3">
            {weatherData.forecast.slice(0, 6).map((hour, index) => (
              <div key={index} className="bg-muted/30 p-2 rounded-lg text-center">
                <div className="text-xs text-muted-foreground">{hour.hour.toString().padStart(2, "0")}:00</div>
                <div className="flex justify-center my-1">{getWeatherIcon(hour.condition)}</div>
                <div className="text-sm font-medium">{Math.round(hour.temperature)}°C</div>
                <div className={`text-xs font-medium ${getProductionImpactColor(hour.productionImpact)}`}>
                  {Math.round(hour.productionImpact)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
