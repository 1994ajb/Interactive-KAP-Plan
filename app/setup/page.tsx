'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Step = 1 | 2 | 3 | 4

interface SetupData {
  // Step 1: Supabase
  supabaseUrl: string
  supabaseKey: string
  supabaseStatus: 'idle' | 'testing' | 'success' | 'error'
  // Step 2: HubSpot
  hubspotPortalId: string
  hubspotApiKey: string
  hubspotStatus: 'idle' | 'testing' | 'success' | 'error'
  // Step 3: Optional integrations
  slackToken: string
  clayApiKey: string
  anthropicKey: string
  // Step 4: Account setup
  accountName: string
  accountTier: string
  hubspotCompanyIds: string
}

const STEPS = [
  { num: 1, title: 'Database', desc: 'Connect Supabase' },
  { num: 2, title: 'CRM', desc: 'Connect HubSpot' },
  { num: 3, title: 'Integrations', desc: 'Optional services' },
  { num: 4, title: 'Account', desc: 'First account setup' },
]

export default function SetupWizard() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [data, setData] = useState<SetupData>({
    supabaseUrl: '',
    supabaseKey: '',
    supabaseStatus: 'idle',
    hubspotPortalId: '',
    hubspotApiKey: '',
    hubspotStatus: 'idle',
    slackToken: '',
    clayApiKey: '',
    anthropicKey: '',
    accountName: '',
    accountTier: 'RETENTION',
    hubspotCompanyIds: '',
  })

  const update = (partial: Partial<SetupData>) => setData(prev => ({ ...prev, ...partial }))

  const testSupabase = async () => {
    update({ supabaseStatus: 'testing' })
    try {
      const res = await fetch('/api/setup/test-supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: data.supabaseUrl, key: data.supabaseKey }),
      })
      const result = await res.json()
      update({ supabaseStatus: result.success ? 'success' : 'error' })
    } catch {
      update({ supabaseStatus: 'error' })
    }
  }

  const testHubSpot = async () => {
    update({ hubspotStatus: 'testing' })
    try {
      const res = await fetch('/api/setup/test-hubspot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portalId: data.hubspotPortalId, apiKey: data.hubspotApiKey }),
      })
      const result = await res.json()
      update({ hubspotStatus: result.success ? 'success' : 'error' })
    } catch {
      update({ hubspotStatus: 'error' })
    }
  }

  const finishSetup = async () => {
    try {
      await fetch('/api/setup/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } catch {
      // Continue anyway — setup data saved locally
    }
    router.push('/')
  }

  const canProceed = () => {
    switch (step) {
      case 1: return data.supabaseUrl && data.supabaseKey
      case 2: return true // HubSpot is optional
      case 3: return true // All optional
      case 4: return data.accountName.length > 0
    }
  }

  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-4">
      <div className="card max-w-lg w-full">
        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${step >= s.num ? 'bg-accent text-white' : 'bg-page text-text-dim border border-border'}`}>
                {step > s.num ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                ) : s.num}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-12 h-0.5 mx-1 transition-colors ${step > s.num ? 'bg-accent' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="mb-2">
          <h2 className="text-lg font-semibold text-text-primary">{STEPS[step - 1].title}</h2>
          <p className="text-meta">{STEPS[step - 1].desc}</p>
        </div>

        {/* Step 1: Supabase */}
        {step === 1 && (
          <div className="space-y-4 mt-4">
            <p className="text-sm text-text-secondary">Connect your Supabase project to store account data, contacts, signals, and intelligence layers.</p>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Supabase URL</label>
              <input
                type="url"
                value={data.supabaseUrl}
                onChange={e => update({ supabaseUrl: e.target.value })}
                placeholder="https://xxxxx.supabase.co"
                className="w-full bg-page border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-dim outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Anon Key</label>
              <input
                type="password"
                value={data.supabaseKey}
                onChange={e => update({ supabaseKey: e.target.value })}
                placeholder="eyJ..."
                className="w-full bg-page border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-dim outline-none focus:border-accent"
              />
            </div>
            <button onClick={testSupabase} disabled={!data.supabaseUrl || !data.supabaseKey || data.supabaseStatus === 'testing'} className="text-xs font-medium text-accent hover:underline disabled:opacity-50">
              {data.supabaseStatus === 'testing' ? 'Testing...' : data.supabaseStatus === 'success' ? 'Connected' : data.supabaseStatus === 'error' ? 'Failed — retry' : 'Test Connection'}
            </button>
            {data.supabaseStatus === 'success' && <p className="text-xs text-success">Supabase connected successfully.</p>}
            {data.supabaseStatus === 'error' && <p className="text-xs text-danger">Connection failed. Check your credentials.</p>}
          </div>
        )}

        {/* Step 2: HubSpot */}
        {step === 2 && (
          <div className="space-y-4 mt-4">
            <p className="text-sm text-text-secondary">Connect HubSpot to sync contacts and deals. This step is optional — mock data will be used if skipped.</p>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Portal ID</label>
              <input
                type="text"
                value={data.hubspotPortalId}
                onChange={e => update({ hubspotPortalId: e.target.value })}
                placeholder="145447962"
                className="w-full bg-page border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-dim outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Private App Token</label>
              <input
                type="password"
                value={data.hubspotApiKey}
                onChange={e => update({ hubspotApiKey: e.target.value })}
                placeholder="pat-eu1-..."
                className="w-full bg-page border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-dim outline-none focus:border-accent"
              />
            </div>
            {data.hubspotPortalId && data.hubspotApiKey && (
              <button onClick={testHubSpot} disabled={data.hubspotStatus === 'testing'} className="text-xs font-medium text-accent hover:underline disabled:opacity-50">
                {data.hubspotStatus === 'testing' ? 'Testing...' : data.hubspotStatus === 'success' ? 'Connected' : 'Test Connection'}
              </button>
            )}
            <div className="bg-page rounded-lg p-3 text-xs text-text-secondary">
              Skip this step to use mock data. You can configure HubSpot later in settings.
            </div>
          </div>
        )}

        {/* Step 3: Optional Integrations */}
        {step === 3 && (
          <div className="space-y-4 mt-4">
            <p className="text-sm text-text-secondary">These integrations are optional and can be configured later. They enhance intelligence and coaching features.</p>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Anthropic API Key <span className="text-accent">(recommended)</span></label>
              <input
                type="password"
                value={data.anthropicKey}
                onChange={e => update({ anthropicKey: e.target.value })}
                placeholder="sk-ant-..."
                className="w-full bg-page border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-dim outline-none focus:border-accent"
              />
              <p className="text-meta mt-1">Powers AI meeting prep, next steps, and value narratives.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Slack Bot Token</label>
              <input
                type="password"
                value={data.slackToken}
                onChange={e => update({ slackToken: e.target.value })}
                placeholder="xoxb-..."
                className="w-full bg-page border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-dim outline-none focus:border-accent"
              />
              <p className="text-meta mt-1">Enables Slack signal scanning and channel search.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Clay API Key</label>
              <input
                type="password"
                value={data.clayApiKey}
                onChange={e => update({ clayApiKey: e.target.value })}
                placeholder="clay_..."
                className="w-full bg-page border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-dim outline-none focus:border-accent"
              />
              <p className="text-meta mt-1">Enriches contact intelligence with Clay data.</p>
            </div>
          </div>
        )}

        {/* Step 4: First Account */}
        {step === 4 && (
          <div className="space-y-4 mt-4">
            <p className="text-sm text-text-secondary">Set up your first key account. You can add more accounts later from the portfolio dashboard.</p>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Account Name</label>
              <input
                type="text"
                value={data.accountName}
                onChange={e => update({ accountName: e.target.value })}
                placeholder="e.g. Vaseline UK"
                className="w-full bg-page border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-dim outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Account Tier</label>
              <select
                value={data.accountTier}
                onChange={e => update({ accountTier: e.target.value })}
                className="w-full bg-page border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
              >
                <option value="RETENTION">Retention</option>
                <option value="DEVELOPMENT">Development</option>
                <option value="ACQUISITION">Acquisition</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">HubSpot Company IDs <span className="text-text-dim">(comma-separated, optional)</span></label>
              <input
                type="text"
                value={data.hubspotCompanyIds}
                onChange={e => update({ hubspotCompanyIds: e.target.value })}
                placeholder="19088968678, 19088968673"
                className="w-full bg-page border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-dim outline-none focus:border-accent"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
          {step > 1 ? (
            <button onClick={() => setStep((step - 1) as Step)} className="text-sm text-text-secondary hover:text-text-primary transition-colors">
              Back
            </button>
          ) : (
            <button onClick={() => router.push('/')} className="text-sm text-text-secondary hover:text-text-primary transition-colors">
              Skip Setup
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={() => setStep((step + 1) as Step)}
              disabled={!canProceed()}
              className="bg-accent text-white rounded-lg px-6 py-2 text-sm font-medium hover:bg-accent/90 disabled:opacity-50 transition-colors"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={finishSetup}
              disabled={!canProceed()}
              className="bg-success text-white rounded-lg px-6 py-2 text-sm font-medium hover:bg-success/90 disabled:opacity-50 transition-colors"
            >
              Complete Setup
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
