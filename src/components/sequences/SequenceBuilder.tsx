'use client'
// src/components/sequences/SequenceBuilder.tsx
import { useState, useRef } from 'react'
import {
  Plus,
  Play,
  Pause,
  Trash2,
  Sparkles,
  Clock,
  Users,
  ChevronDown,
  Loader2,
  Pencil,
  Check,
  Wand2,
} from 'lucide-react'

const STEP_TYPES = [
  { type: 'CONNECTION_REQUEST', label: 'Connection Request', emoji: '🤝', color: '#6B5CE7', bg: '#f0f0ff' },
  { type: 'MESSAGE', label: 'LinkedIn Message', emoji: '💬', color: '#3b82f6', bg: '#eff6ff' },
  { type: 'EMAIL', label: 'Email', emoji: '📧', color: '#10b981', bg: '#ecfdf5' },
  { type: 'VOICE_NOTE', label: 'Voice Note', emoji: '🎙️', color: '#f97316', bg: '#fff7ed' },
  { type: 'FOLLOW_UP', label: 'Follow Up', emoji: '🔄', color: '#8b5cf6', bg: '#f5f3ff' },
  { type: 'WAIT', label: 'Wait Period', emoji: '⏳', color: '#6b7280', bg: '#f9fafb' },
]

const DELAY_OPTIONS = [
  { value: 0, label: 'Immediately' },
  { value: 24, label: '1 day' },
  { value: 48, label: '2 days' },
  { value: 72, label: '3 days' },
  { value: 120, label: '5 days' },
  { value: 168, label: '1 week' },
]

interface Props {
  campaign: any
  onUpdate: (updated: any) => void
}

export default function SequenceBuilder({ campaign, onUpdate }: Props) {
  const [steps, setSteps] = useState<any[]>(campaign.steps || [])
  const [editingStep, setEditingStep] = useState<string | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState<string | null>(null)
  const [editingName, setEditingName] = useState(false)
  const [name, setName] = useState(campaign.name)
  const [showAIGenModal, setShowAIGenModal] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  // ── Helpers ──────────────────────────────────────────────────────────

  const addStep = async (type: string) => {
    setShowPicker(false)
    const res = await fetch(`/api/campaigns/${campaign.id}/steps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, delay: 48, content: '' }),
    })
    const step = await res.json()
    const newSteps = [...steps, step]
    setSteps(newSteps)
    onUpdate({ ...campaign, steps: newSteps })
    setEditingStep(step.id)
  }

  const updateStep = (id: string, updates: Partial<any>) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  const removeStep = async (id: string) => {
    const res = await fetch(`/api/campaigns/${campaign.id}/steps`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stepId: id }),
    })
    const newSteps = steps.filter((s) => s.id !== id)
    setSteps(newSteps)
    if (editingStep === id) setEditingStep(null)
    onUpdate({ ...campaign, steps: newSteps })
  }

  const saveSteps = async () => {
    setSaving(true)
    await fetch(`/api/campaigns/${campaign.id}/steps`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(steps),
    })
    onUpdate({ ...campaign, steps, name })
    setSaving(false)
  }

  const saveName = async () => {
    setEditingName(false)
    await fetch(`/api/campaigns/${campaign.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    onUpdate({ ...campaign, name })
  }

  const toggleStatus = async () => {
    const next = campaign.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
    const res = await fetch(`/api/campaigns/${campaign.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    const updated = await res.json()
    onUpdate(updated)
  }

  const aiPersonalize = async (stepId: string, step: any) => {
    setAiLoading(stepId)
    const res = await fetch('/api/ai/personalize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contactFirstName: '{{firstName}}',
        contactLastName: '{{lastName}}',
        contactCompany: '{{company}}',
        contactPosition: '{{position}}',
        channel: step.type === 'EMAIL' ? 'email' : 'linkedin',
        template: step.content || undefined,
        purpose: 'schedule a meeting and discuss how we can help',
      }),
    })
    const data = await res.json()
    updateStep(stepId, { content: data.message || step.content, aiEnhanced: true })
    setAiLoading(null)
  }

  const aiGenerateSequence = async (industry: string, goal: string) => {
    setShowAIGenModal(false)
    const res = await fetch('/api/ai/sequence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ industry, goal }),
    })
    const data = await res.json()
    // Clear existing steps and add AI-generated ones
    if (data.steps) {
      for (const s of data.steps) {
        await fetch(`/api/campaigns/${campaign.id}/steps`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(s),
        })
      }
      // Refresh
      const refreshed = await fetch(`/api/campaigns/${campaign.id}`).then((r) => r.json())
      setSteps(refreshed.steps || [])
      onUpdate(refreshed)
    }
  }

  // ── Status badge ─────────────────────────────────────────────────────
  const statusBadge: Record<string, { label: string; class: string }> = {
    DRAFT: { label: 'waiting for publishment', class: 'bg-gray-100 text-gray-600' },
    PENDING: { label: 'pending', class: 'bg-amber-100 text-amber-700' },
    ACTIVE: { label: 'active', class: 'bg-green-100 text-green-700' },
    PAUSED: { label: 'paused', class: 'bg-orange-100 text-orange-700' },
    COMPLETED: { label: 'completed', class: 'bg-blue-100 text-blue-700' },
  }
  const badge = statusBadge[campaign.status] || statusBadge.DRAFT

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={saveName}
                onKeyDown={(e) => e.key === 'Enter' && saveName()}
                className="font-semibold text-ink border-b-2 border-brand-500 outline-none bg-transparent text-base"
              />
              <button onClick={saveName} className="text-brand-500">
                <Check size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-ink text-base">{name}</h2>
              <button
                onClick={() => setEditingName(true)}
                className="text-ink-tertiary hover:text-ink transition-colors"
              >
                <Pencil size={13} />
              </button>
            </div>
          )}
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badge.class}`}>
            {badge.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAIGenModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-brand-200 rounded-xl text-brand-600 hover:bg-brand-50 transition-colors font-medium"
          >
            <Wand2 size={13} /> AI Generate
          </button>
          {steps.length > 0 && (
            <button
              onClick={saveSteps}
              disabled={saving}
              className="px-4 py-2 text-sm border border-border rounded-xl hover:bg-surface-secondary transition-colors font-medium flex items-center gap-1.5"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              Save
            </button>
          )}
          <button
            onClick={toggleStatus}
            className={`btn-primary ${
              campaign.status === 'ACTIVE' ? 'bg-amber-500 hover:bg-amber-600' : ''
            }`}
          >
            {campaign.status === 'ACTIVE' ? (
              <><Pause size={13} /> Pause</>
            ) : (
              <><Play size={13} /> Launch</>
            )}
          </button>
        </div>
      </div>

      {/* ── Canvas ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto bg-surface-secondary px-8 py-8">
        <div className="max-w-md mx-auto">
          {/* Entry node */}
          <div className="sequence-node">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-ink text-sm">
                  Run {campaign.dailyLimit} times per day
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex -space-x-1.5">
                    {['#6B5CE7', '#f97316', '#22c55e'].map((bg, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-full border-2 border-white"
                        style={{ background: bg }}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-ink-secondary">
                    {campaign._count?.contacts ?? campaign.totalContacts ?? 0} contacts
                  </span>
                </div>
              </div>
              <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center">
                <Users size={16} className="text-brand-500" />
              </div>
            </div>
          </div>

          {/* Steps */}
          {steps.map((step, idx) => {
            const typeInfo = STEP_TYPES.find((t) => t.type === step.type) || STEP_TYPES[1]
            const isEditing = editingStep === step.id
            const isLoadingAI = aiLoading === step.id

            return (
              <div key={step.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 40}ms` }}>
                {/* Connector line */}
                <div className="flex flex-col items-center py-1">
                  <div className="w-px h-5 bg-border" />
                  {step.delay > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-ink-tertiary bg-white border border-border rounded-full px-3 py-1 my-1 shadow-sm">
                      <Clock size={11} />
                      Wait{' '}
                      {DELAY_OPTIONS.find((d) => d.value === step.delay)?.label ||
                        `${step.delay}h`}
                    </div>
                  )}
                  <div className="w-px h-5 bg-border" />
                </div>

                {/* Step card */}
                <div
                  className={`sequence-node cursor-pointer select-none ${
                    isEditing
                      ? 'border-brand-300 ring-2 ring-brand-100'
                      : ''
                  }`}
                  onClick={() => setEditingStep(isEditing ? null : step.id)}
                >
                  {/* Step header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                        style={{ background: typeInfo.bg }}
                      >
                        {typeInfo.emoji}
                      </div>
                      <span className="font-semibold text-sm text-ink">
                        {typeInfo.label}
                      </span>
                      {step.aiEnhanced && (
                        <span
                          className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: '#f0f0ff', color: '#6B5CE7' }}
                        >
                          <Sparkles size={9} /> AI
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeStep(step.id)
                      }}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-ink-tertiary hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Content preview or editor */}
                  {isEditing ? (
                    <div onClick={(e) => e.stopPropagation()} className="space-y-3">
                      {step.type === 'EMAIL' && (
                        <input
                          value={step.subject || ''}
                          onChange={(e) => updateStep(step.id, { subject: e.target.value })}
                          placeholder="Email subject line..."
                          className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
                        />
                      )}
                      <textarea
                        value={step.content}
                        onChange={(e) => updateStep(step.id, { content: e.target.value })}
                        placeholder="Write your message... Use {{firstName}}, {{lastName}}, {{company}}, {{position}}"
                        rows={5}
                        className="w-full text-sm border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 resize-none"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-ink-secondary font-medium">
                            Delay:
                          </label>
                          <select
                            value={step.delay}
                            onChange={(e) =>
                              updateStep(step.id, { delay: parseInt(e.target.value) })
                            }
                            className="text-xs border border-border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-300 bg-white"
                          >
                            {DELAY_OPTIONS.map((d) => (
                              <option key={d.value} value={d.value}>
                                {d.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={() => aiPersonalize(step.id, step)}
                          disabled={isLoadingAI}
                          className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors font-semibold"
                        >
                          {isLoadingAI ? (
                            <Loader2 size={11} className="animate-spin" />
                          ) : (
                            <Sparkles size={11} />
                          )}
                          {isLoadingAI ? 'Generating...' : 'AI Personalize'}
                        </button>
                      </div>
                      <div className="text-xs text-ink-tertiary bg-surface-secondary rounded-lg px-3 py-2">
                        💡 Variables: <code>{'{{firstName}}'}</code>{' '}
                        <code>{'{{company}}'}</code> <code>{'{{position}}'}</code>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-ink-secondary line-clamp-3">
                      {step.content ? (
                        step.content
                      ) : (
                        <span className="italic text-ink-tertiary">
                          Click to write message...
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            )
          })}

          {/* Add step */}
          <div className="flex flex-col items-center mt-4">
            {steps.length > 0 && <div className="w-px h-5 bg-border" />}
            <div className="relative" ref={pickerRef}>
              <button
                onClick={() => setShowPicker(!showPicker)}
                className="w-10 h-10 rounded-full border-2 border-dashed border-brand-300 text-brand-500 hover:bg-brand-50 hover:border-solid flex items-center justify-center transition-all hover:scale-110"
              >
                <Plus size={20} />
              </button>
              {showPicker && (
                <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-white border border-border rounded-2xl shadow-modal p-3 z-50 w-60">
                  <p className="text-xs font-bold text-ink-secondary uppercase tracking-wider mb-2 px-1">
                    Add Step
                  </p>
                  {STEP_TYPES.map((st) => (
                    <button
                      key={st.type}
                      onClick={() => addStep(st.type)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-secondary transition-colors text-left"
                    >
                      <span className="text-base">{st.emoji}</span>
                      <span className="text-sm font-medium text-ink">{st.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── AI Generate Modal ─────────────────────────────────────────── */}
      {showAIGenModal && (
        <AIGenerateModal
          onClose={() => setShowAIGenModal(false)}
          onGenerate={aiGenerateSequence}
        />
      )}
    </div>
  )
}

// ── AI Generate Modal ─────────────────────────────────────────────────────
function AIGenerateModal({
  onClose,
  onGenerate,
}: {
  onClose: () => void
  onGenerate: (industry: string, goal: string) => void
}) {
  const [industry, setIndustry] = useState('SaaS')
  const [goal, setGoal] = useState('book a discovery call')
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    setLoading(true)
    await onGenerate(industry, goal)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-modal animate-fade-in-up p-6">
        <div className="flex items-center gap-2 mb-5">
          <Wand2 size={18} className="text-brand-500" />
          <h3 className="font-semibold text-ink">AI Generate Sequence</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Target Industry
            </label>
            <input
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. SaaS, Fintech, E-commerce"
              className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Campaign Goal
            </label>
            <input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. book a demo, discuss partnership"
              className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-surface-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handle}
            disabled={loading}
            className="btn-primary flex-1 justify-center"
          >
            {loading ? (
              <><Loader2 size={14} className="animate-spin" /> Generating...</>
            ) : (
              <><Wand2 size={14} /> Generate</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
