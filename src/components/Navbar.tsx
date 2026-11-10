import { Activity, ShieldCheck, MapPin, HeartHandshake, Edit3, RotateCcw, Lock, LayoutDashboard, Pill, BookOpen, Sun, Moon } from 'lucide-react'
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
    theme,
    toggleTheme,
  } = useScenarioData()

  return (
    <header className="bg-paper/95 backdrop-blur-md border-b border-hairline sticky top-0 z-50">
      {/* Top Quiet Institutional Strip */}
      <div className="bg-container border-b border-hairline px-4 py-1 text-[12px] text-muted flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-medium text-charcoal">Government of Assam · National Health Mission (NHM)</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-muted">
          <span className="flex items-center gap-1 text-[12px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>MHCA 2017 &amp; DPDP 2023 Compliant</span>
          </span>
          <span className="hidden sm:inline text-hairline">|</span>

          {/* RBAC Role selector */}
          <div className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-muted" />
            <span className="text-[12px] font-semibold uppercase tracking-wider text-muted">Role:</span>
            <select
              value={userRole}
              onChange={(e) => {
                const newRole = e.target.value as typeof userRole
                setUserRole(newRole)
                logAction('ROLE_SWITCH', `Switched user role context to ${newRole}`)
              }}
              className="bg-card border border-hairline rounded px-1.5 py-0.5 text-[12px] font-semibold text-charcoal focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="State Director">State Director</option>
              <option value="District Officer">District Officer</option>
              <option value="Counsellor">Counsellor</option>
            </select>
          </div>

          <span className="hidden sm:inline text-hairline">|</span>

          {/* District filter */}
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-muted" />
            <select
              value={selectedDistrictFilter}
              onChange={(e) => setSelectedDistrictFilter(e.target.value)}
              className="bg-card border border-hairline rounded px-1.5 py-0.5 text-[12px] font-semibold text-charcoal focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All Districts">All Districts</option>
              {districts.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <span className="hidden sm:inline text-hairline">|</span>

          {/* SHA-256 chain status */}
          <span className={`flex items-center gap-1 text-[12px] font-mono font-semibold ${isChainValid ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
            <span className={`w-2 h-2 rounded-full ${isChainValid ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            SHA-256 {isChainValid ? 'OK' : 'BROKEN'}
          </span>

          <span className="hidden sm:inline text-hairline">|</span>

          {/* Android Material 3 Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode (Android M3)`}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-card hover:bg-hairline text-charcoal border border-hairline transition-colors cursor-pointer text-[12px] font-medium"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <button
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-3 text-left cursor-pointer group focus:outline-none"
          title="Return to Executive Overview"
        >
          <div className="w-8 h-8 rounded-lg bg-charcoal text-paper flex items-center justify-center shrink-0">
            <HeartHandshake className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-charcoal tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Assam Mental Health DSS
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.2 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                NHM Tele-MANAS
              </span>
            </div>
            <p className="text-[11px] text-muted">
              Decision Support for Earlier Identification &amp; Care Planning
            </p>
          </div>
        </button>

        {/* Right side controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Navigation Tabs */}
          <nav className="flex flex-wrap items-center gap-1 bg-container p-1 rounded-xl border border-hairline text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-card text-charcoal font-bold shadow-2xs'
                  : 'text-muted hover:text-charcoal'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('state')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'state'
                  ? 'bg-card text-charcoal font-bold shadow-2xs'
                  : 'text-muted hover:text-charcoal'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Surveillance</span>
            </button>

            <button
              onClick={() => setActiveTab('planner')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'planner'
                  ? 'bg-card text-charcoal font-bold shadow-2xs'
                  : 'text-muted hover:text-charcoal'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Van Siting</span>
            </button>

            <button
              onClick={() => setActiveTab('pharmacy')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'pharmacy'
                  ? 'bg-card text-charcoal font-bold shadow-2xs'
                  : 'text-muted hover:text-charcoal'
              }`}
            >
              <Pill className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Pharmacy</span>
            </button>

            <button
              onClick={() => setActiveTab('queue')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'queue'
                  ? 'bg-card text-charcoal font-bold shadow-2xs'
                  : 'text-muted hover:text-charcoal'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Retention</span>
              {stalledCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 font-bold">
                  {stalledCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-card text-charcoal font-bold shadow-2xs'
                  : 'text-muted hover:text-charcoal'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Audit</span>
            </button>

            <button
              onClick={() => setActiveTab('method')}
              className={`px-2 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'method'
                  ? 'bg-card text-charcoal font-bold shadow-2xs'
                  : 'text-muted hover:text-charcoal'
              }`}
              title="Methodology, Math Formulas & Statutory Standards"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden sm:inline">Method</span>
            </button>
          </nav>

          {/* Scenario & Reset Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsEditMode((prev) => !prev)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1 cursor-pointer ${
                isEditMode
                  ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700 font-bold'
                  : 'bg-card text-charcoal border-hairline hover:bg-container'
              }`}
              title="Toggle scenario parameter editing mode"
            >
              <Edit3 className="w-3 h-3 text-amber-700 dark:text-amber-400" />
              <span className="hidden sm:inline">Scenario</span>
            </button>
            <button
              onClick={resetToDefaults}
              title="Reset all parameters to benchmark baseline"
              className="p-1.5 rounded-xl bg-card text-muted hover:text-charcoal border border-hairline transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Operator banner when Edit Mode is active */}
      {isEditMode && (
        <div className="bg-amber-50 dark:bg-amber-950/60 border-t border-b border-amber-200 dark:border-amber-800/80 px-4 py-1.5 text-[12px] text-amber-900 dark:text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span>
              <strong>Scenario Simulation Mode Active:</strong> District estimates, block parameters, and facility capacities are unlocked.
            </span>
          </div>
          <button
            onClick={() => setIsEditMode(false)}
            className="font-semibold text-amber-900 dark:text-amber-300 hover:underline cursor-pointer"
          >
            Exit Simulation
          </button>
        </div>
      )}
    </header>
  )
}
