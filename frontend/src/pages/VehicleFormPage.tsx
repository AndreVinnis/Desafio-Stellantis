import { Link, useParams } from 'react-router'
import VehicleForm from '../components/VehicleForm'
import { getErrorMessage, getErrorStatus } from '../api/errors'
import { useCreateVehicle, useUpdateVehicle, useVehicle } from '../hooks/useVehicles'
import type { VehicleFormValues } from '../schemas/vehicleSchema'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

function BackToList({ message }: { message: string }) {
  return (
    <Alert variant="destructive" className="max-w-xl">
      <AlertDescription className="flex flex-wrap items-center gap-3">
        {message}
        <Button size="sm" variant="outline" render={<Link to="/vehicles" />} nativeButton={false}>
          Voltar para a lista
        </Button>
      </AlertDescription>
    </Alert>
  )
}

function FormSkeleton() {
  return (
    <div className="grid max-w-2xl gap-4 md:grid-cols-2" aria-busy="true" aria-label="Carregando">
      {Array.from({ length: 8 }, (_, i) => (
        <Skeleton key={i} className="h-9 w-full" />
      ))}
    </div>
  )
}

function CreateVehicle() {
  const create = useCreateVehicle()
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Novo veículo</h1>
      <VehicleForm onSubmit={(values) => create.mutate(values)} isPending={create.isPending} />
    </div>
  )
}

function EditVehicle({ id }: { id: number }) {
  const { data: vehicle, isLoading, error } = useVehicle(id)
  const update = useUpdateVehicle(id)

  if (isLoading) return <FormSkeleton />
  if (getErrorStatus(error) === 404) return <BackToList message="Veículo não encontrado." />
  if (error || !vehicle) return <BackToList message={getErrorMessage(error)} />

  const defaultValues: Partial<VehicleFormValues> = {
    mark: vehicle.mark,
    model: vehicle.model,
    chassis: vehicle.chassis,
    color: vehicle.color,
    externalColor: vehicle.externalColor,
    fuelsTypes: vehicle.fuelsTypes,
    year: vehicle.year ?? undefined,
    price: vehicle.price ?? undefined,
    dealershipId: vehicle.dealershipId ?? undefined,
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Editar veículo</h1>
      <VehicleForm
        defaultValues={defaultValues}
        onSubmit={(values) => update.mutate(values)}
        isPending={update.isPending}
      />
    </div>
  )
}

export default function VehicleFormPage() {
  const { id } = useParams()
  if (id === undefined) return <CreateVehicle />
  const numericId = Number(id)
  if (!Number.isInteger(numericId)) return <BackToList message="Veículo não encontrado." />
  return <EditVehicle id={numericId} />
}
