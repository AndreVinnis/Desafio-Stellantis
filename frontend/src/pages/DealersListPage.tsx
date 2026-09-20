import { useState } from 'react'
import { Link } from 'react-router'
import { useDealers, useDeleteDealer } from '../hooks/useDealers'
import { isAdmin } from '../utils/jwt'
import { maskCnpj } from '../utils/masks'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog'
import TableSkeleton from '@/components/TableSkeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const columns = ['Nome', 'CNPJ', 'Cidade/UF', 'Ações']

export default function DealersListPage() {
  const { data: dealers, isLoading, isError, refetch } = useDealers()
  const remove = useDeleteDealer()
  const admin = isAdmin()
  const [toDelete, setToDelete] = useState<{ id: number; name: string } | null>(null)

  const confirmDelete = () => {
    if (!toDelete) return
    remove.mutate(toDelete.id, { onSettled: () => setToDelete(null) })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Concessionárias</h1>
        {admin && (
          <Button render={<Link to="/dealers/new" />} nativeButton={false}>
            Nova concessionária
          </Button>
        )}
      </div>

      {isLoading && <TableSkeleton columns={columns} />}

      {isError && (
        <Alert variant="destructive">
          <AlertDescription className="flex flex-wrap items-center gap-3">
            Não foi possível carregar as concessionárias.
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Tentar de novo
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {dealers && dealers.length === 0 && (
        <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
          <p>Nenhuma concessionária cadastrada.</p>
          {admin && (
            <Button className="mt-3" render={<Link to="/dealers/new" />} nativeButton={false}>
              Cadastrar a primeira concessionária
            </Button>
          )}
        </div>
      )}

      {dealers && dealers.length > 0 && (
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
              {dealers.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{d.name}</TableCell>
                  <TableCell>{maskCnpj(d.cnpj)}</TableCell>
                  <TableCell>
                    {d.address.city}/{d.address.stateName}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        render={<Link to={`/dealers/${d.id}`} />}
                        nativeButton={false}
                      >
                        Detalhes
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        render={<Link to={`/dealers/${d.id}/vehicles`} />}
                        nativeButton={false}
                      >
                        Ver veículos ({d.cars.length})
                      </Button>
                      {admin && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            render={<Link to={`/dealers/${d.id}/edit`} />}
                            nativeButton={false}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setToDelete({ id: d.id, name: d.name })}
                          >
                            Excluir
                          </Button>
                        </>
                      )}
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
        title="Excluir concessionária"
        description={`Deseja excluir a concessionária ${toDelete?.name ?? ''}? Os veículos dela também serão excluídos. Esta ação não pode ser desfeita.`}
        pending={remove.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
