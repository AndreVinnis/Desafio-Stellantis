import type { Vehicle } from './vehicle'

export type Address = {
  id?: number
  cep: string
  street: string
  complement?: string | null
  neighborhood: string
  city: string
  stateName: string
}

export type Dealer = {
  id: number
  name: string
  cnpj: string
  address: Address
  cars: Vehicle[]
}

export type DealerInput = {
  name: string
  cnpj: string
  address: Omit<Address, 'id'>
}
