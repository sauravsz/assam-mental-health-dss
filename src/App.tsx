import { useState } from 'react'
import { Navbar } from './components/Navbar'
import { StatePolicyView } from './components/StatePolicyView'
import { DMHPCampPlanner } from './components/DMHPCampPlanner'
import { RetentionQueue } from './components/RetentionQueue'

export function App() {
  const [activeTab, setActiveTab] = useState<'state' | 'planner' | 'queue'>('planner')

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} stalledCount={434} />

      <main className="max-w-7xl mx-auto px-4 py-6 w-full flex-1">
        {activeTab === 'state' && <StatePolicyView />}
        {activeTab === 'planner' && <DMHPCampPlanner />}
        {activeTab === 'queue' && <RetentionQueue />}
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p className="font-semibold text-slate-300">
              Assam Mental Health Decision Support System (AMH-DSS) · Prototype v1.0
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              National Health Mission (NHM) Assam & Health & Family Welfare Department · NESFIC 2026 Proposal
            </p>
          </div>
          <div className="text-[11px] text-slate-400">
            Formulation: Capacitated $p$-Median MILP & Poisson Surveillance | Lead: Saurav Sinha (Assam University)
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
