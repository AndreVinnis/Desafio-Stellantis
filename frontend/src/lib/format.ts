const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export const formatPrice = (value: number | null) => (value == null ? '-' : currency.format(value))
