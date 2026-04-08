'use client'
// src/app/leads/page.tsx
import { useState, useEffect } from 'react'
import AppShell from '@/components/layout/AppShell'
import ContactsTable from '@/components/leads/ContactsTable'
import EnrichmentPanel from '@/components/leads/EnrichmentPanel'
import ImportModal from '@/components/leads/ImportModal'
import AddContactModal from '@/components/leads/AddContactModal'
import { Upload, Search, UserPlus, Filter } from 'lucide-react'

export default function LeadsPage() {
  const [contacts, setContacts] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [showAddContact, setShowAddContact] = useState(false)
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    fetch('/api/contacts')
      .then((r) => r.json())
      .then((data) => {
        setContacts(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = contacts.filter((c) => {
    const matchSearch = `${c.firstName} ${c.lastName} ${c.company} ${c.position}`
      .toLowerCase()
      .includes(search.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const STATUS_OPTIONS = ['ALL', 'NEW', 'CONTACTED', 'REPLIED', 'INTERESTED', 'CONVERTED']

  return (
    <AppShell activeTab="leads">
      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-border flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.history.back()}
                className="text-ink-tertiary hover:text-ink transition-colors text-sm"
              >
                ←
              </button>
              <h1 className="font-semibold text-ink">Contacts</h1>
              <span className="text-xs bg-surface-secondary border border-border rounded-full px-2 py-0.5 text-ink-secondary">
                {contacts.length}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {/* Status filter */}
              <div className="flex items-center gap-1 bg-surface-secondary border border-border rounded-xl p-1">
                {STATUS_OPTIONS.slice(0, 4).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                      statusFilter === s
                        ? 'bg-white text-ink shadow-card'
                        : 'text-ink-secondary hover:text-ink'
                    }`}
                  >
                    {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
              {/* Search */}
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search contacts..."
                  className="pl-8 pr-4 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 w-52 transition-all"
                />
              </div>
              <button
                onClick={() => setShowAddContact(true)}
                className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-surface-secondary transition-colors text-ink"
              >
                <UserPlus size={14} /> Add
              </button>
              <button onClick={() => setShowImport(true)} className="btn-primary">
                <Upload size={14} /> Import CSV
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto p-5">
            <ContactsTable
              contacts={filtered}
              selected={selected}
              onSelect={setSelected}
              loading={loading}
              onUpdated={(updated: any) =>
                setContacts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
              }
            />
          </div>
        </div>

        {/* Enrichment panel */}
        {selected && (
          <div className="w-80 border-l border-border flex-shrink-0 overflow-y-auto">
            <EnrichmentPanel
              contact={selected}
              onClose={() => setSelected(null)}
              onEnriched={(updated: any) => {
                setContacts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
                setSelected(updated)
              }}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onImported={(newContacts: any[]) => {
            setContacts((prev) => [...newContacts, ...prev])
            setShowImport(false)
          }}
        />
      )}
      {showAddContact && (
        <AddContactModal
          onClose={() => setShowAddContact(false)}
          onAdded={(contact: any) => {
            setContacts((prev) => [contact, ...prev])
            setSelected(contact)
            setShowAddContact(false)
          }}
        />
      )}
    </AppShell>
  )
}
