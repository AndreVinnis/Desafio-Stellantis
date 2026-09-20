import { z } from 'zod'
import { isValidCnpj } from '../utils/cnpj'
import { maskCep, onlyDigits } from '../utils/masks'
import type { DealerInput } from '../types/dealer'

const required = (label: string, max: number) =>
  z.string().trim().min(1, `${label} é obrigatório`).max(max, `Máximo de ${max} caracteres`)

export const dealerSchema = z.object({
  name: required('Nome', 100),
  cnpj: z.string().refine(isValidCnpj, 'CNPJ inválido'),
  address: z.object({
    cep: z.string().refine((v) => onlyDigits(v).length === 8, 'CEP deve ter 8 dígitos'),
    street: required('Logradouro', 150),
    complement: z.string().trim().max(100, 'Máximo de 100 caracteres').optional(),
    neighborhood: required('Bairro', 100),
    city: required('Cidade', 100),
    stateName: required('Estado', 50),
  }),
})

export type DealerFormValues = z.infer<typeof dealerSchema>

// O backend guarda o CNPJ só com dígitos e exige o CEP no formato 00000-000.
export const toDealerInput = (v: DealerFormValues): DealerInput => ({
  name: v.name,
  cnpj: onlyDigits(v.cnpj),
  address: {
    ...v.address,
    cep: maskCep(v.address.cep),
    complement: v.address.complement || null,
  },
})
