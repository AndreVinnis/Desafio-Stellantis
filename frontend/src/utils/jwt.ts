import { tokenStorage } from '../api/client'

export function getRoles(): string[] {
  const token = tokenStorage.get()
  if (!token) return []
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const { roles } = JSON.parse(atob(payload))
    return Array.isArray(roles) ? roles : []
  } catch {
    return []
  }
}

export const isAdmin = () => getRoles().includes('ADMIN')
