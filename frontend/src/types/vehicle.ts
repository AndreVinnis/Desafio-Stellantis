export const FUEL_TYPES = [
  'GASOLINE',
  'ETHANOL',
  'DIESEL',
  'FLEX',
  'ELECTRICITY',
  'HYBRID',
] as const

export type FuelType = (typeof FUEL_TYPES)[number]

export type Vehicle = {
  id: number
  mark: string
  model: string
  year: number | null
  price: number | null
  externalColor: string
}

export type VehicleInput = {
  mark: string
  model: string
  chassis: string
  year?: number | null
  price?: number | null
  fuelsTypes: FuelType[]
  color: string
  externalColor: string
  dealershipId?: number | null
}
