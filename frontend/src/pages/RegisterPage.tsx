import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { register as registerUser } from '../api/auth'
import { tokenStorage } from '../api/client'
import { getErrorMessage } from '../api/errors'
import { registerSchema, type RegisterFormValues } from '../schemas/registerSchema'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) })

  const mutation = useMutation({
    mutationFn: ({ name, email, password, position }: RegisterFormValues) =>
      registerUser({ name, email, password, position }),
    onSuccess: (token) => {
      // o backend já devolve o token: a conta nasce logada
      tokenStorage.set(token)
      navigate('/vehicles', { replace: true })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Criar conta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="grid gap-4" noValidate>
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" autoComplete="name" {...register('name')} />
              <FieldError message={errors.name?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" autoComplete="email" {...register('email')} />
              <FieldError message={errors.email?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="position">Cargo</Label>
              <Input id="position" autoComplete="organization-title" {...register('position')} />
              <FieldError message={errors.position?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register('password')}
              />
              <FieldError message={errors.password?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register('confirmPassword')}
              />
              <FieldError message={errors.confirmPassword?.message} />
            </div>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2Icon className="animate-spin" />}
              {mutation.isPending ? 'Criando…' : 'Criar conta'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Já tem conta?{' '}
              <Link to="/login" className="underline underline-offset-4">
                Entrar
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
