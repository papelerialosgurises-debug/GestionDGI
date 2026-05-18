export const monthNames = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'setiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

export const currentMonth = () => new Date().getMonth() + 1

export const currentYear = () => new Date().getFullYear()

export const getMonth = (date: string) => new Date(`${date}T00:00:00`).getMonth() + 1

export const getYear = (date: string) => new Date(`${date}T00:00:00`).getFullYear()

export const formatDate = (date: string) =>
  new Intl.DateTimeFormat('es-UY', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(`${date}T00:00:00`),
  )

export const isInMonth = (date: string, month: number, year: number) => getMonth(date) === month && getYear(date) === year

export const isInDateRange = (date: string, from?: string, to?: string) => {
  const value = new Date(`${date}T00:00:00`).getTime()
  const fromValue = from ? new Date(`${from}T00:00:00`).getTime() : Number.NEGATIVE_INFINITY
  const toValue = to ? new Date(`${to}T00:00:00`).getTime() : Number.POSITIVE_INFINITY
  return value >= fromValue && value <= toValue
}
