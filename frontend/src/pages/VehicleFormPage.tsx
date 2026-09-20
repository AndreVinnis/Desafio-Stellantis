import { Link, useParams } from 'react-router'
import VehicleForm from '../components/VehicleForm'
import { getErrorMessage, getErrorStatus } from '../api/errors'
import {
  useCreateVehicle,
  useUpdateVehicle,
  useVehicle,
} from '../hooks/useVehicles'
import type { VehicleFormValues } from '../schemas/vehicleSchema'

function NotFound() {
  return (
    <div role="alert">
      <p>Veículo não encontrado.</p>
      <Link to="/vehicles">Voltar para a lista</Link>
    </div>
  )
}

function CreateVehicle() {
  const create = useCreateVehicle()
  return (
    <>
      <h1>Novo veículo</h1>
      <VehicleForm
        onSubmit={(values) => create.mutate(values)}
        isPending={create.isPending}
        error={create.isError ? getErrorMessage(create.error) : null}
      />
    </>
  )
}

function EditVehicle({ id }: { id: number }) {
  const { data: vehicle, isLoading, error } = useVehicle(id)
  const update = useUpdateVehicle(id)

  if (isLoading) return <p>Carregando…</p>
  if (getErrorStatus(error) === 404) return <NotFound />

  if (error || !vehicle) {
    return (
      <div role="alert">
        <p>{getErrorMessage(error)}</p>
        <Link to="/vehicles">Voltar para a lista</Link>
      </div>
    )
  }

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
    <>
      <h1>Editar veículo</h1>
      <VehicleForm
        defaultValues={defaultValues}
        onSubmit={(values) => update.mutate(values)}
        isPending={update.isPending}
        error={update.isError ? getErrorMessage(update.error) : null}
      />
    </>
  )
}

export default function VehicleFormPage() {
  const { id } = useParams()
  if (id === undefined) return <CreateVehicle />
  const numericId = Number(id)
  if (!Number.isInteger(numericId)) return <NotFound />
  return <EditVehicle id={numericId} />
}
