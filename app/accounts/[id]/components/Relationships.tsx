'use client'

import { useState } from 'react'
import { ContactKapData } from '@/lib/types'
import { RELATIONSHIP_LEVEL_ORDER, RELATIONSHIP_COLORS } from '@/lib/constants'
import ContactCard from './ui/ContactCard'
import Badge from './ui/Badge'

interface RelationshipsProps {
  contacts: ContactKapData[]
}

export default function Relationships({ contacts }: RelationshipsProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = contacts.find((c) => c.id === selectedId) ?? null

  // Group contacts by relationship level in descending order
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

      {/* Detail panel — right 40% */}
      <div className="w-[40%]">
        <div className="sticky top-40">
          {!selected ? (
            <div className="bg-white rounded-xl border p-6 text-center text-text-secondary text-sm">
              Select a contact to view details
            </div>
          ) : (
            <div className="bg-white rounded-xl border p-6 space-y-5">
              {/* Header */}
              <div>
                <h2 className="text-xl font-semibold text-text-primary">{selected.name}</h2>
                <p className="text-text-secondary text-sm">{selected.role}</p>
              </div>

              {/* Detail grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-text-secondary mb-1">Tenure</p>
                  <p className="text-text-primary font-medium">{selected.tenure}</p>
                </div>
                <div>
                  <p className="text-text-secondary mb-1">Relationship Level</p>
                  <Badge
                    label={selected.relationship_level}
                    variant={selected.relationship_level === 'CHAMPION' || selected.relationship_level === 'TRUST' ? 'green' : selected.relationship_level === 'ACKNOWLEDGE' ? 'red' : 'amber'}
                  />
                </div>
                <div>
                  <p className="text-text-secondary mb-1">Buyer Type</p>
                  <p className="text-text-primary font-medium">{selected.buyer_type}</p>
                </div>
                <div>
                  <p className="text-text-secondary mb-1">Campfire Owner</p>
                  <p className="text-text-primary font-medium">{selected.campfire_owner}</p>
                </div>
                <div>
                  <p className="text-text-secondary mb-1">Priority</p>
                  <Badge label={selected.priority} variant={selected.priority === 'CRITICAL' ? 'red' : selected.priority === 'HIGH' ? 'amber' : 'blue'} />
                </div>
                <div>
                  <p className="text-text-secondary mb-1">Last Contacted</p>
                  <p className="text-text-primary font-mono text-xs">
                    {selected.last_contacted ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="text-text-secondary mb-1">Days Since Contact</p>
                  <p className="text-text-primary font-medium">
                    {selected.days_since_contact != null ? selected.days_since_contact : '—'}
                  </p>
                </div>
              </div>

              {/* Next Step */}
              {selected.next_step && (
                <div className="bg-accent-soft border-l-4 border-accent rounded-lg p-4">
                  <p className="text-xs font-semibold text-text-secondary mb-1">Next Step</p>
                  <p className="text-sm text-text-primary">{selected.next_step}</p>
                </div>
              )}

              {/* HubSpot link */}
              {selected.hubspot_contact_id && (
                <a
                  href={`https://app-eu1.hubspot.com/contacts/145447962/record/0-1/${selected.hubspot_contact_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
                >
                  View in HubSpot →
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
