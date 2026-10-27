import { Activity, ShieldCheck, MapPin, Database, HeartHandshake } from 'lucide-react'

interface NavbarProps {
  activeTab: 'state' | 'planner' | 'queue'
  setActiveTab: (tab: 'state' | 'planner' | 'queue') => void
  stalledCount: number
}

export const Navbar = ({ activeTab, setActiveTab, stalledCount }: NavbarProps) => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50">
      {/* Top Quiet Institutional Strip */}
      <div className="bg-slate-50 border-b border-slate-100 px-4 py-1 text-[11px] text-slate-500 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-medium text-slate-700">Government of Assam · National Health Mission (NHM)</span>
        </div>
        <div className="flex items-center gap-3 text-slate-500">
          <span className="flex items-center gap-1 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mental Healthcare Act &amp; Privacy Compliant</span>
          </span>
          <span className="hidden sm:inline text-slate-300">|</span>
          <span className="hidden sm:inline text-slate-600">Pilot: Kamrup &amp; Cachar</span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <HeartHandshake className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Mental Health Care Navigator
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                Decision Support
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Spot distress early · Send mobile clinic vans fairly · Follow up with callers
            </p>
          </div>
        </div>

        {/* 3 Clear Segmented Control Tabs */}
        <nav className="grid grid-cols-3 sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('state')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'state'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>1. Call Trends</span>
          </button>

          <button
            onClick={() => setActiveTab('planner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'planner'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>2. Van Routes</span>
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-rose-500" />
            <span>3. Follow-Ups</span>
            {stalledCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5">
                {stalledCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  )
}
