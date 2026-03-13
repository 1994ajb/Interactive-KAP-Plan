'use client'

import { useState } from 'react'
import { ContactKapData, Signal } from '@/lib/types'
import { RELATIONSHIP_LEVEL_ORDER, RELATIONSHIP_COLORS } from '@/lib/constants'
import ContactCard from './ui/ContactCard'
import ContactIntelPanel from './ui/ContactIntelPanel'

interface RelationshipsProps {
  contacts: ContactKapData[]
  signals: Signal[]
}

export default function Relationships({ contacts, signals }: RelationshipsProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = contacts.find((c) => c.id === selectedId) ?? null

  const grouped = RELATIONSHIP_LEVEL_ORDER.map((level) => ({
    level,
    contacts: contacts.filter((c) => c.relationship_level === level),
  })).filter((g) => g.contacts.length > 0)

  return (
    <div className="flex gap-6">
      {/* Contact map — left 60% */}
      <div className="w-[60%] space-y-6">
        {grouped.map(({ level, contacts: groupContacts }) => {
          const colors = RELATIONSHIP_COLORS[level]
          return (
            <div key={level}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
                <h3 className="text-lg font-semibold text-text-primary capitalize">
                  {level.charAt(0) + level.slice(1).toLowerCase()}
                </h3>
                <span className="text-sm text-text-dim ml-1">({groupContacts.length})</span>
              </div>
              <div className="space-y-3">
                {groupContacts.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    {...contact}
                    onClick={() => setSelectedId(contact.id)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Intelligence panel — right 40% */}
      <div className="w-[40%]">
        {!selected ? (
          <div className="sticky top-40 bg-white rounded-xl border p-8 text-center">
            <div className="text-3xl mb-3">👤</div>
            <p className="text-text-secondary text-sm">Select a contact to view their 7-layer intelligence profile</p>
          </div>
        ) : (
          <ContactIntelPanel contact={selected} signals={signals} />
        )}
      </div>
    </div>
  )
}
