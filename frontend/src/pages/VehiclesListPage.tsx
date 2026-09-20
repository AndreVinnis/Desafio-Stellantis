import { Link } from 'react-router'
import { useDeleteVehicle, useVehicles } from '../hooks/useVehicles'
import { getErrorMessage } from '../api/errors'
import { fuelLabels } from '../types/vehicle'

export default function VehiclesListPage() {
  const { data: vehicles, isLoading, isError, refetch } = useVehicles()
  const remove = useDeleteVehicle()

  const handleDelete = (id: number, label: string) => {
    if (window.confirm(`Excluir o veículo ${label}?`)) remove.mutate(id)
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <h1>Veículos</h1>
        <Link to="/vehicles/new" style={{ marginLeft: 'auto' }}>
          <button>Novo veículo</button>
        </Link>
      </div>

      {remove.isError && (
        <p role="alert" style={{ color: 'crimson' }}>
          {getErrorMessage(remove.error)}
        </p>
      )}

      {isLoading && <p>Carregando…</p>}

      {isError && (
        <div role="alert">
          <p>Não foi possível carregar os veículos.</p>
          <button onClick={() => refetch()}>Tentar de novo</button>
        </div>
      )}

      {vehicles && vehicles.length === 0 && <p>Nenhum veículo cadastrado</p>}

      {vehicles && vehicles.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Ano</th>
              <th>Cor</th>
              <th>Combustível</th>
              <th>Concessionária</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id}>
                <td>{v.mark}</td>
                <td>{v.model}</td>
                <td>{v.year ?? '-'}</td>
                <td>{v.externalColor}</td>
                <td>{v.fuelsTypes.map((f) => fuelLabels[f]).join(', ')}</td>
                <td>{v.dealershipName}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <Link to={`/vehicles/${v.id}/edit`}>
                    <button>Editar</button>
                  </Link>
                  <button
                    onClick={() => handleDelete(v.id, `${v.mark} ${v.model}`)}
                    disabled={remove.isPending}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
