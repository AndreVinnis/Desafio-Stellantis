import { useQuery } from '@tanstack/react-query'
import { dealersApi } from '../api/dealers'

export const useDealers = () =>
  useQuery({ queryKey: ['dealers'], queryFn: dealersApi.list })
