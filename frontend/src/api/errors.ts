import { isAxiosError } from 'axios'

type ApiError = { message?: string; fields?: Record<string, string> }

export const getErrorStatus = (error: unknown) =>
  isAxiosError(error) ? error.response?.status : undefined

export function getErrorMessage(error: unknown): string {
  if (!isAxiosError<ApiError>(error)) return 'Erro inesperado. Tente novamente.'
  const data = error.response?.data
  if (!data || typeof data !== 'object') {
    return error.response
      ? 'Erro inesperado. Tente novamente.'
      : 'Não foi possível conectar ao servidor.'
  }
  const fields = data.fields ? Object.entries(data.fields) : []
  if (fields.length > 0) {
    return `${data.message ?? 'Dados inválidos'}: ${fields
      .map(([campo, msg]) => `${campo} (${msg})`)
      .join(', ')}`
  }
  if (data.message) return data.message
  if (error.response?.status === 403) return 'Você não tem permissão para realizar esta ação.'
  return 'Erro inesperado. Tente novamente.'
}
