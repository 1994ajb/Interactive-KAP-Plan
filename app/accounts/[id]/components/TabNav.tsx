'use client'

import { TABS } from '@/lib/constants'

interface TabNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function TabNav({ activeTab, onTabChange }: TabNavProps) {
  return (
    <nav className="sticky top-[64px] z-40 bg-white border-b border-[#e2e8f0] px-6">
      <div className="flex gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-3 text-sm transition-colors ${
              activeTab === tab.id
                ? 'text-accent border-b-2 border-accent font-medium'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
