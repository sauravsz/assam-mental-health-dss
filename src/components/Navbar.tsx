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
      <div className="bg-slate-950 px-3 sm:px-4 py-1 text-[11px] sm:text-xs border-b border-slate-800/80 flex items-center justify-between text-slate-400">
        <div className="flex items-center gap-1.5 truncate">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse"></span>
          <span className="truncate font-medium">ASSAM NHM · MENTAL HEALTH DSS</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] sm:text-[11px] shrink-0">
          <span className="flex items-center gap-1 text-slate-300">
            <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="hidden xs:inline">MHCA & DPDP Compliant</span>
            <span className="xs:hidden">Compliant</span>
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3">
        <div>
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm shrink-0">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Assam Mental Health DSS
                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  Pilot
                </span>
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-400 hidden xs:block line-clamp-1">
                Early Identification, Care Funnel Surveillance & MILP Outreach Optimization
              </p>
            </div>
          </div>
        </div>

        {/* Surface Switcher Tabs (3-column responsive grid on mobile, flex on desktop) */}
        <nav className="grid grid-cols-3 sm:flex items-center gap-1 bg-slate-950/80 sm:bg-slate-800/90 p-1 rounded-xl border border-slate-800 sm:border-slate-700 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('state')}
            className={`px-2 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all flex items-center justify-center gap-1 sm:gap-1.5 text-center cursor-pointer ${
              activeTab === 'state'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Database className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">State View</span>
          </button>

          <button
            onClick={() => setActiveTab('planner')}
            className={`px-2 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all flex items-center justify-center gap-1 sm:gap-1.5 text-center cursor-pointer ${
              activeTab === 'planner'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Camp Siting</span>
            <span className="hidden sm:inline bg-emerald-500/20 text-emerald-300 text-[9px] px-1 py-0.2 rounded font-mono font-semibold">
              MILP
            </span>
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`px-2 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all flex items-center justify-center gap-1 sm:gap-1.5 text-center cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Retention</span>
            {stalledCount > 0 && (
              <span className="bg-rose-500 text-white text-[9px] px-1 py-0.2 rounded-full font-bold shrink-0">
                {stalledCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  )
}
