// Navbar
import { Activity, ShieldCheck, MapPin, Database } from 'lucide-react'

interface NavbarProps {
  activeTab: 'state' | 'planner' | 'queue'
  setActiveTab: (tab: 'state' | 'planner' | 'queue') => void
  stalledCount: number
}
export const Navbar = ({ activeTab, setActiveTab, stalledCount }: NavbarProps) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      {/* Top Gov Banner */}
      <div className="bg-slate-950 px-4 py-1.5 text-xs border-b border-slate-800/80 flex items-center justify-between text-slate-400">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>GOVERNMENT OF ASSAM · NATIONAL HEALTH MISSION (NHM) · NESFIC 2026 PILOT</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> MHCA 2017 §23 & DPDP Compliant
          </span>
          <span className="hidden sm:inline text-slate-400">Target: Kamrup Metro & Cachar</span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Assam Mental Health DSS
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  Decision Support
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Earlier Identification, Care Funnel Surveillance & MILP Outreach Camp Optimization
              </p>
            </div>
          </div>
        </div>

        {/* Surface Switcher Tabs */}
        <nav className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('state')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'state'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            State Policy View
          </button>

          <button
            onClick={() => setActiveTab('planner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'planner'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            DMHP Camp Planner
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold">
              MILP
            </span>
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'queue'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Retention Queue
            {stalledCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {stalledCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  )
}
