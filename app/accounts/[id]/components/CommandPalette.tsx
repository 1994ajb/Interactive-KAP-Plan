'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { ContactKapData, HubSpotDeal, Signal } from '@/lib/types'

interface CommandPaletteProps {
  contacts: ContactKapData[]
  deals: HubSpotDeal[]
  signals: Signal[]
  onSelect: (type: string, item: { name: string; id?: string }) => void
  onClose: () => void
}

type ResultItem = {
  type: 'contact' | 'deal' | 'signal'
  name: string
  id?: string
  meta?: string
}

export default function CommandPalette({ contacts, deals, signals, onSelect, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const results = useMemo(() => {
    const q = query.toLowerCase().trim()
    const items: ResultItem[] = []

    if (!q) {
      // Show recent/important items when no query
      contacts.slice(0, 3).forEach(c => items.push({ type: 'contact', name: c.name, id: c.hubspot_contact_id ?? undefined, meta: c.role || c.buyer_type }))
      deals.filter(d => d.dealstage !== 'closedwon' && d.dealstage !== 'closedlost').slice(0, 3).forEach(d => items.push({ type: 'deal', name: d.dealname, id: d.id, meta: d.dealstage }))
      signals.filter(s => !s.dismissed).slice(0, 3).forEach(s => items.push({ type: 'signal', name: s.title, meta: s.priority }))
      return items
    }

    contacts.filter(c => c.name.toLowerCase().includes(q) || (c.role || '').toLowerCase().includes(q)).forEach(c => items.push({ type: 'contact', name: c.name, id: c.hubspot_contact_id ?? undefined, meta: c.role || c.buyer_type }))
    deals.filter(d => d.dealname.toLowerCase().includes(q)).forEach(d => items.push({ type: 'deal', name: d.dealname, id: d.id, meta: d.dealstage }))
    signals.filter(s => s.title.toLowerCase().includes(q) || (s.detail || '').toLowerCase().includes(q)).forEach(s => items.push({ type: 'signal', name: s.title, meta: s.priority }))

    return items.slice(0, 12)
  }, [query, contacts, deals, signals])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault()
        const item = results[selectedIndex]
        if (item) onSelect(item.type, { name: item.name, id: item.id })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [results, selectedIndex, onSelect, onClose])

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const selected = list.children[selectedIndex] as HTMLElement | undefined
    selected?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  const typeIcon = (type: string) => {
    switch (type) {
      case 'contact': return '👤'
      case 'deal': return '💰'
      case 'signal': return '⚡'
      default: return '•'
    }
  }

  const typeLabel = (type: string) => {
    switch (type) {
      case 'contact': return 'People'
      case 'deal': return 'Pipeline'
      case 'signal': return 'Signals'
      default: return type
    }
  }

  return (
    <div className="cmd-palette-overlay" onClick={onClose}>
      <div className="cmd-palette" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <svg className="w-4 h-4 text-text-dim flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search contacts, deals, signals..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-dim outline-none"
          />
          <kbd className="text-[10px] font-mono text-text-dim bg-page px-1.5 py-0.5 rounded border border-border">ESC</kbd>
        </div>

        <div ref={listRef} className="max-h-[320px] overflow-y-auto py-2">
          {results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-text-secondary">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}
          {results.map((item, index) => (
            <button
              key={`${item.type}-${item.name}-${index}`}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${index === selectedIndex ? 'bg-accent/10 text-accent' : 'text-text-primary hover:bg-page'}`}
              onClick={() => onSelect(item.type, { name: item.name, id: item.id })}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className="text-base flex-shrink-0">{typeIcon(item.type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                {item.meta && <p className="text-meta truncate">{item.meta}</p>}
              </div>
              <span className="text-[10px] font-medium text-text-dim bg-page px-2 py-0.5 rounded-full flex-shrink-0">
                {typeLabel(item.type)}
              </span>
            </button>
          ))}
        </div>

        {!query && (
          <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-meta">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
        )}
      </div>
    </div>
  )
}
