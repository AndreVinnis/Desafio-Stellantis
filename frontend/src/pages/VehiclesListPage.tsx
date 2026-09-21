import { useState } from 'react'
import { Link } from 'react-router'
import { useDeleteVehicle, useVehicles } from '../hooks/useVehicles'
import { formatPrice } from '../lib/format'
import { fuelLabels } from '../types/vehicle'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog'
import TableSkeleton from '@/components/TableSkeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const columns = ['Marca', 'Modelo', 'Ano', 'Cor', 'Combustível', 'Preço', 'Concessionária', 'Ações']

export default function VehiclesListPage() {
  const { data: vehicles, isLoading, isError, refetch } = useVehicles()
  const remove = useDeleteVehicle()
  const [toDelete, setToDelete] = useState<{ id: number; label: string } | null>(null)

  const confirmDelete = () => {
    if (!toDelete) return
    remove.mutate(toDelete.id, { onSettled: () => setToDelete(null) })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Veículos</h1>
        <Button render={<Link to="/vehicles/new" />} nativeButton={false}>
          Novo veículo
        </Button>
      </div>

      {isLoading && <TableSkeleton columns={columns} />}

      {isError && (
        <Alert variant="destructive">
          <AlertDescription className="flex flex-wrap items-center gap-3">
            Não foi possível carregar os veículos.
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Tentar de novo
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {vehicles && vehicles.length === 0 && (
        <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
          <p>Nenhum veículo cadastrado.</p>
          <Button className="mt-3" render={<Link to="/vehicles/new" />} nativeButton={false}>
            Cadastrar o primeiro veículo
          </Button>
        </div>
      )}

      {vehicles && vehicles.length > 0 && (
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
              {vehicles.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>{v.mark}</TableCell>
                  <TableCell>{v.model}</TableCell>
                  <TableCell>{v.year ?? '-'}</TableCell>
                  <TableCell>{v.externalColor}</TableCell>
                  <TableCell>{v.fuelsTypes.map((f) => fuelLabels[f]).join(', ')}</TableCell>
                  <TableCell>{formatPrice(v.price)}</TableCell>
                  <TableCell>{v.dealershipName}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        render={<Link to={`/vehicles/${v.id}/edit`} />}
                        nativeButton={false}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setToDelete({ id: v.id, label: `${v.mark} ${v.model}` })}
                      >
                        Excluir
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDeleteDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && !remove.isPending && setToDelete(null)}
        title="Excluir veículo"
        description={`Deseja excluir o veículo ${toDelete?.label ?? ''}? Esta ação não pode ser desfeita.`}
        pending={remove.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
