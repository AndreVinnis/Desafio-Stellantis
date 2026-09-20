import { Link, useParams } from 'react-router'
import { useDealer } from '../hooks/useDealers'
import { isAdmin } from '../utils/jwt'
import { getErrorMessage, getErrorStatus } from '../api/errors'
import { maskCep, maskCnpj } from '../utils/masks'
import { fuelLabels } from '../types/vehicle'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

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

export default function DealerDetailPage() {
  const { id } = useParams()
  const numericId = Number(id)
  const validId = Number.isInteger(numericId)
  const { data: dealer, isLoading, error } = useDealer(numericId)
  const admin = isAdmin()

  if (!validId || getErrorStatus(error) === 404) {
    return <BackToList message="Concessionária não encontrada." />
  }
  if (isLoading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Carregando">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>
    )
  }
  if (error || !dealer) return <BackToList message={getErrorMessage(error)} />

  const { address } = dealer
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">{dealer.name}</h1>
        {admin && (
          <Button render={<Link to={`/dealers/${dealer.id}/edit`} />} nativeButton={false}>
            Editar
          </Button>
        )}
      </div>
      <div className="space-y-1 text-sm">
        <p>
          <span className="text-muted-foreground">CNPJ:</span> {maskCnpj(dealer.cnpj)}
        </p>
        <p>
          <span className="text-muted-foreground">Endereço:</span> {address.street}
          {address.complement ? `, ${address.complement}` : ''} – {address.neighborhood},{' '}
          {address.city}/{address.stateName} – CEP {maskCep(address.cep)}
        </p>
      </div>

      <h2 className="pt-2 text-lg font-semibold">Veículos</h2>
      {dealer.cars.length === 0 ? (
        <p className="text-muted-foreground">Nenhum veículo cadastrado nesta concessionária.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Marca</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Ano</TableHead>
                <TableHead>Cor</TableHead>
                <TableHead>Combustível</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dealer.cars.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.mark}</TableCell>
                  <TableCell>{c.model}</TableCell>
                  <TableCell>{c.year ?? '-'}</TableCell>
                  <TableCell>{c.externalColor}</TableCell>
                  <TableCell>{c.fuelsTypes.map((f) => fuelLabels[f]).join(', ')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Button variant="outline" render={<Link to="/dealers" />} nativeButton={false}>
        Voltar para a lista
      </Button>
    </div>
  )
}
