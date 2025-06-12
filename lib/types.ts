// Tipuri de bază pentru dispozitive
export interface BaseDevice {
  id: number
  name: string
  roomId: number
  status: "Online" | "Offline"
  lastActive: string
  serialNumber?: string
  manufacturer?: string
  model?: string
  firmwareVersion?: string
  ipAddress?: string
  macAddress?: string
  powerConsumption?: string
  batteryLevel?: string
  installationDate?: string
  // Adăugăm informații despre cost și economii
  initialCost?: number
  installationCost?: number
  monthlySavings?: number
  lifespan?: number // durata de viață în luni
}

// Dispozitiv de tip lumină
export interface LightDevice extends BaseDevice {
  type: "light"
  brightness?: number // Intensitatea luminii (0-100%)
  color?: string // Culoarea luminii în format hex (#RRGGBB)
}

// Dispozitiv de tip priză
export interface OutletDevice extends BaseDevice {
  type: "outlet"
}

// Dispozitiv de tip termostat
export interface ThermostatDevice extends BaseDevice {
  type: "thermostat"
  temperature?: number // Temperatura setată
  manualOverride?: boolean
}

// Dispozitiv de tip senzor de umiditate
export interface HumidityDevice extends BaseDevice {
  type: "humidity"
}

// Dispozitiv de tip ușă
export interface DoorDevice extends BaseDevice {
  type: "door"
  isLocked?: boolean
  isOpen?: boolean
}

// Dispozitiv de tip fereastră
export interface WindowDevice extends BaseDevice {
  type: "window"
  isOpen?: boolean
}

// Dispozitiv de tip monitor de energie
export interface EnergyDevice extends BaseDevice {
  type: "energy"
}

// Dispozitiv de tip aer condiționat
export interface ACDevice extends BaseDevice {
  type: "ac"
  temperature?: number
  manualOverride?: boolean
}

// Dispozitiv de tip încălzire
export interface HeatingDevice extends BaseDevice {
  type: "heating"
  temperature?: number
  manualOverride?: boolean
}

// Smoke Detector Device
export interface SmokeDetectorDevice extends BaseDevice {
  type: "smoke_detector"
  smokeDetected?: boolean
  alarmActive?: boolean
}

// Motion Sensor Device
export interface MotionSensorDevice extends BaseDevice {
  type: "motion_sensor"
  motionDetected?: boolean
  autoLightControl?: boolean
  lastMotionDetected?: string
}

// Dispozitiv de tip altele
export interface OtherDevice extends BaseDevice {
  type: "other"
}

// Uniune de tipuri pentru toate dispozitivele
export type Device =
  | LightDevice
  | OutletDevice
  | ThermostatDevice
  | HumidityDevice
  | DoorDevice
  | WindowDevice
  | EnergyDevice
  | ACDevice
  | HeatingDevice
  | OtherDevice
  | SmokeDetectorDevice
  | MotionSensorDevice

export interface Room {
  id: number
  name: string
  type: string
  devices: number[] // Array de ID-uri de dispozitive
  temperatureRange?: {
    min: number
    max: number
  }
}

export interface SmartHomeData {
  rooms: Room[]
  devices: Device[]
}

export type DeviceType =
  | "light"
  | "outlet"
  | "door"
  | "thermostat"
  | "energy"
  | "humidity"
  | "other"
  | "ac"
  | "heating"
  | "window"
  | "smoke_detector"
  | "motion_sensor"

export interface RoomTypeInfo {
  label: string
  value: string
}

export const roomTypes: RoomTypeInfo[] = [
  { value: "living", label: "Living Room" },
  { value: "bedroom", label: "Bedroom" },
  { value: "kitchen", label: "Kitchen" },
  { value: "bathroom", label: "Bathroom" },
  { value: "garage", label: "Garage" },
  { value: "entrance", label: "Entrance" },
  { value: "other", label: "Other" },
]

export const deviceTypes: RoomTypeInfo[] = [
  { value: "light", label: "Light" },
  { value: "outlet", label: "Outlet" },
  { value: "thermostat", label: "Thermostat" },
  { value: "humidity", label: "Humidity Sensor" },
  { value: "door", label: "Door Sensor" },
  { value: "window", label: "Window Sensor" },
  { value: "energy", label: "Energy Monitor" },
  { value: "ac", label: "Air Conditioner" },
  { value: "heating", label: "Heating System" },
  { value: "smoke_detector", label: "Smoke Detector" },
  { value: "motion_sensor", label: "Motion Sensor" },
  { value: "other", label: "Other" },
]

// Type guards pentru verificarea tipurilor de dispozitive
export function isLightDevice(device: Device): device is LightDevice {
  return device.type === "light"
}

export function isOutletDevice(device: Device): device is OutletDevice {
  return device.type === "outlet"
}

export function isThermostatDevice(device: Device): device is ThermostatDevice {
  return device.type === "thermostat"
}

export function isHumidityDevice(device: Device): device is HumidityDevice {
  return device.type === "humidity"
}

export function isDoorDevice(device: Device): device is DoorDevice {
  return device.type === "door"
}

export function isWindowDevice(device: Device): device is WindowDevice {
  return device.type === "window"
}

export function isEnergyDevice(device: Device): device is EnergyDevice {
  return device.type === "energy"
}

export function isACDevice(device: Device): device is ACDevice {
  return device.type === "ac"
}

export function isHeatingDevice(device: Device): device is HeatingDevice {
  return device.type === "heating"
}

export function isSmokeDetectorDevice(device: Device): device is SmokeDetectorDevice {
  return device.type === "smoke_detector"
}

export function isMotionSensorDevice(device: Device): device is MotionSensorDevice {
  return device.type === "motion_sensor"
}

// Adăugăm tipuri pentru amortizare
export interface AmortizationData {
  deviceId: number
  initialCost: number
  installationCost: number
  monthlySavings: number
  lifespan: number // în luni
  notes?: string
}

export interface AmortizationSummary {
  totalInvestment: number
  totalMonthlySavings: number
  averagePaybackPeriod: number
  amortizedDevices: number
  totalDevices: number
}
