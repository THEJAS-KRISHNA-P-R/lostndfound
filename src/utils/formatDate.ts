import { formatDistanceToNow, format, parseISO } from 'date-fns'

export function formatRelative(dateStr: string): string {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true })
  } catch {
    return dateStr
  }
}

export function formatFull(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMMM d, yyyy')
  } catch {
    return dateStr
  }
}

export function formatDateTime(dateStr: string, timeStr?: string): string {
  try {
    const date = format(parseISO(dateStr), 'MMM d, yyyy')
    if (!timeStr) return date
    return `${date} at ${timeStr.slice(0, 5)}`
  } catch {
    return dateStr
  }
}
