import { api } from './client'

export const login = async (email: string, password: string) => {
  const { data } = await api.post<{ token: string }>('/auth/login', { email, password })
  return data.token
}

export type RegisterInput = { name: string; email: string; password: string; position: string }

export const register = async (input: RegisterInput) => {
  const { data } = await api.post<{ token: string }>('/auth/register', input)
  return data.token
}
