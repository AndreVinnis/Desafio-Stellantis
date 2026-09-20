import { api } from './client'
import type { Vehicle, VehicleInput } from '../types/vehicle'

const BASE = '/vehicles'

export const vehiclesApi = {
  list: async () => {
    const { data } = await api.get<Vehicle[]>(BASE)
    return data
  },

  get: async (id: number) => {
    const { data } = await api.get<Vehicle>(`${BASE}/${id}`)
    return data
  },

  // O backend expõe o POST em /vehicles/create
  create: async (input: VehicleInput) => {
    const { data } = await api.post<Vehicle>(`${BASE}/create`, input)
    return data
  },

  update: async (id: number, input: VehicleInput) => {
    const { data } = await api.put<Vehicle>(`${BASE}/${id}`, input)
    return data
  },

  remove: async (id: number) => {
    await api.delete(`${BASE}/${id}`)
  },
}
