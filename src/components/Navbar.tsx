import { Activity, ShieldCheck, MapPin, Database, Terminal, Edit3, RotateCcw } from 'lucide-react'

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
    <header className="bg-[#07080a]/95 backdrop-blur-md border-b border-[#242728] sticky top-0 z-50">
      {/* Top Quiet Meta Banner */}
      <div className="bg-[#07080a] border-b border-[#242728]/70 px-4 py-1 text-[11px] text-[#9c9c9d] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#59d499]"></span>
          <span className="font-medium text-[#cdcdcd] tracking-tight">
            Government of Assam · National Health Mission (NHM) · Decision Support System
          </span>
        </div>
        <div className="flex items-center gap-3 text-[#6a6b6c]">
          <span className="flex items-center gap-1.5 text-[11px] text-[#9c9c9d]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#59d499]" />
            <span>MHCA 2017 §23 &amp; DPDP Compliant</span>
          </span>
          <span className="hidden sm:inline text-[#242728]">|</span>
          <span className="hidden sm:inline text-[#9c9c9d]">Pilot: Cachar &amp; Kamrup Metro</span>
        </div>
      </div>

      {/* Main Command Bar Navigation */}
      <div className="max-w-6xl mx-auto px-4 h-14 flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#121212] border border-[#242728] flex items-center justify-center text-white shrink-0">
            <Terminal className="w-4 h-4 text-[#57c1ff]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-semibold text-[#f4f4f6] tracking-tight">
                Mental Health DSS
              </h1>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#101111] text-[#9c9c9d] border border-[#242728]">
                v1.0
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full md:w-auto">
          {/* Pill Tabs */}
          <nav className="flex items-center bg-[#0d0d0d] p-1 rounded-lg border border-[#242728] gap-1">
            <button
              onClick={() => setActiveTab('state')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'state'
                  ? 'bg-[#18191a] text-[#ffffff] border border-white/10'
                  : 'text-[#9c9c9d] hover:text-[#f4f4f6]'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Call Trends</span>
            </button>

            <button
              onClick={() => setActiveTab('planner')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'planner'
                  ? 'bg-[#18191a] text-[#ffffff] border border-white/10'
                  : 'text-[#9c9c9d] hover:text-[#f4f4f6]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Van Siting</span>
            </button>

            <button
              onClick={() => setActiveTab('queue')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'queue'
                  ? 'bg-[#18191a] text-[#ffffff] border border-white/10'
                  : 'text-[#9c9c9d] hover:text-[#f4f4f6]'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Retention</span>
              {stalledCount > 0 && (
                <span className="bg-[#ff6161] text-[#ffffff] text-[9px] px-1.5 py-0.2 rounded-full font-bold ml-0.5">
                  {stalledCount}
                </span>
              )}
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsEditMode((prev) => !prev)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer border ${
                isEditMode
                  ? 'bg-[#18191a] text-[#ffc533] border-[#ffc533]/40'
                  : 'bg-[#101111] text-[#cdcdcd] border-[#242728] hover:text-white hover:bg-[#121212]'
              }`}
              title="Toggle interactive scenario editing"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditMode ? 'Editing On' : 'Edit Scenario'}</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Reset all values to official NHM Cachar defaults?')) {
                  resetToDefaults()
                }
              }}
              className="p-1.5 rounded-lg text-xs text-[#9c9c9d] hover:text-white bg-[#101111] border border-[#242728] hover:bg-[#121212] transition-all cursor-pointer"
              title="Reset all values to official defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Mode Active Thin Strip */}
      {isEditMode && (
        <div className="bg-[#101111] border-t border-b border-[#242728] px-4 py-1.5 text-[11px] text-[#cdcdcd] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffc533] animate-pulse"></span>
            <span className="font-semibold text-white">Scenario Edit Mode:</span>
            <span className="text-[#9c9c9d]">
              Click any value or use the command palette below. Changes recalculate linear programming &amp; surveillance in real-time.
            </span>
          </div>
          <button
            onClick={resetToDefaults}
            className="text-[10px] font-semibold text-[#57c1ff] hover:underline cursor-pointer"
          >
            Reset Defaults
          </button>
        </div>
      )}
    </header>
  )
}
