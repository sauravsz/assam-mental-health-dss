import { Activity, ShieldCheck, MapPin, Database, Cpu, Edit3, RotateCcw } from 'lucide-react'

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
    <header className="bg-[#09231A]/95 backdrop-blur-md border-b border-[#B87333]/40 sticky top-0 z-50">
      {/* Top Institutional Circuit Trace Strip */}
      <div className="bg-[#061812] border-b border-[#B87333]/25 px-4 py-1 text-[11px] text-[#C2AB8E] flex items-center justify-between font-sans-tech">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FFD700] ring-2 ring-[#FFD700]/30 animate-pulse"></span>
          <span className="font-semibold text-[#EAD0AC] tracking-wide">
            GOVERNMENT OF ASSAM · NATIONAL HEALTH MISSION (NHM) · ARCHITECTURE v1.0
          </span>
        </div>
        <div className="flex items-center gap-3 text-[#C2AB8E]">
          <span className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FFD700]" />
            <span>MHCA 2017 §23 &amp; DPDP Compliant</span>
          </span>
          <span className="hidden sm:inline text-[#B87333]">|</span>
          <span className="hidden sm:inline text-[#EAD0AC]/80">Pilot Node: Cachar &amp; Kamrup</span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#144837] border border-[#B87333] text-[#FFD700] flex items-center justify-center shadow-[0_0_12px_rgba(184,115,51,0.25)] shrink-0 relative">
            <Cpu className="w-5 h-5 text-[#D98C53]" />
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#FFD700]"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-[#EAD0AC] font-serif-display tracking-tight">
                Mental Health Care Navigator
              </h1>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#165B45] text-[#FFD700] border border-[#B87333]/60">
                DSS CORE
              </span>
            </div>
            <p className="text-xs text-[#C2AB8E] hidden sm:block font-sans-tech">
              Early Identification · Capacitated MILP Routing · Closed-Loop Care Retention
            </p>
          </div>
        </div>

        {/* Right side controls: Tabs + Edit/Reset Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto font-sans-tech">
          {/* Segmented Control Tabs styled as PCB trace channels */}
          <nav className="grid grid-cols-3 sm:flex items-center gap-1 bg-[#09231A] p-1 rounded-lg border border-[#B87333]/50">
            <button
              onClick={() => setActiveTab('state')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'state'
                  ? 'bg-[#D98C53] text-[#09231A] shadow-xs font-bold'
                  : 'text-[#EAD0AC] hover:text-white hover:bg-[#144837]'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-current" />
              <span>1. Call Trends</span>
            </button>

            <button
              onClick={() => setActiveTab('planner')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'planner'
                  ? 'bg-[#D98C53] text-[#09231A] shadow-xs font-bold'
                  : 'text-[#EAD0AC] hover:text-white hover:bg-[#144837]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-current" />
              <span>2. Van Siting</span>
            </button>

            <button
              onClick={() => setActiveTab('queue')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'queue'
                  ? 'bg-[#D98C53] text-[#09231A] shadow-xs font-bold'
                  : 'text-[#EAD0AC] hover:text-white hover:bg-[#144837]'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-current" />
              <span>3. Retention</span>
              {stalledCount > 0 && (
                <span className="bg-[#B87333] text-white text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ml-0.5">
                  {stalledCount}
                </span>
              )}
            </button>
          </nav>

          {/* Edit Mode & Reset Scenario Buttons */}
          <div className="flex items-center gap-1.5 justify-end">
            <button
              onClick={() => setIsEditMode((prev) => !prev)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                isEditMode
                  ? 'bg-[#FFD700] text-[#09231A] border-[#FFD700] shadow-[0_0_10px_rgba(255,215,0,0.3)] font-bold'
                  : 'bg-[#144837] text-[#EAD0AC] border-[#B87333]/60 hover:bg-[#1A5944]'
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
              className="p-1.5 rounded-lg text-xs text-[#EAD0AC] hover:text-[#FFD700] bg-[#144837] border border-[#B87333]/60 hover:bg-[#1A5944] transition-all cursor-pointer"
              title="Reset all values to official NHM Cachar defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Persistent copper ribbon when Edit Mode is active */}
      {isEditMode && (
        <div className="bg-[#144837] border-t border-b border-[#B87333] px-4 py-1.5 text-[11px] text-[#FFD700] flex items-center justify-between font-sans-tech">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FFD700] animate-ping"></span>
            <span className="font-bold">SCENARIO RECONFIGURATION BUS ACTIVE:</span>
            <span className="text-[#EAD0AC]">
              Direct parameter modification enabled. Simplex LP and Poisson engines recalculate in real-time.
            </span>
          </div>
          <button
            onClick={resetToDefaults}
            className="text-[10px] font-bold text-[#D98C53] underline hover:text-[#FFD700] cursor-pointer"
          >
            Reset to Benchmark
          </button>
        </div>
      )}
    </header>
  )
}
