import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { getErrorMessage } from '../api/errors'
import { dealersApi } from '../api/dealers'
import type { DealerInput } from '../types/dealer'

export const useDealers = () =>
  useQuery({ queryKey: ['dealers'], queryFn: dealersApi.list })

export const useDealer = (id: number) =>
  useQuery({
    queryKey: ['dealers', id],
    queryFn: () => dealersApi.get(id),
    retry: false,
  })

export const useCreateDealer = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: (input: DealerInput) => dealersApi.create(input),
    onSuccess: async () => {
      toast.success('Concessionária cadastrada com sucesso')
      await queryClient.invalidateQueries({ queryKey: ['dealers'] })
      navigate('/dealers')
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

export const useUpdateDealer = (id: number) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: (input: DealerInput) => dealersApi.update(id, input),
    onSuccess: async () => {
      toast.success('Concessionária atualizada com sucesso')
      // o nome da concessionária aparece na lista de veículos
      await queryClient.invalidateQueries({ queryKey: ['dealers'] })
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      navigate('/dealers')
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

export const useDeleteDealer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => dealersApi.remove(id),
    // o backend apaga em cascata os veículos da concessionária
    onSuccess: async () => {
      toast.success('Concessionária excluída com sucesso')
      await queryClient.invalidateQueries({ queryKey: ['dealers'] })
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}
