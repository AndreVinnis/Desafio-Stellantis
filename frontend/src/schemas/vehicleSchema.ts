import { z } from 'zod'
import { FUEL_TYPES } from '../types/vehicle'

const required = (label: string) =>
  z.string().trim().min(1, `${label} é obrigatório`)

export const vehicleSchema = z.object({
  mark: required('Marca'),
  model: required('Modelo'),
  chassis: required('Chassi'),
  color: required('Cor'),
  externalColor: required('Cor externa'),
  fuelsTypes: z
    .array(z.enum(FUEL_TYPES))
    .min(1, 'Selecione ao menos um combustível'),
  year: z
    .number({ error: 'Ano é obrigatório' })
    .int('Informe um ano válido')
    .min(1900, 'O ano deve ser a partir de 1900')
    .refine((y) => y <= new Date().getFullYear() + 1, 'Ano no futuro não é permitido'),
  price: z
    .number({ error: 'Preço é obrigatório' })
    .gt(0, 'O preço deve ser maior que zero'),
  dealershipId: z.number({ error: 'Selecione uma concessionária' }),
})

export type VehicleFormValues = z.infer<typeof vehicleSchema>
