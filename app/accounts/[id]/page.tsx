'use client'

import { useState } from 'react'
import { getMockAccountData } from '@/lib/mock-data'
import { TabId } from '@/lib/constants'
import Header from './components/Header'
import TabNav from './components/TabNav'
import Overview from './components/Overview'
import Relationships from './components/Relationships'
import Pipeline from './components/Pipeline'
import Intelligence from './components/Intelligence'
import ActionPlan from './components/ActionPlan'
import Deliverables from './components/Deliverables'
import Coach from './components/Coach'

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const data = getMockAccountData()

  return (
    <div className="min-h-screen bg-page">
      <Header
        accountName={data.account.name}
        tier={data.account.tier}
        healthScore={data.healthScore}
        integrationStatus={data.integrationStatus}
      />
      <TabNav activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as TabId)} />

      <main className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'overview' && <Overview data={data} />}
        {activeTab === 'relationships' && (
          <Relationships contacts={data.contacts} signals={data.signals} />
        )}
        {activeTab === 'pipeline' && <Pipeline deals={data.deals} contacts={data.contacts} />}
        {activeTab === 'intelligence' && (
          <Intelligence
            eosic={data.eosic}
            opportunities={data.opportunities}
            account={data.account}
          />
        )}
        {activeTab === 'action-plan' && (
          <ActionPlan account={data.account} manMarking={data.manMarking} />
        )}
        {activeTab === 'deliverables' && (
          <Deliverables
            deliveryMetrics={data.deliveryMetrics}
            campaignMetrics={data.campaignMetrics}
            integrationStatus={data.integrationStatus}
          />
        )}
        {activeTab === 'coach' && <Coach data={data} />}
      </main>
    </div>
  )
}
