import { isAxiosError } from 'axios'

type ApiError = { message?: string; fields?: Record<string, string> }

export const getErrorStatus = (error: unknown) =>
  isAxiosError(error) ? error.response?.status : undefined

export function getErrorMessage(error: unknown): string {
  if (!isAxiosError<ApiError>(error)) return 'Erro inesperado. Tente novamente.'
  const data = error.response?.data
  if (!data) return 'Não foi possível conectar ao servidor.'
  const fields = data.fields ? Object.entries(data.fields) : []
  if (fields.length > 0) {
    return `${data.message ?? 'Dados inválidos'}: ${fields
      .map(([campo, msg]) => `${campo} (${msg})`)
      .join(', ')}`
  }
  return data.message ?? 'Erro inesperado. Tente novamente.'
}
