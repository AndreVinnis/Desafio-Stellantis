import { Link, useParams } from 'react-router'
import { useDealer } from '../hooks/useDealers'
import { isAdmin } from '../utils/jwt'
import { getErrorMessage, getErrorStatus } from '../api/errors'
import { maskCep, maskCnpj } from '../utils/masks'
import { fuelLabels } from '../types/vehicle'

export default function DealerDetailPage() {
  const { id } = useParams()
  const numericId = Number(id)
  const validId = Number.isInteger(numericId)
  const { data: dealer, isLoading, error } = useDealer(numericId)
  const admin = isAdmin()

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

  const { address } = dealer
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <h1>{dealer.name}</h1>
        {admin && (
          <Link to={`/dealers/${dealer.id}/edit`} style={{ marginLeft: 'auto' }}>
            <button>Editar</button>
          </Link>
        )}
      </div>
      <p>CNPJ: {maskCnpj(dealer.cnpj)}</p>
      <p>
        Endereço: {address.street}
        {address.complement ? `, ${address.complement}` : ''} – {address.neighborhood},{' '}
        {address.city}/{address.stateName} – CEP {maskCep(address.cep)}
      </p>

      <h2>Veículos</h2>
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
