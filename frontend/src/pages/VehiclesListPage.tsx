import { Link } from 'react-router'
import { useVehicles } from '../hooks/useVehicles'
import type { FuelType } from '../types/vehicle'

const fuelLabels: Record<FuelType, string> = {
  GASOLINE: 'Gasolina',
  ETHANOL: 'Etanol',
  DIESEL: 'Diesel',
  FLEX: 'Flex',
  ELECTRICITY: 'Elétrico',
  HYBRID: 'Híbrido',
}

export default function VehiclesListPage() {
  const { data: vehicles, isLoading, isError, refetch } = useVehicles()

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <h1>Veículos</h1>
        <Link to="/vehicles/new" style={{ marginLeft: 'auto' }}>
          <button>Novo veículo</button>
        </Link>
      </div>

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
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
