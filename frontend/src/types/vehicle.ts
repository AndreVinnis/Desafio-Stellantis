export const FUEL_TYPES = [
  'GASOLINE',
  'ETHANOL',
  'DIESEL',
  'FLEX',
  'ELECTRICITY',
  'HYBRID',
] as const

export type FuelType = (typeof FUEL_TYPES)[number]

export const fuelLabels: Record<FuelType, string> = {
  GASOLINE: 'Gasolina',
  ETHANOL: 'Etanol',
  DIESEL: 'Diesel',
  FLEX: 'Flex',
  ELECTRICITY: 'Elétrico',
  HYBRID: 'Híbrido',
}

export type Vehicle = {
  id: number
  mark: string
  model: string
  chassis: string
  year: number | null
  price: number | null
  color: string
  externalColor: string
  fuelsTypes: FuelType[]
  dealershipId: number | null
  dealershipName: string
}

export type VehicleInput = {
  mark: string
  model: string
  chassis: string
  year: number
  price: number
  fuelsTypes: FuelType[]
  color: string
  externalColor: string
  dealershipId: number
}
