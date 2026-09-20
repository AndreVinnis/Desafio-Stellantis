import { Link, Navigate, useParams } from 'react-router'
import DealerForm from '../components/DealerForm'
import { getErrorMessage, getErrorStatus } from '../api/errors'
import { useCreateDealer, useDealer, useUpdateDealer } from '../hooks/useDealers'
import { isAdmin } from '../utils/jwt'
import { maskCep, maskCnpj } from '../utils/masks'
import { toDealerInput, type DealerFormValues } from '../schemas/dealerSchema'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

function BackToList({ message }: { message: string }) {
  return (
    <Alert variant="destructive" className="max-w-xl">
      <AlertDescription className="flex flex-wrap items-center gap-3">
        {message}
        <Button size="sm" variant="outline" render={<Link to="/dealers" />} nativeButton={false}>
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

function CreateDealer() {
  const create = useCreateDealer()
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Nova concessionária</h1>
      <DealerForm
        onSubmit={(values) => create.mutate(toDealerInput(values))}
        isPending={create.isPending}
      />
    </div>
  )
}

function EditDealer({ id }: { id: number }) {
  const { data: dealer, isLoading, error } = useDealer(id)
  const update = useUpdateDealer(id)

  if (isLoading) return <FormSkeleton />
  if (getErrorStatus(error) === 404) return <BackToList message="Concessionária não encontrada." />
  if (error || !dealer) return <BackToList message={getErrorMessage(error)} />

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
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Editar concessionária</h1>
      <DealerForm
        defaultValues={defaultValues}
        onSubmit={(values) => update.mutate(toDealerInput(values))}
        isPending={update.isPending}
      />
    </div>
  )
}

export default function DealerFormPage() {
  const { id } = useParams()
  const admin = isAdmin()
  // criar e editar exigem ADMIN no backend
  if (!admin) return <Navigate to="/dealers" replace />
  if (id === undefined) return <CreateDealer />
  const numericId = Number(id)
  if (!Number.isInteger(numericId)) return <BackToList message="Concessionária não encontrada." />
  return <EditDealer id={numericId} />
}
