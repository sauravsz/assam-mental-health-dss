import { useState } from 'react'
import { Sparkles, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import { parseNaturalLanguageCommand, type ParsedCommandResult } from '../engine/commandParser'
import type { Block, Facility } from '../engine/types'
import type { RawDistrictData } from '../engine/scenarioDataContext'

interface NaturalLanguageBarProps {
  blocks: Block[]
  facilities: Facility[]
  rawDistricts: RawDistrictData[]
  setActiveTab: (tab: 'state' | 'planner' | 'queue') => void
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
}

const PRESET_PROMPTS = [
  'Severe flood hits Katigorah to 2.5x',
  'We received an extra van, set vans to 3',
  'Outbreak in Dima Hasao, set calls to 80',
  'Katigorah ran out of Fluoxetine',
  'Increase Silchar capacity to 150',
  'Reset everything to benchmark',
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
}: NaturalLanguageBarProps) => {
  const [prompt, setPrompt] = useState<string>('')
  const [result, setResult] = useState<ParsedCommandResult | null>(null)

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

  return (
    <div className="bg-[#f7f4ed] border border-[#eceae4]/90 rounded-2xl p-4 sm:p-5  transition-all mb-6">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-xs sm:text-sm font-bold text-[#1c1c1c] tracking-tight">
            AI Scenario Controller · Speak or Type in Plain English
          </h2>
        </div>
        <span className="text-[12px] text-[#5f5f5d] hidden sm:inline font-medium">
          Instant Client-Side Natural Language Engine
        </span>
      </div>

      <p className="text-xs text-[#5f5f5d] mb-3 leading-relaxed">
        Say what changed in plain words. The algorithm interprets your intent, adjusts the data parameters, and re-runs the mathematical optimization live.
      </p>

      {/* Main Command Input Box */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. 'Severe floods hit Katigorah', 'Set vans to 3', 'Dima Hasao calls jump to 80', 'Reset'..."
          className="w-full bg-[#f7f4ed]/80 border border-slate-300/80 focus:border-blue-500 rounded-xl px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-[#1c1c1c] placeholder:text-[#5f5f5d] focus:outline-none focus:ring-3 focus:ring-blue-500/10 transition-all pr-24"
        />

        <div className="absolute right-1.5 flex items-center gap-1">
          {prompt.trim() && (
            <button
              type="button"
              onClick={() => setPrompt('')}
              className="text-[#5f5f5d] hover:text-[#5f5f5d] text-xs px-1.5 py-1"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            className="bg-[#1c1c1c] hover:bg-slate-800 text-[#fcfbf8] font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
          >
            <span>Run</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </form>

      {/* Result / Feedback Banner */}
      {result && (
        <div
          className={`mt-3 p-3 rounded-xl text-xs flex items-start justify-between gap-2 transition-all ${
            result.success
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-start gap-2">
            {result.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-semibold">{result.success ? 'Scenario Updated:' : 'Tip:'}</span>{' '}
              <span>{result.feedback}</span>
            </div>
          </div>
          <button
            onClick={() => setResult(null)}
            className="text-[#5f5f5d] hover:text-[#5f5f5d] text-xs font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Quick Suggestion Pills */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
        <span className="text-[12px] font-semibold text-[#5f5f5d] mr-1">Try asking:</span>
        {PRESET_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleRunCommand(p)}
            className="text-[12px] bg-[rgba(28,28,28,0.04)]/80 hover:bg-slate-200 text-[#1c1c1c] hover:text-[#1c1c1c] px-2.5 py-1 rounded-lg border border-[#eceae4]/60 transition-all cursor-pointer truncate max-w-full"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  )
}
