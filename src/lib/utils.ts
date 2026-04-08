// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const d = new Date(date)
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function getAvatarUrl(name: string, seed?: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed || name}&backgroundColor=b6e3f4,c0aede,d1d4f9`
}

export function replaceTemplateVars(
  template: string,
  contact: { firstName?: string; lastName?: string; company?: string; position?: string }
): string {
  return template
    .replace(/\{\{firstName\}\}/g, contact.firstName || '')
    .replace(/\{\{lastName\}\}/g, contact.lastName || '')
    .replace(/\{\{company\}\}/g, contact.company || '')
    .replace(/\{\{position\}\}/g, contact.position || '')
    .replace(/\{\{fullName\}\}/g, `${contact.firstName || ''} ${contact.lastName || ''}`.trim())
}
