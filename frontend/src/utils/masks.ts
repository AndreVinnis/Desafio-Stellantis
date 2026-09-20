export const onlyDigits = (value: string) => value.replace(/\D/g, '')

export const maskCnpj = (value: string) => {
  const d = onlyDigits(value).slice(0, 14)
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

export const maskCep = (value: string) => {
  const d = onlyDigits(value).slice(0, 8)
  return d.replace(/^(\d{5})(\d)/, '$1-$2')
}
