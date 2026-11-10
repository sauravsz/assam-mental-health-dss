import { useState } from 'react'
import {
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Flame,
  Waves,
  Shield,
  FileText,
  Compass,
} from 'lucide-react'
import { parseNaturalLanguageCommand, type ParsedCommandResult } from '../engine/commandParser'
import type { Block, Facility } from '../engine/types'
import type { RawDistrictData } from '../engine/scenarioDataContext'
import { useScenarioData } from '../engine/scenarioDataContext'
import { SCENARIO_PRESETS, type ScenarioPresetId } from '../engine/scenarioPresets'

interface NaturalLanguageBarProps {
  blocks: Block[]
  facilities: Facility[]
  rawDistricts: RawDistrictData[]
  setActiveTab: (tab: 'overview' | 'state' | 'planner' | 'pharmacy' | 'queue' | 'audit' | 'method') => void
  updateBlock: (blockId: number, field: keyof Block, value: number) => void
  updateFacilityCapacity: (facId: number, capacity: number) => void
  updateMedicineStock: (
    facId: number,
    med: 'haloperidol' | 'fluoxetine' | 'valproate',
    status: 'Adequate' | 'Low Stock' | 'Critical'
  ) => void
  updateDistrictCalls: (districtId: string, calls: number) => void
  toggleDistrictFlood: (districtId: string) => void
  resetToDefaults: () => void
  setNumVans?: (n: number) => void
  onOpenTour?: () => void
  onOpenMemo?: () => void
}

const PRESET_PROMPTS = [
  'Severe flood hits Katigorah to 2.5x',
  'Set vans to 3',
  'Dima Hasao calls jump to 80',
  'Katigorah ran out of Fluoxetine',
  'Silchar capacity 150',
  'Reset everything',
]

export const NaturalLanguageBar = ({
  blocks,
  facilities,
  rawDistricts,
  setActiveTab,
  updateBlock,
  updateFacilityCapacity,
  updateMedicineStock,
  updateDistrictCalls,
  toggleDistrictFlood,
  resetToDefaults,
  setNumVans,
  onOpenTour,
  onOpenMemo,
}: NaturalLanguageBarProps) => {
  const [prompt, setPrompt] = useState<string>('')
  const [result, setResult] = useState<ParsedCommandResult | null>(null)
  const [showPresets, setShowPresets] = useState<boolean>(false)

  const { activePresetId, applyPresetScenario } = useScenarioData()

  const handleRunCommand = (text: string) => {
    const res = parseNaturalLanguageCommand(text, {
      blocks,
      facilities,
      rawDistricts,
      setActiveTab,
      updateBlock,
      updateFacilityCapacity,
      updateMedicineStock,
      updateDistrictCalls,
      toggleDistrictFlood,
      resetToDefaults,
      setNumVans,
    })
    setResult(res)
    if (res.success) {
      setPrompt('')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim()) {
      handleRunCommand(prompt)
    }
  }

  const handleApplyScenario = (presetId: ScenarioPresetId) => {
    const targetTab = applyPresetScenario(presetId)
    const preset = SCENARIO_PRESETS[presetId]
    if (targetTab) {
      setActiveTab(targetTab)
    }
    setResult({
      success: true,
      feedback: `Loaded ${preset.name}: ${preset.impactSummary}`,
    })
  }

  return (
    <div className="bg-card border border-hairline rounded-2xl p-3 sm:p-4 transition-all mb-6 shadow-xs space-y-3">
      {/* Top Bar: Prompt Input & Fast Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1 flex items-center">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute left-3 shrink-0 pointer-events-none" />
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Command DSS Scenario: e.g. 'Flood Katigorah to 2.5x', 'Set vans to 3', 'Dima Hasao calls 80'..."
              className="w-full bg-paper border border-hairline focus:border-blue-500 rounded-xl pl-9 pr-14 py-2 text-xs text-charcoal placeholder:text-muted focus:outline-none transition-all shadow-2xs"
            />
            {prompt.trim() && (
              <button
                type="button"
                onClick={() => setPrompt('')}
                className="absolute right-2 text-muted hover:text-charcoal text-xs px-1 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="text-[11px] font-semibold text-muted hover:text-charcoal px-2.5 py-2 rounded-xl border border-hairline hover:bg-container transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>Prompts</span>
              {showPresets ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-charcoal hover:bg-black text-paper font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <span>Run</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </form>

        {/* Evaluator & Memo Quick Launcher */}
        <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
          {onOpenTour && (
            <button
              type="button"
              onClick={onOpenTour}
              className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              title="Launch guided interactive tour for evaluators and jury"
            >
              <Compass className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Evaluator Tour</span>
            </button>
          )}

          {onOpenMemo && (
            <button
              type="button"
              onClick={onOpenMemo}
              className="px-3 py-2 rounded-xl bg-container hover:bg-hairline text-charcoal border border-hairline font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              title="Generate printable Government Decision Memo"
            >
              <FileText className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span>Export Memo</span>
            </button>
          )}
        </div>
      </div>

      {/* Preset Macro Scenarios Ribbon */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-hairline/60">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted shrink-0 mr-1">
          Macro Scenarios:
        </span>

        <button
          type="button"
          onClick={() => handleApplyScenario('baseline')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
            activePresetId === 'baseline'
              ? 'bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500 shadow-2xs'
              : 'bg-container hover:bg-hairline text-charcoal border-hairline'
          }`}
        >
          <Shield className="w-3 h-3" />
          <span>Post-Monsoon Baseline</span>
        </button>

        <button
          type="button"
          onClick={() => handleApplyScenario('barak_flood')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
            activePresetId === 'barak_flood'
              ? 'bg-rose-600 dark:bg-rose-500 text-white border-rose-600 dark:border-rose-500 shadow-2xs'
              : 'bg-rose-50/60 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-800 dark:text-rose-200 border-rose-200/60 dark:border-rose-900/60'
          }`}
          title="Katigorah 2.5x flood shock, Cachar Z=3.65, Fluoxetine shortage"
        >
          <Waves className="w-3 h-3 text-rose-600 dark:text-rose-400" />
          <span>Barak Valley Flood (Z=3.65)</span>
        </button>

        <button
          type="button"
          onClick={() => handleApplyScenario('brahmaputra_crisis')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
            activePresetId === 'brahmaputra_crisis'
              ? 'bg-teal-600 dark:bg-teal-500 text-white border-teal-600 dark:border-teal-500 shadow-2xs'
              : 'bg-teal-50/60 dark:bg-teal-950/40 hover:bg-teal-100 text-teal-800 dark:text-teal-200 border-teal-200/60 dark:border-teal-900/60'
          }`}
          title="Dhubri & Lakhimpur riverine surge, drug depletion"
        >
          <Waves className="w-3 h-3 text-teal-600 dark:text-teal-400" />
          <span>Brahmaputra Crisis (Z=2.92)</span>
        </button>

        <button
          type="button"
          onClick={() => handleApplyScenario('festival_surge')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
            activePresetId === 'festival_surge'
              ? 'bg-amber-600 dark:bg-amber-500 text-white border-amber-600 dark:border-amber-500 shadow-2xs'
              : 'bg-amber-50/60 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-200 border-amber-200/60 dark:border-amber-900/60'
          }`}
          title="Kamrup Metro (Z=3.84) & Dibrugarh urban anxiety surge"
        >
          <Flame className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          <span>Festival Surge (Z=3.84)</span>
        </button>
      </div>

      {/* Result Alert Pill */}
      {result && (
        <div
          className={`p-2.5 rounded-xl text-xs flex items-center justify-between gap-2 transition-all ${
            result.success
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            )}
            <span>
              <strong>{result.success ? 'Scenario Adjusted:' : 'Notice:'}</strong> {result.feedback}
            </span>
          </div>
          <button
            onClick={() => setResult(null)}
            className="text-muted hover:text-charcoal text-xs font-bold px-1.5 py-0.5 rounded hover:bg-hairline cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Collapsible NLP Suggestion Pills */}
      {showPresets && (
        <div className="pt-2 border-t border-hairline flex flex-wrap items-center gap-1.5 animate-fade-in">
          <span className="text-[11px] font-semibold text-muted mr-1">NLP Prompt Syntax:</span>
          {PRESET_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                handleRunCommand(p)
                setShowPresets(false)
              }}
              className="text-[11px] bg-container hover:bg-hairline text-charcoal px-2.5 py-1 rounded-md border border-hairline transition-all cursor-pointer font-mono"
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
