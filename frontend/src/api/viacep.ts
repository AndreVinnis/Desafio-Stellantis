import { onlyDigits } from '../utils/masks'

export type ViaCepAddress = {
  logradouro: string
  bairro: string
  localidade: string
  uf: string
}

const TIMEOUT_MS = 8000

export async function fetchCep(
  cep: string,
  signal?: AbortSignal,
): Promise<ViaCepAddress | null> {
  const timeout = AbortSignal.timeout(TIMEOUT_MS)
  const res = await fetch(`https://viacep.com.br/ws/${onlyDigits(cep)}/json/`, {
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  })
  if (!res.ok) throw new Error('Falha ao consultar o CEP')
  const data = await res.json()
  return data.erro ? null : data
}
