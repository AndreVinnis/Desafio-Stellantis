import { Link } from 'react-router'
import { useDealers, useDeleteDealer } from '../hooks/useDealers'
import { isAdmin } from '../utils/jwt'
import { getErrorMessage } from '../api/errors'
import { maskCnpj } from '../utils/masks'

export default function DealersListPage() {
  const { data: dealers, isLoading, isError, refetch } = useDealers()
  const remove = useDeleteDealer()
  const admin = isAdmin()

  const handleDelete = (id: number, name: string) => {
    if (
      window.confirm(
        `Excluir a concessionária ${name}? Os veículos dela também serão excluídos.`,
      )
    ) {
      remove.mutate(id)
    }
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <h1>Concessionárias</h1>
        {admin && (
          <Link to="/dealers/new" style={{ marginLeft: 'auto' }}>
            <button>Nova concessionária</button>
          </Link>
        )}
      </div>

      {remove.isError && (
        <p role="alert" style={{ color: 'crimson' }}>
          {getErrorMessage(remove.error)}
        </p>
      )}

      {isLoading && <p>Carregando…</p>}

      {isError && (
        <div role="alert">
          <p>Não foi possível carregar as concessionárias.</p>
          <button onClick={() => refetch()}>Tentar de novo</button>
        </div>
      )}

      {dealers && dealers.length === 0 && <p>Nenhuma concessionária cadastrada</p>}

      {dealers && dealers.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>CNPJ</th>
              <th>Cidade/UF</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {dealers.map((d) => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td>{maskCnpj(d.cnpj)}</td>
                <td>
                  {d.address.city}/{d.address.stateName}
                </td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <Link to={`/dealers/${d.id}`}>
                    <button>Detalhes</button>
                  </Link>
                  <Link to={`/dealers/${d.id}/vehicles`}>
                    <button>Ver veículos ({d.cars.length})</button>
                  </Link>
                  {admin && (
                    <>
                      <Link to={`/dealers/${d.id}/edit`}>
                        <button>Editar</button>
                      </Link>
                      <button
                        onClick={() => handleDelete(d.id, d.name)}
                        disabled={remove.isPending}
                      >
                        Excluir
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
