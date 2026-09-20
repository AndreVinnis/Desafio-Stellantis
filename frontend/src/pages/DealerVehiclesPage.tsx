import { Link, useParams } from 'react-router'
import { useDealer } from '../hooks/useDealers'
import { getErrorMessage, getErrorStatus } from '../api/errors'
import { fuelLabels } from '../types/vehicle'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import TableSkeleton from '@/components/TableSkeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const columns = ['Marca', 'Modelo', 'Ano', 'Cor', 'Combustível', 'Ações']

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

export default function DealerVehiclesPage() {
  const { id } = useParams()
  const numericId = Number(id)
  const validId = Number.isInteger(numericId)
  const { data: dealer, isLoading, error } = useDealer(numericId)

  if (!validId || getErrorStatus(error) === 404) {
    return <BackToList message="Concessionária não encontrada." />
  }
  if (isLoading) return <TableSkeleton columns={columns} />
  if (error || !dealer) return <BackToList message={getErrorMessage(error)} />

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Veículos de {dealer.name}</h1>
        <Button render={<Link to="/vehicles/new" />} nativeButton={false}>
          Novo veículo
        </Button>
      </div>

      {dealer.cars.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
          Nenhum veículo cadastrado nesta concessionária.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((c) => (
                  <TableHead key={c}>{c}</TableHead>
                ))}
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
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      render={<Link to={`/vehicles/${c.id}/edit`} />}
                      nativeButton={false}
                    >
                      Editar
                    </Button>
                  </TableCell>
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
