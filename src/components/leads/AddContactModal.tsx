'use client'
// src/components/leads/AddContactModal.tsx
import { useState } from 'react'
import { X, UserPlus, Loader2 } from 'lucide-react'

interface Props {
  onClose: () => void
  onAdded: (contact: any) => void
}

export default function AddContactModal({ onClose, onAdded }: Props) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    linkedInUrl: '',
    location: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.firstName.trim()) e.firstName = 'Required'
    if (!form.lastName.trim()) e.lastName = 'Required'
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    return e
  }

  const submit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true)
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const contact = await res.json()
      onAdded(contact)
    } finally {
      setLoading(false)
    }
  }

  const Field = ({
    label,
    field,
    placeholder,
    required,
    half,
  }: {
    label: string
    field: keyof typeof form
    placeholder: string
    required?: boolean
    half?: boolean
  }) => (
    <div className={half ? 'flex-1' : 'w-full'}>
      <label className="block text-sm font-medium text-ink mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        value={form[field]}
        onChange={(e) => set(field, e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 transition-all ${
          errors[field] ? 'border-red-400' : 'border-border focus:border-brand-400'
        }`}
      />
      {errors[field] && (
        <p className="text-xs text-red-500 mt-1">{errors[field]}</p>
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-modal animate-fade-in-up">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-brand-500" />
            <h2 className="font-bold text-ink">Add Contact</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-tertiary hover:text-ink hover:bg-surface-secondary transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex gap-3">
            <Field label="First name" field="firstName" placeholder="John" required half />
            <Field label="Last name" field="lastName" placeholder="Smith" required half />
          </div>
          <Field label="Email" field="email" placeholder="john@company.com" />
          <Field label="Phone" field="phone" placeholder="+91 98765 43210" />
          <Field label="Company" field="company" placeholder="Acme Corp" />
          <Field label="Position" field="position" placeholder="VP of Sales" />
          <Field label="LinkedIn URL" field="linkedInUrl" placeholder="https://linkedin.com/in/..." />
          <Field label="Location" field="location" placeholder="Bangalore, India" />
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-surface-secondary transition-colors"
          >
            Cancel
          </button>
          <button onClick={submit} disabled={loading} className="btn-primary flex-1 justify-center">
            {loading ? (
              <><Loader2 size={14} className="animate-spin" /> Adding...</>
            ) : (
              <><UserPlus size={14} /> Add Contact</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
