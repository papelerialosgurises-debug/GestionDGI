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

const safeDate = (date: string) => {
  const parsed = new Date(`${date}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export const getMonth = (date: string) => {
  const parsed = safeDate(date)
  return parsed ? parsed.getMonth() + 1 : 0
}

export const getYear = (date: string) => safeDate(date)?.getFullYear() ?? 0

export const formatDate = (date: string) => {
  const parsed = safeDate(date)
  return parsed ? new Intl.DateTimeFormat('es-UY', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(parsed) : ''
}

export const isInMonth = (date: string, month: number, year: number) => getMonth(date) === month && getYear(date) === year

export const isInDateRange = (date: string, from?: string, to?: string) => {
  const parsed = safeDate(date)
  if (!parsed) return false
  const fromDate = from ? safeDate(from) : null
  const toDate = to ? safeDate(to) : null
  const value = parsed.getTime()
  const fromValue = fromDate ? fromDate.getTime() : Number.NEGATIVE_INFINITY
  const toValue = toDate ? toDate.getTime() : Number.POSITIVE_INFINITY
  return value >= fromValue && value <= toValue
}
