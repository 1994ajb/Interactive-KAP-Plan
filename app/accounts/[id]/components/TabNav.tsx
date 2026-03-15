'use client'

import { TABS } from '@/lib/constants'

interface TabNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
  notifications?: Record<string, 'red' | 'amber' | null>
}

export default function TabNav({ activeTab, onTabChange, notifications = {} }: TabNavProps) {
  return (
    <nav className="sticky top-[52px] z-40 bg-white border-b border-border px-6">
      <div className="max-w-7xl mx-auto flex gap-1">
        {TABS.map((tab) => {
          const dot = notifications[tab.id]
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative px-4 py-3 text-sm transition-colors ${
                activeTab === tab.id
                  ? 'text-accent border-b-2 border-accent font-medium'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.label}
              {dot && (
                <span className={`absolute top-2 right-1.5 w-2 h-2 rounded-full ${dot === 'red' ? 'bg-danger' : 'bg-warning'}`} />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
