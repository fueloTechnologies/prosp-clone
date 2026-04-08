'use client'
// src/components/leads/ImportModal.tsx
import { useState, useRef, useCallback } from 'react'
import { X, Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

interface ParsedContact {
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  position: string
  linkedInUrl: string
}

interface Props {
  onClose: () => void
  onImported: (contacts: any[]) => void
}

// Try to map any CSV header to our schema
function mapRow(headers: string[], values: string[]): ParsedContact {
  const get = (...keys: string[]) => {
    for (const k of keys) {
      const idx = headers.findIndex((h) => h === k)
      if (idx !== -1) return values[idx]?.trim().replace(/"/g, '') || ''
    }
    return ''
  }

  const fullName = get('name', 'full_name', 'fullname')
  const parts = fullName.split(' ')

  return {
    firstName: get('first_name', 'firstname', 'first') || parts[0] || '',
    lastName: get('last_name', 'lastname', 'last') || parts.slice(1).join(' ') || '',
    email: get('email', 'email_address', 'work_email', 'personal_email'),
    phone: get('phone', 'phone_number', 'mobile', 'telephone'),
    company: get('company', 'organization', 'company_name', 'employer'),
    position: get('position', 'title', 'job_title', 'role', 'occupation'),
    linkedInUrl: get('linkedin', 'linkedin_url', 'linkedin_profile', 'profile_url'),
  }
}

function parseCSV(text: string): ParsedContact[] {
  const lines = text.split('\n').filter((l) => l.trim())
  if (lines.length < 2) return []

  const headers = lines[0]
    .split(',')
    .map((h) => h.trim().toLowerCase().replace(/\s+/g, '_').replace(/"/g, ''))

  return lines.slice(1).map((line) => {
    // Handle quoted values with commas
    const values: string[] = []
    let current = ''
    let inQuotes = false
    for (const char of line) {
      if (char === '"') inQuotes = !inQuotes
      else if (char === ',' && !inQuotes) { values.push(current); current = '' }
      else current += char
    }
    values.push(current)
    return mapRow(headers, values)
  }).filter((c) => c.firstName || c.email)
}

export default function ImportModal({ onClose, onImported }: Props) {
  const [dragging, setDragging] = useState(false)
  const [parsed, setParsed] = useState<ParsedContact[]>([])
  const [fileName, setFileName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a .csv file')
      return
    }
    setFileName(file.name)
    setError('')
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const contacts = parseCSV(text)
      if (contacts.length === 0) {
        setError('No valid contacts found. Check your CSV format.')
        return
      }
      setParsed(contacts)
    }
    reader.readAsText(file)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  const importAll = async () => {
    setUploading(true)
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      })
      const newContacts = await res.json()
      onImported(Array.isArray(newContacts) ? newContacts : [])
    } catch {
      setError('Import failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-modal animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Upload size={18} className="text-brand-500" />
            <h2 className="font-bold text-ink">Import Contacts</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-tertiary hover:text-ink hover:bg-surface-secondary transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-6">
          {parsed.length === 0 ? (
            <>
              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                  dragging
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-border hover:border-brand-400 hover:bg-surface-secondary'
                }`}
              >
                <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Upload size={22} className="text-brand-500" />
                </div>
                <p className="font-semibold text-ink mb-1">
                  {dragging ? 'Drop it!' : 'Drop your CSV here'}
                </p>
                <p className="text-sm text-ink-secondary mb-3">or click to browse files</p>
                <span className="text-xs text-ink-tertiary bg-surface-secondary px-3 py-1.5 rounded-full border border-border">
                  .csv files only
                </span>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </div>

              {/* CSV format hint */}
              <div className="mt-4 bg-surface-secondary border border-border rounded-xl p-4">
                <p className="text-xs font-bold text-ink-secondary mb-2">Expected CSV columns:</p>
                <p className="text-xs text-ink-tertiary font-mono">
                  first_name, last_name, email, phone, company, position, linkedin_url
                </p>
              </div>

              {error && (
                <div className="mt-3 flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                  <AlertCircle size={14} />
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Preview */}
              <div className="flex items-center gap-2 mb-4 text-green-700 bg-green-50 border border-green-200 rounded-xl p-3">
                <CheckCircle2 size={15} />
                <span className="text-sm font-semibold">
                  {parsed.length} contacts ready · {fileName}
                </span>
              </div>

              <div className="bg-surface-secondary rounded-xl overflow-hidden border border-border mb-5 max-h-56 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {['Name', 'Email', 'Company'].map((h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-2.5 text-xs font-bold text-ink-secondary uppercase tracking-wide"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.slice(0, 10).map((c, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="px-4 py-2.5 font-medium text-ink">
                          {c.firstName} {c.lastName}
                        </td>
                        <td className="px-4 py-2.5 text-ink-secondary">
                          {c.email || '—'}
                        </td>
                        <td className="px-4 py-2.5 text-ink-secondary">
                          {c.company || '—'}
                        </td>
                      </tr>
                    ))}
                    {parsed.length > 10 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-2.5 text-xs text-ink-tertiary text-center"
                        >
                          + {parsed.length - 10} more contacts
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setParsed([]); setFileName('') }}
                  className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-surface-secondary transition-colors"
                >
                  Change File
                </button>
                <button
                  onClick={importAll}
                  disabled={uploading}
                  className="btn-primary flex-1 justify-center"
                >
                  {uploading ? (
                    <><Loader2 size={14} className="animate-spin" /> Importing...</>
                  ) : (
                    <><Upload size={14} /> Import {parsed.length} Contacts</>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
