import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { vehiclesApi } from '../api/vehicles'
import type { VehicleInput } from '../types/vehicle'

export const useVehicles = () =>
  useQuery({ queryKey: ['vehicles'], queryFn: vehiclesApi.list })

export const useVehicle = (id: number) =>
  useQuery({
    queryKey: ['vehicles', id],
    queryFn: () => vehiclesApi.get(id),
    retry: false,
  })

export const useCreateVehicle = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: (input: VehicleInput) => vehiclesApi.create(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      navigate('/vehicles')
    },
  })
}

export const useUpdateVehicle = (id: number) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: (input: VehicleInput) => vehiclesApi.update(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      navigate('/vehicles')
    },
  })
}

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => vehiclesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  })
}
