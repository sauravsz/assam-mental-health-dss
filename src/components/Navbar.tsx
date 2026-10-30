import { Activity, ShieldCheck, MapPin, Database, HeartHandshake, Edit3, RotateCcw } from 'lucide-react'

interface NavbarProps {
  activeTab: 'state' | 'planner' | 'queue'
  setActiveTab: (tab: 'state' | 'planner' | 'queue') => void
  stalledCount: number
  isEditMode: boolean
  setIsEditMode: (val: boolean | ((prev: boolean) => boolean)) => void
  resetToDefaults: () => void
}

export const Navbar = ({
  activeTab,
  setActiveTab,
  stalledCount,
  isEditMode,
  setIsEditMode,
  resetToDefaults,
}: NavbarProps) => {
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
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs shrink-0">
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

        {/* Right side controls: Tabs + Edit/Reset Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          {/* 3 Clear Segmented Control Tabs */}
          <nav className="grid grid-cols-3 sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
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

          {/* Edit Mode & Reset Scenario Buttons */}
          <div className="flex items-center gap-1.5 justify-end">
            <button
              onClick={() => setIsEditMode((prev) => !prev)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                isEditMode
                  ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs ring-2 ring-amber-400/40'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title="Toggle interactive scenario editing"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditMode ? 'Editing Active' : 'Edit Scenario'}</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Reset all values back to official NHM Cachar benchmark defaults?')) {
                  resetToDefaults()
                }
              }}
              className="p-1.5 rounded-xl text-xs text-slate-500 hover:text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
              title="Reset all values to official NHM Cachar defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Persistent helper ribbon when Edit Mode is active */}
      {isEditMode && (
        <div className="bg-amber-50 border-t border-b border-amber-200 px-4 py-1.5 text-[11px] text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            <span className="font-semibold">Interactive Scenario Edit Mode:</span>
            <span>
              You can now edit block population, flood factors, clinic capacities, medicine stocks, and district calls.
              All models recalculate live!
            </span>
          </div>
          <button
            onClick={resetToDefaults}
            className="text-[10px] font-bold text-amber-800 underline hover:text-amber-950 cursor-pointer"
          >
            Reset to Benchmark
          </button>
        </div>
      )}
    </header>
  )
}
