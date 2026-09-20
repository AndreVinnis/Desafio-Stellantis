import { onlyDigits } from './masks'

const checkDigit = (base: number[]) => {
  let peso = base.length - 7
  let soma = 0
  for (const d of base) {
    soma += d * peso
    peso = peso === 2 ? 9 : peso - 1
  }
  const resto = soma % 11
  return resto < 2 ? 0 : 11 - resto
}

export function isValidCnpj(value: string) {
  const digits = onlyDigits(value)
  if (digits.length !== 14) return false
  if (/^(\d)\1{13}$/.test(digits)) return false

  const nums = digits.split('').map(Number)
  const dv1 = checkDigit(nums.slice(0, 12))
  const dv2 = checkDigit([...nums.slice(0, 12), dv1])
  return nums[12] === dv1 && nums[13] === dv2
}
