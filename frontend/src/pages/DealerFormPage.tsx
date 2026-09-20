import { Link, Navigate, useParams } from 'react-router'
import DealerForm from '../components/DealerForm'
import { getErrorMessage, getErrorStatus } from '../api/errors'
import { useCreateDealer, useDealer, useUpdateDealer } from '../hooks/useDealers'
import { isAdmin } from '../utils/jwt'
import { maskCep, maskCnpj } from '../utils/masks'
import { toDealerInput, type DealerFormValues } from '../schemas/dealerSchema'

function NotFound() {
  return (
    <div role="alert">
      <p>Concessionária não encontrada.</p>
      <Link to="/dealers">Voltar para a lista</Link>
    </div>
  )
}

function CreateDealer() {
  const create = useCreateDealer()
  return (
    <>
      <h1>Nova concessionária</h1>
      <DealerForm
        onSubmit={(values) => create.mutate(toDealerInput(values))}
        isPending={create.isPending}
        error={create.isError ? getErrorMessage(create.error) : null}
      />
    </>
  )
}

function EditDealer({ id }: { id: number }) {
  const { data: dealer, isLoading, error } = useDealer(id)
  const update = useUpdateDealer(id)

  if (isLoading) return <p>Carregando…</p>
  if (getErrorStatus(error) === 404) return <NotFound />

  if (error || !dealer) {
    return (
      <div role="alert">
        <p>{getErrorMessage(error)}</p>
        <Link to="/dealers">Voltar para a lista</Link>
      </div>
    )
  }

  const defaultValues: Partial<DealerFormValues> = {
    name: dealer.name,
    cnpj: maskCnpj(dealer.cnpj),
    address: {
      cep: maskCep(dealer.address.cep),
      street: dealer.address.street,
      complement: dealer.address.complement ?? '',
      neighborhood: dealer.address.neighborhood,
      city: dealer.address.city,
      stateName: dealer.address.stateName,
    },
  }

  return (
    <>
      <h1>Editar concessionária</h1>
      <DealerForm
        defaultValues={defaultValues}
        onSubmit={(values) => update.mutate(toDealerInput(values))}
        isPending={update.isPending}
        error={update.isError ? getErrorMessage(update.error) : null}
      />
    </>
  )
}

export default function DealerFormPage() {
  const { id } = useParams()
  const admin = isAdmin()
  // criar e editar exigem ADMIN no backend
  if (!admin) return <Navigate to="/dealers" replace />
  if (id === undefined) return <CreateDealer />
  const numericId = Number(id)
  if (!Number.isInteger(numericId)) return <NotFound />
  return <EditDealer id={numericId} />
}
