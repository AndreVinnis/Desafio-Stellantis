import { z } from 'zod'

const required = (label: string, max: number) =>
  z.string().trim().min(1, `${label} é obrigatório`).max(max, `Máximo de ${max} caracteres`)

export const registerSchema = z
  .object({
    name: required('Nome', 100),
    email: z.email('E-mail inválido').max(150, 'Máximo de 150 caracteres'),
    position: required('Cargo', 100),
    // 72 é o limite de bytes do BCrypt usado no backend
    password: z.string().min(8, 'Mínimo de 8 caracteres').max(72, 'Máximo de 72 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a senha'),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não conferem',
  })

export type RegisterFormValues = z.infer<typeof registerSchema>
