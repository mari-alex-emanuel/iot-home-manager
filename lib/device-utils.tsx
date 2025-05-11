import type React from "react"
import {
  LightbulbIcon,
  Power,
  Thermometer,
  Droplets,
  DoorClosed,
  AppWindowIcon as WindowIcon,
  Zap,
  Snowflake,
  Flame,
  AlarmSmokeIcon as Smoke,
  MoveIcon as Motion,
} from "lucide-react"
import { IconWrapper } from "@/components/ui/icon-wrapper"
import type { DeviceType } from "@/lib/types"

export function getDeviceIcon(type: DeviceType | string): React.ReactNode {
  switch (type) {
    case "light":
      return <IconWrapper icon={LightbulbIcon} color="text-yellow-500" />
    case "outlet":
      return <IconWrapper icon={Power} color="text-purple-500" />
    case "thermostat":
      return <IconWrapper icon={Thermometer} color="text-red-500" />
    case "humidity":
      return <IconWrapper icon={Droplets} color="text-blue-500" />
    case "door":
      return <IconWrapper icon={DoorClosed} color="text-blue-500" />
    case "window":
      return <IconWrapper icon={WindowIcon} color="text-gray-500" />
    case "energy":
      return <IconWrapper icon={Zap} color="text-green-500" />
    case "ac":
      return <IconWrapper icon={Snowflake} color="text-blue-500" />
    case "heating":
      return <IconWrapper icon={Flame} color="text-orange-500" />
    case "smoke_detector":
      return <IconWrapper icon={Smoke} color="text-red-500" />
    case "motion_sensor":
      return <IconWrapper icon={Motion} color="text-blue-500" />
    default:
      return <IconWrapper icon={LightbulbIcon} color="text-gray-500" />
  }
}

import type {
  ACDevice,
  Device,
  DoorDevice,
  HeatingDevice,
  HumidityDevice,
  LightDevice,
  MotionSensorDevice,
  OutletDevice,
  SmokeDetectorDevice,
  ThermostatDevice,
  WindowDevice,
  EnergyDevice,
} from "@/lib/types"

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
