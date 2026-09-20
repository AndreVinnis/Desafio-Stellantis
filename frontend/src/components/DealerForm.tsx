import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import { Loader2Icon } from 'lucide-react'
import { dealerSchema, type DealerFormValues } from '../schemas/dealerSchema'
import { fetchCep } from '../api/viacep'
import { maskCep, maskCnpj, onlyDigits } from '../utils/masks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Props = {
  defaultValues?: Partial<DealerFormValues>
  onSubmit: (values: DealerFormValues) => void
  isPending: boolean
}

type AddressField = 'street' | 'neighborhood' | 'city' | 'stateName'

type CepStatus = 'idle' | 'loading' | 'notFound' | 'error'

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null
}

export default function DealerForm({ defaultValues, onSubmit, isPending }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<DealerFormValues>({
    resolver: zodResolver(dealerSchema),
    defaultValues,
  })
  const [cepStatus, setCepStatus] = useState<CepStatus>('idle')

  const cepDigits = onlyDigits(watch('address.cep') ?? '')
  // na edição, o CEP salvo não deve sobrescrever o endereço já cadastrado
  const initialCep = useRef(onlyDigits(defaultValues?.address?.cep ?? ''))
  // o que foi preenchido pelo ViaCEP, para não sobrescrever o que o usuário digitou
  const autoFilled = useRef<Partial<Record<AddressField, string>>>({})

  useEffect(() => {
    if (cepDigits.length !== 8) {
      setCepStatus('idle')
      return
    }
    if (cepDigits === initialCep.current) return

    const controller = new AbortController()
    setCepStatus('loading')
    fetchCep(cepDigits, controller.signal)
      .then((data) => {
        if (!data) {
          setCepStatus('notFound')
          return
        }
        const fill = (field: AddressField, value: string) => {
          const current = getValues(`address.${field}`)
          // só preenche campo vazio ou que ainda tem o valor de uma busca anterior
          if (current && current !== autoFilled.current[field]) return
          autoFilled.current[field] = value
          setValue(`address.${field}`, value, { shouldValidate: true, shouldDirty: true })
        }
        fill('street', data.logradouro)
        fill('neighborhood', data.bairro)
        fill('city', data.localidade)
        fill('stateName', data.uf)
        setCepStatus('idle')
      })
      .catch(() => {
        // abort() do cleanup (CEP mudou ou form desmontou): a nova busca cuida do estado
        if (!controller.signal.aborted) setCepStatus('error')
      })
    return () => controller.abort()
  }, [cepDigits, setValue, getValues])

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid max-w-2xl gap-4 md:grid-cols-2">
      <div className="grid gap-2">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" aria-invalid={!!errors.name} {...register('name')} />
        <FieldError message={errors.name?.message} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="cnpj">CNPJ</Label>
        <Input
          id="cnpj"
          inputMode="numeric"
          placeholder="00.000.000/0000-00"
          aria-invalid={!!errors.cnpj}
          {...register('cnpj', {
            onChange: (e) => setValue('cnpj', maskCnpj(e.target.value)),
          })}
        />
        <FieldError message={errors.cnpj?.message} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="cep">CEP</Label>
        <Input
          id="cep"
          inputMode="numeric"
          placeholder="00000-000"
          aria-invalid={!!errors.address?.cep}
          {...register('address.cep', {
            onChange: (e) => setValue('address.cep', maskCep(e.target.value)),
          })}
        />
        {cepStatus === 'loading' && (
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <Loader2Icon className="size-3.5 animate-spin" /> Buscando CEP…
          </p>
        )}
        {cepStatus === 'notFound' && <FieldError message="CEP não encontrado." />}
        {cepStatus === 'error' && (
          <FieldError message="Não foi possível buscar o CEP. Preencha manualmente." />
        )}
        <FieldError message={errors.address?.cep?.message} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="street">Logradouro</Label>
        <Input id="street" aria-invalid={!!errors.address?.street} {...register('address.street')} />
        <FieldError message={errors.address?.street?.message} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="complement">Complemento (opcional)</Label>
        <Input id="complement" {...register('address.complement')} />
        <FieldError message={errors.address?.complement?.message} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="neighborhood">Bairro</Label>
        <Input
          id="neighborhood"
          aria-invalid={!!errors.address?.neighborhood}
          {...register('address.neighborhood')}
        />
        <FieldError message={errors.address?.neighborhood?.message} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="city">Cidade</Label>
        <Input id="city" aria-invalid={!!errors.address?.city} {...register('address.city')} />
        <FieldError message={errors.address?.city?.message} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="stateName">Estado</Label>
        <Input
          id="stateName"
          aria-invalid={!!errors.address?.stateName}
          {...register('address.stateName')}
        />
        <FieldError message={errors.address?.stateName?.message} />
      </div>

      <div className="flex gap-2 md:col-span-2">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2Icon className="animate-spin" />}
          {isPending ? 'Salvando…' : 'Salvar'}
        </Button>
        <Button variant="outline" render={<Link to="/dealers" />} nativeButton={false}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
