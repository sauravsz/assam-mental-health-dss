import { Activity, ShieldCheck, MapPin, HeartHandshake, Edit3, RotateCcw, Lock } from 'lucide-react'
import { useScenarioData } from '../engine/scenarioDataContext'

interface NavbarProps {
  activeTab: 'overview' | 'state' | 'planner' | 'pharmacy' | 'queue' | 'audit' | 'method'
  setActiveTab: (tab: 'overview' | 'state' | 'planner' | 'pharmacy' | 'queue' | 'audit' | 'method') => void
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
  const {
    userRole,
    setUserRole,
    selectedDistrictFilter,
    setSelectedDistrictFilter,
    districts,
    isChainValid,
    logAction,
  } = useScenarioData()

  return (
    <header className="bg-[#f7f4ed]/95 backdrop-blur-md border-b border-[#eceae4] sticky top-0 z-50">
      {/* Top Quiet Institutional Strip */}
      <div className="bg-[#f7f4ed] border-b border-slate-100 px-4 py-1 text-[12px] text-[#5f5f5d] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-medium text-[#1c1c1c]">Government of Assam · National Health Mission (NHM)</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[#5f5f5d]">
          <span className="flex items-center gap-1 text-[12px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mental Healthcare Act &amp; Privacy Compliant</span>
          </span>
          <span className="hidden sm:inline text-slate-300">|</span>

          {/* RBAC Role selector */}
          <div className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-[#5f5f5d]" />
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[#5f5f5d]">Role:</span>
            <select
              value={userRole}
              onChange={(e) => {
                const newRole = e.target.value as typeof userRole
                setUserRole(newRole)
                logAction('ROLE_SWITCH', `Switched user role context to ${newRole}`)
              }}
              className="bg-[#f7f4ed] border border-[#eceae4] rounded px-1.5 py-0.5 text-[12px] font-semibold text-[#1c1c1c] focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="State Director">State Director</option>
              <option value="District Officer">District Officer</option>
              <option value="Counsellor">Counsellor</option>
            </select>
          </div>

          <span className="hidden sm:inline text-slate-300">|</span>

          {/* District filter */}
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-[#5f5f5d]" />
            <select
              value={selectedDistrictFilter}
              onChange={(e) => setSelectedDistrictFilter(e.target.value)}
              className="bg-[#f7f4ed] border border-[#eceae4] rounded px-1.5 py-0.5 text-[12px] font-semibold text-[#1c1c1c] focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="All Districts">All Districts</option>
              {districts.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <span className="hidden sm:inline text-slate-300">|</span>

          {/* SHA-256 chain status */}
          <span className={`flex items-center gap-1 text-[12px] font-mono font-semibold ${isChainValid ? 'text-emerald-700' : 'text-rose-700'}`}>
            <span className={`w-2 h-2 rounded-full ${isChainValid ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            SHA-256 {isChainValid ? 'OK' : 'BROKEN'}
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1c1c1c] text-[#fcfbf8] flex items-center justify-center  shrink-0">
            <HeartHandshake className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-[#1c1c1c] tracking-tight">
                Mental Health Care Navigator
              </h1>
              <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                Decision Support
              </span>
            </div>
            <p className="text-xs text-[#5f5f5d] hidden sm:block">
              Spot distress early · Send mobile clinic vans fairly · Follow up with callers
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          {/* 4 Tabs */}
          <nav className="grid grid-cols-4 sm:flex items-center gap-1 bg-[rgba(28,28,28,0.04)] p-1 rounded-xl border border-[#eceae4]/60">
            <button
              onClick={() => setActiveTab('state')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'state'
                  ? 'bg-[#f7f4ed] text-[#1c1c1c]  font-bold'
                  : 'text-[#5f5f5d] hover:text-[#1c1c1c]'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span>State</span>
            </button>
            <button
              onClick={() => setActiveTab('planner')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'planner'
                  ? 'bg-[#f7f4ed] text-[#1c1c1c]  font-bold'
                  : 'text-[#5f5f5d] hover:text-[#1c1c1c]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Planner</span>
            </button>
            <button
              onClick={() => setActiveTab('queue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'queue'
                  ? 'bg-[#f7f4ed] text-[#1c1c1c]  font-bold'
                  : 'text-[#5f5f5d] hover:text-[#1c1c1c]'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5 text-rose-600" />
              <span>Queue</span>
              {stalledCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[12px] bg-rose-100 text-rose-800 font-bold">
                  {stalledCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('pharmacy')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'pharmacy'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Pharmacy</span>
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-[#f7f4ed] text-[#1c1c1c]  font-bold'
                  : 'text-[#5f5f5d] hover:text-[#1c1c1c]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Audit</span>
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsEditMode((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1 cursor-pointer ${
                isEditMode
                  ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
                  : 'bg-[#f7f4ed] text-[#1c1c1c] border-[#eceae4] hover:bg-[rgba(28,28,28,0.04)]'
              }`}
            >
              <Edit3 className="w-3 h-3 text-amber-700" />
              <span>Scenario</span>
            </button>
            <button
              onClick={resetToDefaults}
              title="Reset all parameters to baseline state"
              className="p-1.5 rounded-xl bg-[#f7f4ed] text-[#5f5f5d] hover:text-[#1c1c1c] border border-[#eceae4] transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Operator banner when Edit Mode is active */}
      {isEditMode && (
        <div className="bg-amber-50 border-t border-b border-amber-200 px-4 py-1.5 text-[12px] text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-3.5 h-3.5 text-amber-700" />
            <span>
              <strong>Scenario Testing Mode:</strong> District estimates, block factors, and facility capacities are unlocked.
            </span>
          </div>
          <button
            onClick={() => setIsEditMode(false)}
            className="font-semibold text-amber-900 hover:text-amber-700 underline cursor-pointer"
          >
            Exit Mode
          </button>
        </div>
      )}
    </header>
  )
}
