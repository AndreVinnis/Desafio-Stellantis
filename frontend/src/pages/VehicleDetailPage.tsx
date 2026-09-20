import { Navigate, useParams } from 'react-router'

// Não há tela de detalhe de veículo: a edição cobre todos os campos.
export default function VehicleDetailPage() {
  const { id } = useParams()
  return <Navigate to={`/vehicles/${id}/edit`} replace />
}
