'use client'
// src/app/login/page.tsx
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Heart, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('demo@prosp.ai')
  const [password, setPassword] = useState('demo123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid credentials. Use demo@prosp.ai')
      setLoading(false)
    } else {
      router.push('/sequences')
    }
  }

  return (
    <div className="app-shell">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
              <Heart size={20} className="text-white fill-white" />
            </div>
            <span className="text-2xl font-bold text-white">Prosp</span>
          </div>
          <p className="text-white/60 text-sm">AI-Powered LinkedIn Outreach</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-modal">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles size={18} className="text-brand-500" />
            <h1 className="text-xl font-bold text-ink">Welcome back</h1>
          </div>

          {/* Demo notice */}
          <div className="bg-brand-50 border border-brand-200 rounded-xl p-3 mb-6 text-sm text-brand-700">
            <strong>Demo Mode:</strong> Email pre-filled. Just click Sign In.
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-secondary mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-secondary mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
