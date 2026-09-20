import { Link, useParams } from 'react-router'
import { useDealer } from '../hooks/useDealers'
import { getErrorMessage, getErrorStatus } from '../api/errors'
import { fuelLabels } from '../types/vehicle'

export default function DealerVehiclesPage() {
  const { id } = useParams()
  const numericId = Number(id)
  const validId = Number.isInteger(numericId)
  const { data: dealer, isLoading, error } = useDealer(numericId)

  if (!validId || getErrorStatus(error) === 404) {
    return (
      <div role="alert">
        <p>Concessionária não encontrada.</p>
        <Link to="/dealers">Voltar para a lista</Link>
      </div>
    )
  }
  if (isLoading) return <p>Carregando…</p>
  if (error || !dealer) {
    return (
      <div role="alert">
        <p>{getErrorMessage(error)}</p>
        <Link to="/dealers">Voltar para a lista</Link>
      </div>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <h1>Veículos de {dealer.name}</h1>
        <Link to="/vehicles/new" style={{ marginLeft: 'auto' }}>
          <button>Novo veículo</button>
        </Link>
      </div>

      {dealer.cars.length === 0 ? (
        <p>Nenhum veículo cadastrado nesta concessionária</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Ano</th>
              <th>Cor</th>
              <th>Combustível</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {dealer.cars.map((c) => (
              <tr key={c.id}>
                <td>{c.mark}</td>
                <td>{c.model}</td>
                <td>{c.year ?? '-'}</td>
                <td>{c.externalColor}</td>
                <td>{c.fuelsTypes.map((f) => fuelLabels[f]).join(', ')}</td>
                <td>
                  <Link to={`/vehicles/${c.id}/edit`}>
                    <button>Editar</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p>
        <Link to="/dealers">Voltar para a lista</Link>
      </p>
    </>
  )
}
