import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import { vehicleSchema, type VehicleFormValues } from '../schemas/vehicleSchema'
import { useDealers } from '../hooks/useDealers'
import { FUEL_TYPES, fuelLabels } from '../types/vehicle'

type Props = {
  defaultValues?: Partial<VehicleFormValues>
  onSubmit: (values: VehicleFormValues) => void
  isPending: boolean
  error?: string | null
}

const emptyValues: Partial<VehicleFormValues> = { fuelsTypes: [] }

const emptyToUndefined = (v: unknown) =>
  v === '' || v == null || Number.isNaN(Number(v)) ? undefined : Number(v)

const fieldStyle = { display: 'flex', flexDirection: 'column', gap: 4 } as const
const errorStyle = { color: 'crimson', fontSize: 13 } as const

export default function VehicleForm({
  defaultValues = emptyValues,
  onSubmit,
  isPending,
  error,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues,
  })
  const dealers = useDealers()

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}
    >
      <label style={fieldStyle}>
        Marca
        <input {...register('mark')} />
        <span style={errorStyle}>{errors.mark?.message}</span>
      </label>

      <label style={fieldStyle}>
        Modelo
        <input {...register('model')} />
        <span style={errorStyle}>{errors.model?.message}</span>
      </label>

      <label style={fieldStyle}>
        Chassi
        <input {...register('chassis')} />
        <span style={errorStyle}>{errors.chassis?.message}</span>
      </label>

      <label style={fieldStyle}>
        Cor
        <input {...register('color')} />
        <span style={errorStyle}>{errors.color?.message}</span>
      </label>

      <label style={fieldStyle}>
        Cor externa
        <input {...register('externalColor')} />
        <span style={errorStyle}>{errors.externalColor?.message}</span>
      </label>

      <label style={fieldStyle}>
        Ano
        <input type="number" {...register('year', { setValueAs: emptyToUndefined })} />
        <span style={errorStyle}>{errors.year?.message}</span>
      </label>

      <label style={fieldStyle}>
        Preço
        <input
          type="number"
          step="0.01"
          {...register('price', { setValueAs: emptyToUndefined })}
        />
        <span style={errorStyle}>{errors.price?.message}</span>
      </label>

      <fieldset style={fieldStyle}>
        <legend>Combustível</legend>
        {FUEL_TYPES.map((fuel) => (
          <label key={fuel}>
            <input type="checkbox" value={fuel} {...register('fuelsTypes')} />{' '}
            {fuelLabels[fuel]}
          </label>
        ))}
        <span style={errorStyle}>{errors.fuelsTypes?.message}</span>
      </fieldset>

      <label style={fieldStyle}>
        Concessionária
        <select
          {...register('dealershipId', { setValueAs: emptyToUndefined })}
          disabled={dealers.isLoading}
        >
          <option value="">Selecione…</option>
          {dealers.data?.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        {dealers.isError && (
          <span style={errorStyle}>Não foi possível carregar as concessionárias.</span>
        )}
        <span style={errorStyle}>{errors.dealershipId?.message}</span>
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
        <Link to="/vehicles">
          <button type="button">Cancelar</button>
        </Link>
      </div>
    </form>
  )
}
