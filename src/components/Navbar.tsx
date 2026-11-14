import { Activity, ShieldCheck, MapPin, HeartHandshake, Edit3, RotateCcw, Lock, LayoutDashboard, Pill, BookOpen, Compass, FileText, Sun, Moon } from 'lucide-react'
import { useScenarioData } from '../engine/scenarioDataContext'

type Tab = 'overview' | 'state' | 'planner' | 'pharmacy' | 'queue' | 'audit' | 'method'

interface NavbarProps {
  activeTab: Tab
  setActiveTab: (tab: Tab) => void
  stalledCount: number
  isEditMode: boolean
  setIsEditMode: (val: boolean | ((prev: boolean) => boolean)) => void
  resetToDefaults: () => void
  onOpenTour?: () => void
  onOpenMemo?: () => void
}

const TABS: { id: Tab; label: string; icon: typeof Activity; title?: string }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'state', label: 'Surveillance', icon: Activity },
  { id: 'planner', label: 'Van Siting', icon: MapPin },
  { id: 'pharmacy', label: 'Pharmacy', icon: Pill },
  { id: 'queue', label: 'Retention', icon: HeartHandshake },
  { id: 'audit', label: 'Audit', icon: ShieldCheck },
  { id: 'method', label: 'Method', icon: BookOpen, title: 'Methodology, Math Formulas & Statutory Standards' },
]

export const Navbar = ({
  activeTab,
  setActiveTab,
  stalledCount,
  isEditMode,
  setIsEditMode,
  resetToDefaults,
  onOpenTour,
  onOpenMemo,
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
    <header className="app-header">
      {/* Utility strip: jurisdiction, access context, integrity */}
      <div className="util-strip">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-charcoal">Government of Assam</span>
            <span className="hidden sm:inline">· National Health Mission</span>
          </div>

          <div className="chips flex flex-wrap items-center gap-2">
            <span className="hidden md:block">
              <span className="util-chip">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                MHCA 2017 &amp; DPDP 2023
              </span>
            </span>

            <label className="util-chip" title="Role-based access control">
              <Lock className="w-3 h-3 text-muted" />
              <span className="text-muted font-semibold">Role</span>
              <select
                value={userRole}
                onChange={(e) => {
                  const newRole = e.target.value as typeof userRole
                  setUserRole(newRole)
                  logAction('ROLE_SWITCH', `Switched user role context to ${newRole}`)
                }}
              >
                <option value="State Director">State Director</option>
                <option value="District Officer">District Officer</option>
                <option value="Counsellor">Counsellor</option>
              </select>
            </label>

            <label className="util-chip" title="District scope">
              <MapPin className="w-3 h-3 text-muted" />
              <select value={selectedDistrictFilter} onChange={(e) => setSelectedDistrictFilter(e.target.value)}>
                <option value="All Districts">All Districts</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>

            <span
              className={`util-chip font-mono ${isChainValid ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}
              title="Tamper-evident audit chain status"
            >
              <span className={`w-2 h-2 rounded-full ${isChainValid ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              SHA-256 {isChainValid ? 'OK' : 'BROKEN'}
            </span>

            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="util-chip"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-blue-600" />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main bar: brand, navigation, actions */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-x-4 gap-y-2.5">
        <button
          onClick={() => setActiveTab('overview')}
          className="order-1 flex items-center gap-3 text-left group"
          title="Return to Executive Overview"
        >
          <span className="brand-mark">
            <HeartHandshake className="w-5 h-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-[15px] font-extrabold tracking-tight text-charcoal whitespace-nowrap"><span className="sm:hidden">Assam MH-DSS</span><span className="hidden sm:inline">Assam Mental Health DSS</span></span>
            <span className="hidden 2xl:block text-[11.5px] text-muted whitespace-nowrap">Tele-MANAS decision support · earlier identification &amp; care planning</span>
          </span>
        </button>

        <nav className="nav-tabs order-3 w-full lg:w-auto lg:order-2 lg:mx-auto" aria-label="Primary">
          {TABS.map(({ id, label, icon: Icon, title }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              aria-current={activeTab === id ? 'page' : undefined}
              className="nav-tab"
              title={title}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              {id === 'queue' && stalledCount > 0 && <span className="nav-badge">{stalledCount}</span>}
            </button>
          ))}
        </nav>

        <div className="order-2 lg:order-3 ml-auto flex items-center gap-1.5 shrink-0">
          {onOpenTour && (
            <button onClick={onOpenTour} className="btn-tint" title="Launch guided interactive tour for evaluators and jury">
              <Compass className="w-4 h-4" />
              <span className="hidden 2xl:inline">Tour</span>
            </button>
          )}
          {onOpenMemo && (
            <button onClick={onOpenMemo} className="btn-soft" title="Generate printable Government Decision Memo">
              <FileText className="w-4 h-4 text-muted" />
              <span className="hidden 2xl:inline">Memo</span>
            </button>
          )}
          <button
            onClick={() => setIsEditMode((prev) => !prev)}
            className={`btn-soft ${isEditMode ? 'on' : ''}`}
            title="Toggle scenario parameter editing mode"
          >
            <Edit3 className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span className="hidden xl:inline">Scenario</span>
          </button>
          <button onClick={resetToDefaults} title="Reset all parameters to benchmark baseline" aria-label="Reset" className="btn-icon">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Operator banner when Edit Mode is active */}
      {isEditMode && (
        <div className="bg-amber-50 dark:bg-amber-950/60 border-t border-amber-200 dark:border-amber-800/80 py-2 text-[12px] text-amber-900 dark:text-amber-200">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Edit3 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
              <span>
                <strong>Scenario Simulation Mode Active:</strong> District estimates, block parameters, and facility capacities are unlocked.
              </span>
            </div>
            <button onClick={() => setIsEditMode(false)} className="font-bold text-amber-900 dark:text-amber-300 hover:underline whitespace-nowrap">
              Exit Simulation
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
