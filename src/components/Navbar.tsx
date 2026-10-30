import { Activity, ShieldCheck, MapPin, Database, Edit3, RotateCcw } from 'lucide-react'

interface NavbarProps {
  activeTab: 'state' | 'planner' | 'queue'
  setActiveTab: (tab: 'state' | 'planner' | 'queue') => void
  stalledCount: number
  isEditMode: boolean
  setIsEditMode: (val: boolean | ((prev: boolean) => boolean)) => void
  resetToDefaults: () => void
}

// Anthropic 4-spoke radial-spike mark
const AnthropicSpike = ({ className = "w-4 h-4 text-[#cc785c]" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2L13.2 9.8L21 11L13.2 12.2L12 20L10.8 12.2L3 11L10.8 9.8L12 2Z" />
  </svg>
)

export const Navbar = ({
  activeTab,
  setActiveTab,
  stalledCount,
  isEditMode,
  setIsEditMode,
  resetToDefaults,
}: NavbarProps) => {
  return (
    <header className="bg-[#faf9f5]/95 backdrop-blur-md border-b border-[#e6dfd8] sticky top-0 z-50">
      {/* Top Institutional Editorial Strip */}
      <div className="bg-[#f5f0e8] border-b border-[#e6dfd8]/80 px-4 py-1 text-[11px] text-[#6c6a64] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AnthropicSpike className="w-3 h-3 text-[#cc785c]" />
          <span className="font-medium text-[#252523]">
            Government of Assam · National Health Mission (NHM) · Decision Support
          </span>
        </div>
        <div className="flex items-center gap-3 text-[#8e8b82]">
          <span className="flex items-center gap-1.5 text-[11px] text-[#3d3d3a]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#5db872]" />
            <span>MHCA 2017 §23 &amp; DPDP Compliant</span>
          </span>
          <span className="hidden sm:inline text-[#e6dfd8]">|</span>
          <span className="hidden sm:inline text-[#6c6a64]">Pilot: Cachar &amp; Kamrup Metro</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-6xl mx-auto px-4 h-16 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#efe9de] border border-[#e6dfd8] flex items-center justify-center text-[#141413] shrink-0">
            <AnthropicSpike className="w-4 h-4 text-[#cc785c]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-normal text-[#141413] font-serif-claude tracking-tight">
                Mental Health Care Navigator
              </h1>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#f5f0e8] text-[#cc785c] border border-[#e6dfd8]">
                Decision Support
              </span>
            </div>
            <p className="text-xs text-[#6c6a64] hidden sm:block">
              Earlier identification · Capacitated van siting · Closed-loop patient retention
            </p>
          </div>
        </div>

        {/* Right side controls: Tabs + Edit/Reset Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full md:w-auto">
          {/* Category Tabs */}
          <nav className="flex items-center bg-[#f5f0e8] p-1 rounded-lg border border-[#e6dfd8] gap-1">
            <button
              onClick={() => setActiveTab('state')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'state'
                  ? 'bg-[#efe9de] text-[#141413] shadow-xs font-medium border border-[#e6dfd8]'
                  : 'text-[#6c6a64] hover:text-[#141413]'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-[#cc785c]" />
              <span>Call Trends</span>
            </button>

            <button
              onClick={() => setActiveTab('planner')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'planner'
                  ? 'bg-[#efe9de] text-[#141413] shadow-xs font-medium border border-[#e6dfd8]'
                  : 'text-[#6c6a64] hover:text-[#141413]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-[#cc785c]" />
              <span>Van Siting</span>
            </button>

            <button
              onClick={() => setActiveTab('queue')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'queue'
                  ? 'bg-[#efe9de] text-[#141413] shadow-xs font-medium border border-[#e6dfd8]'
                  : 'text-[#6c6a64] hover:text-[#141413]'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-[#cc785c]" />
              <span>Retention</span>
              {stalledCount > 0 && (
                <span className="bg-[#cc785c] text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold ml-0.5">
                  {stalledCount}
                </span>
              )}
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsEditMode((prev) => !prev)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer border ${
                isEditMode
                  ? 'bg-[#cc785c] text-white border-[#cc785c] shadow-xs'
                  : 'bg-[#faf9f5] text-[#141413] border-[#e6dfd8] hover:bg-[#f5f0e8]'
              }`}
              title="Toggle interactive scenario editing"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditMode ? 'Editing Active' : 'Edit Scenario'}</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Reset all values back to official NHM Cachar defaults?')) {
                  resetToDefaults()
                }
              }}
              className="p-2 rounded-md text-xs text-[#6c6a64] hover:text-[#141413] bg-[#faf9f5] border border-[#e6dfd8] hover:bg-[#f5f0e8] transition-all cursor-pointer shadow-2xs"
              title="Reset all values to official defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Mode Active Warm Ribbon */}
      {isEditMode && (
        <div className="bg-[#f5f0e8] border-t border-b border-[#e6dfd8] px-4 py-1.5 text-[11px] text-[#3d3d3a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#cc785c] animate-pulse"></span>
            <span className="font-semibold text-[#141413]">Scenario Reconfiguration Active:</span>
            <span className="text-[#6c6a64]">
              You can modify block populations, flood multipliers, clinic capacities, and district calls.
            </span>
          </div>
          <button
            onClick={resetToDefaults}
            className="text-[10px] font-semibold text-[#cc785c] hover:underline cursor-pointer"
          >
            Reset to Benchmark
          </button>
        </div>
      )}
    </header>
  )
}
