import { useQuery } from '@tanstack/react-query'
import { vehiclesApi } from '../api/vehicles'

export const useVehicles = () =>
  useQuery({ queryKey: ['vehicles'], queryFn: vehiclesApi.list })
