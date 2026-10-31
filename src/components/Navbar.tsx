import type { DssTab } from '../engine/commandParser'
import { RotateCcw, Edit3 } from 'lucide-react'

interface NavbarProps {
  activeTab: DssTab
  setActiveTab: (tab: DssTab) => void
  stalledCount: number
  isEditMode: boolean
  setIsEditMode: (val: boolean | ((prev: boolean) => boolean)) => void
  resetToDefaults: () => void
}

const TABS: { id: DssTab; label: string }[] = [
  { id: 'ov', label: 'Overview' },
  { id: 'surv', label: 'Surveillance' },
  { id: 'res', label: 'Camp Siting' },
  { id: 'med', label: 'Medicine & Logistics' },
  { id: 'que', label: 'Follow-up Queue' },
]

export const Navbar = ({
  activeTab,
  setActiveTab,
  stalledCount,
  isEditMode,
  setIsEditMode,
  resetToDefaults,
}: NavbarProps) => {
  return (
    <header className="mb-4">
      {/* Top Header Row matching dss-1 .top */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <h1 className="text-[24px] sm:text-[26px] font-semibold text-[var(--ink)] font-serif-fraunces tracking-tight m-0 flex items-center gap-2 flex-wrap">
            Mental Health Decision Support
            <span className="text-[12px] font-normal border border-[var(--tea)] text-[var(--tea)] px-2 py-0.2 rounded font-sans">
              synthetic data
            </span>
          </h1>
          <p className="text-[13px] text-[var(--mut)] m-0 mt-0.5">
            Government of Assam · National Health Mission (NHM) · Cachar &amp; Kamrup Metro
          </p>
        </div>

        {/* Right side quick actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto text-[13px]">
          <button
            onClick={() => setIsEditMode((prev) => !prev)}
            className={`px-2.5 py-1 rounded border text-[13px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              isEditMode
                ? 'bg-[var(--tea)] text-white border-[var(--tea)]'
                : 'bg-[var(--panel)] text-[var(--ink)] border-[var(--line)] hover:border-[var(--mut)]'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditMode ? 'Editing active' : 'Edit scenario'}</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Reset all values to official NHM Cachar defaults?')) {
                resetToDefaults()
              }
            }}
            className="p-1.5 rounded border border-[var(--line)] bg-[var(--panel)] text-[var(--mut)] hover:text-[var(--ink)] hover:border-[var(--mut)] cursor-pointer"
            title="Reset to NHM defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Clean horizontal border-bottom navigation matching dss-1 nav */}
      <nav className="flex items-center gap-1 border-b border-[var(--line)] overflow-x-auto text-[14px]">
        {TABS.map((tab) => {
          const isSelected = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-3.5 border-b-[3px] font-medium whitespace-nowrap cursor-pointer transition-colors ${
                isSelected
                  ? 'border-[var(--river)] text-[var(--ink)]'
                  : 'border-transparent text-[var(--mut)] hover:text-[var(--ink)]'
              }`}
            >
              <span>{tab.label}</span>
              {tab.id === 'que' && stalledCount > 0 && (
                <span className="ml-1.5 text-[11px] px-1.5 py-0.2 rounded-full bg-[var(--alert)] text-white font-mono font-bold">
                  {stalledCount}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* 1-Line Subtle Edit Banner */}
      {isEditMode && (
        <div className="bg-[var(--tea)]/10 border border-[var(--tea)]/30 rounded px-3 py-1 mt-2.5 text-[12.5px] text-[var(--ink)] flex items-center justify-between">
          <span>
            <b>Scenario editing enabled:</b> Click inputs or values to test flood shocks, van changes, or clinic capacities.
          </span>
          <button onClick={resetToDefaults} className="text-[var(--tea)] font-semibold hover:underline text-xs cursor-pointer">
            Reset
          </button>
        </div>
      )}
    </header>
  )
}
