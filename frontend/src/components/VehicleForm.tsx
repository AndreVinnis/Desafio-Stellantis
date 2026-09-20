import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import { Loader2Icon } from 'lucide-react'
import { vehicleSchema, type VehicleFormValues } from '../schemas/vehicleSchema'
import { useDealers } from '../hooks/useDealers'
import { FUEL_TYPES, fuelLabels } from '../types/vehicle'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Props = {
  defaultValues?: Partial<VehicleFormValues>
  onSubmit: (values: VehicleFormValues) => void
  isPending: boolean
}

const emptyValues: Partial<VehicleFormValues> = { fuelsTypes: [] }

const emptyToUndefined = (v: unknown) =>
  v === '' || v == null || Number.isNaN(Number(v)) ? undefined : Number(v)

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null
}

export default function VehicleForm({ defaultValues = emptyValues, onSubmit, isPending }: Props) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues,
  })
  const dealers = useDealers()
  const dealerItems = (dealers.data ?? []).map((d) => ({ value: String(d.id), label: d.name }))

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid max-w-2xl gap-4 md:grid-cols-2">
      <div className="grid gap-2">
        <Label htmlFor="mark">Marca</Label>
        <Input id="mark" aria-invalid={!!errors.mark} {...register('mark')} />
        <FieldError message={errors.mark?.message} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="model">Modelo</Label>
        <Input id="model" aria-invalid={!!errors.model} {...register('model')} />
        <FieldError message={errors.model?.message} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="chassis">Chassi</Label>
        <Input id="chassis" aria-invalid={!!errors.chassis} {...register('chassis')} />
        <FieldError message={errors.chassis?.message} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="color">Cor</Label>
        <Input id="color" aria-invalid={!!errors.color} {...register('color')} />
        <FieldError message={errors.color?.message} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="externalColor">Cor externa</Label>
        <Input id="externalColor" aria-invalid={!!errors.externalColor} {...register('externalColor')} />
        <FieldError message={errors.externalColor?.message} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="year">Ano</Label>
        <Input
          id="year"
          type="number"
          aria-invalid={!!errors.year}
          {...register('year', { setValueAs: emptyToUndefined })}
        />
        <FieldError message={errors.year?.message} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="price">Preço</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          aria-invalid={!!errors.price}
          {...register('price', { setValueAs: emptyToUndefined })}
        />
        <FieldError message={errors.price?.message} />
      </div>

      <div className="grid gap-2">
        <Label>Concessionária</Label>
        <Controller
          control={control}
          name="dealershipId"
          render={({ field }) => (
            <Select
              items={dealerItems}
              value={field.value == null ? null : String(field.value)}
              onValueChange={(v) => field.onChange(v == null ? undefined : Number(v))}
              disabled={dealers.isLoading}
            >
              <SelectTrigger className="w-full" aria-invalid={!!errors.dealershipId}>
                <SelectValue placeholder="Selecione…" />
              </SelectTrigger>
              <SelectContent>
                {dealerItems.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {dealers.isError && (
          <FieldError message="Não foi possível carregar as concessionárias." />
        )}
        <FieldError message={errors.dealershipId?.message} />
      </div>

      <fieldset className="grid gap-2 md:col-span-2">
        <legend className="mb-1 text-sm font-medium">Combustível</legend>
        <Controller
          control={control}
          name="fuelsTypes"
          render={({ field }) => (
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {FUEL_TYPES.map((fuel) => {
                const selected = field.value ?? []
                return (
                  <label key={fuel} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={selected.includes(fuel)}
                      onCheckedChange={(checked) =>
                        field.onChange(
                          checked ? [...selected, fuel] : selected.filter((f) => f !== fuel),
                        )
                      }
                    />
                    {fuelLabels[fuel]}
                  </label>
                )
              })}
            </div>
          )}
        />
        <FieldError message={errors.fuelsTypes?.message} />
      </fieldset>

      <div className="flex gap-2 md:col-span-2">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2Icon className="animate-spin" />}
          {isPending ? 'Salvando…' : 'Salvar'}
        </Button>
        <Button variant="outline" render={<Link to="/vehicles" />} nativeButton={false}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
