'use client'
// src/components/layout/AppShell.tsx
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import {
  Network,
  FileSearch,
  Inbox,
  LayoutDashboard,
  Megaphone,
  Users,
  Mic,
  Mail,
  GraduationCap,
  BookOpen,
  Settings,
  Heart,
  Crown,
  Share2,
  LogOut,
} from 'lucide-react'
import { useState } from 'react'

const NAV_TABS = [
  { key: 'sequences', label: 'Sequences', icon: Network, href: '/sequences' },
  { key: 'leads', label: 'Find leads', icon: FileSearch, href: '/leads' },
  { key: 'inbox', label: 'Unified Inbox', icon: Inbox, href: '/inbox' },
]

const SIDEBAR_ICONS = [
  { icon: LayoutDashboard, key: 'dashboard', title: 'Dashboard' },
  { icon: Megaphone, key: 'campaigns', title: 'Campaigns' },
  { icon: Users, key: 'contacts', title: 'Contacts' },
  { icon: Mic, key: 'voice', title: 'Voice' },
  { icon: Mail, key: 'email', title: 'Email' },
  { icon: GraduationCap, key: 'training', title: 'Training' },
  { icon: BookOpen, key: 'playbooks', title: 'Playbooks' },
]

interface AppShellProps {
  children: React.ReactNode
  activeTab: string
}

export default function AppShell({ children, activeTab }: AppShellProps) {
  const { data: session } = useSession()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const initials =
    session?.user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'YD'

  return (
    <div className="app-shell">
      <div className="app-card">
        {/* ── Top navigation ── */}
        <nav className="top-nav relative">
          <div className="flex items-center gap-1">
            {NAV_TABS.map((tab) => (
              <Link
                key={tab.key}
                href={tab.href}
                className={`nav-tab ${activeTab === tab.key ? 'active' : ''}`}
              >
                <tab.icon size={15} />
                {tab.label}
              </Link>
            ))}
          </div>

          {/* Right side controls */}
          <div className="absolute right-5 flex items-center gap-3">
            <button className="btn-primary py-2 px-4 text-sm">
              <Share2 size={13} /> Share
            </button>
            <div className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
              <Crown size={13} className="text-amber-500" />
              <span className="text-xs font-semibold text-amber-700">
                Days of free trial: 14
              </span>
            </div>
            {/* User avatar + dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:bg-brand-600 transition-colors"
              >
                {initials}
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-10 bg-white border border-border rounded-xl shadow-modal w-48 py-2 z-50">
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <p className="text-sm font-medium text-ink truncate">
                      {session?.user?.name}
                    </p>
                    <p className="text-xs text-ink-tertiary truncate">
                      {session?.user?.email}
                    </p>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-secondary hover:bg-surface-secondary hover:text-ink transition-colors"
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="sidebar">
            {/* Logo */}
            <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center mb-6 flex-shrink-0">
              <Heart size={15} className="text-white fill-white" />
            </div>

            {SIDEBAR_ICONS.map(({ icon: Icon, key, title }) => (
              <div
                key={key}
                title={title}
                className={`sidebar-icon ${activeTab === key ? 'active' : ''}`}
              >
                <Icon size={18} />
              </div>
            ))}

            <div className="mt-auto">
              <div className="sidebar-icon" title="Settings">
                <Settings size={18} />
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 overflow-hidden flex flex-col">{children}</div>
        </div>
      </div>
    </div>
  )
}
