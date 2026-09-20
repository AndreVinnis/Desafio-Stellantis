import { api } from './client'
import type { Dealer, DealerInput } from '../types/dealer'

const BASE = '/dealer'

export const dealersApi = {
  list: async () => {
    const { data } = await api.get<Dealer[]>(BASE)
    return data
  },

  get: async (id: number) => {
    const { data } = await api.get<Dealer>(`${BASE}/${id}`)
    return data
  },

  create: async (input: DealerInput) => {
    const { data } = await api.post<Dealer>(`${BASE}/create`, input)
    return data
  },

  update: async (id: number, input: DealerInput) => {
    const { data } = await api.put<Dealer>(`${BASE}/${id}`, input)
    return data
  },

  remove: async (id: number) => {
    await api.delete(`${BASE}/${id}`)
  },
}
