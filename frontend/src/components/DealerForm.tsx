import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import { dealerSchema, type DealerFormValues } from '../schemas/dealerSchema'
import { fetchCep } from '../api/viacep'
import { maskCep, maskCnpj, onlyDigits } from '../utils/masks'

type Props = {
  defaultValues?: Partial<DealerFormValues>
  onSubmit: (values: DealerFormValues) => void
  isPending: boolean
  error?: string | null
}

type AddressField = 'street' | 'neighborhood' | 'city' | 'stateName'

type CepStatus = 'idle' | 'loading' | 'notFound' | 'error'

const fieldStyle = { display: 'flex', flexDirection: 'column', gap: 4 } as const
const errorStyle = { color: 'crimson', fontSize: 13 } as const

export default function DealerForm({ defaultValues, onSubmit, isPending, error }: Props) {
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}
    >
      <label style={fieldStyle}>
        Nome
        <input {...register('name')} />
        <span style={errorStyle}>{errors.name?.message}</span>
      </label>

      <label style={fieldStyle}>
        CNPJ
        <input
          inputMode="numeric"
          placeholder="00.000.000/0000-00"
          {...register('cnpj', {
            onChange: (e) => setValue('cnpj', maskCnpj(e.target.value)),
          })}
        />
        <span style={errorStyle}>{errors.cnpj?.message}</span>
      </label>

      <label style={fieldStyle}>
        CEP
        <input
          inputMode="numeric"
          placeholder="00000-000"
          {...register('address.cep', {
            onChange: (e) => setValue('address.cep', maskCep(e.target.value)),
          })}
        />
        {cepStatus === 'loading' && <span>Buscando CEP…</span>}
        {cepStatus === 'notFound' && <span style={errorStyle}>CEP não encontrado</span>}
        {cepStatus === 'error' && (
          <span style={errorStyle}>Não foi possível buscar o CEP. Preencha manualmente.</span>
        )}
        <span style={errorStyle}>{errors.address?.cep?.message}</span>
      </label>

      <label style={fieldStyle}>
        Logradouro
        <input {...register('address.street')} />
        <span style={errorStyle}>{errors.address?.street?.message}</span>
      </label>

      <label style={fieldStyle}>
        Complemento (opcional)
        <input {...register('address.complement')} />
        <span style={errorStyle}>{errors.address?.complement?.message}</span>
      </label>

      <label style={fieldStyle}>
        Bairro
        <input {...register('address.neighborhood')} />
        <span style={errorStyle}>{errors.address?.neighborhood?.message}</span>
      </label>

      <label style={fieldStyle}>
        Cidade
        <input {...register('address.city')} />
        <span style={errorStyle}>{errors.address?.city?.message}</span>
      </label>

      <label style={fieldStyle}>
        Estado
        <input {...register('address.stateName')} />
        <span style={errorStyle}>{errors.address?.stateName?.message}</span>
      </label>

      {error && (
        <p role="alert" style={errorStyle}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" disabled={isPending}>
          {isPending ? 'Salvando…' : 'Salvar'}
        </button>
        <Link to="/dealers">
          <button type="button">Cancelar</button>
        </Link>
      </div>
    </form>
  )
}
