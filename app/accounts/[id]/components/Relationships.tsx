'use client'

import { useState, useEffect, useCallback } from 'react'
import { ContactKapData, Signal } from '@/lib/types'
import { RELATIONSHIP_LEVEL_ORDER, RELATIONSHIP_COLORS, INTELLIGENCE_LAYERS } from '@/lib/constants'
import ContactCard from './ui/ContactCard'
import ContactIntelPanel from './ui/ContactIntelPanel'

interface RelationshipsProps {
  contacts: ContactKapData[]
  signals: Signal[]
}

export default function Relationships({ contacts, signals }: RelationshipsProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)

  const allContactsFlat = contacts.sort((a, b) => {
    const levelOrder = RELATIONSHIP_LEVEL_ORDER
    return levelOrder.indexOf(a.relationship_level) - levelOrder.indexOf(b.relationship_level)
  })

  const selected = contacts.find((c) => c.id === selectedId) ?? null

  const grouped = RELATIONSHIP_LEVEL_ORDER.map((level) => ({
    level,
    contacts: contacts.filter((c) => c.relationship_level === level),
  })).filter((g) => g.contacts.length > 0)

  const handleSelectContact = useCallback((id: string) => {
    setSelectedId(id)
    const idx = allContactsFlat.findIndex(c => c.id === id)
    setSelectedIndex(idx)
  }, [allContactsFlat])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const newIdx = Math.min(selectedIndex + 1, allContactsFlat.length - 1)
        setSelectedIndex(newIdx)
        setSelectedId(allContactsFlat[newIdx]?.id ?? null)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        const newIdx = Math.max(selectedIndex - 1, 0)
        setSelectedIndex(newIdx)
        setSelectedId(allContactsFlat[newIdx]?.id ?? null)
      } else if (e.key === 'Escape') {
        setSelectedId(null)
        setSelectedIndex(-1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex, allContactsFlat])

  return (
    <div className="flex gap-6">
      {/* Contact map — left 55% */}
      <div className="w-[55%] space-y-6">
        {grouped.map(({ level, contacts: groupContacts }) => {
          const colors = RELATIONSHIP_COLORS[level]
          return (
            <div key={level}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
                <h3 className="text-section-header text-text-primary capitalize">
                  {level.charAt(0) + level.slice(1).toLowerCase()}
                </h3>
                <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-page text-text-dim text-xs font-medium">
                  {groupContacts.length}
                </span>
              </div>
              <div className="space-y-3">
                {groupContacts.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    {...contact}
                    isSelected={selectedId === contact.id}
                    onClick={() => handleSelectContact(contact.id)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Intelligence panel — right 45% */}
      <div className="w-[45%]">
        {!selected ? (
          <div className="sticky top-40 card text-center py-12">
            <div className="text-3xl mb-3">👤</div>
            <p className="text-sm text-text-secondary mb-1">Select a contact to view intelligence</p>
            <p className="text-meta">Use arrow keys to navigate, Enter to select</p>
          </div>
        ) : (
          <ContactIntelPanel contact={selected} signals={signals} />
        )}
      </div>
    </div>
  )
}
