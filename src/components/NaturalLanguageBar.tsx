import { useState } from 'react'
import { Sparkles, ArrowRight, AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'
import { parseNaturalLanguageCommand, type ParsedCommandResult } from '../engine/commandParser'
import type { Block, Facility } from '../engine/types'
import type { RawDistrictData } from '../engine/scenarioDataContext'

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
}: NaturalLanguageBarProps) => {
  const [prompt, setPrompt] = useState<string>('')
  const [result, setResult] = useState<ParsedCommandResult | null>(null)
  const [showPresets, setShowPresets] = useState<boolean>(false)

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
    <div className="bg-[#f7f4ed] border border-[#eceae4] rounded-xl p-2.5 sm:p-3 transition-all mb-5">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1 flex items-center">
          <Sparkles className="w-4 h-4 text-blue-600 absolute left-3 shrink-0 pointer-events-none" />
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Command Scenario: e.g. 'Flood Katigorah to 2.5x', 'Set vans to 3', 'Dima Hasao calls 80'..."
            className="w-full bg-[#fcfbf8] border border-[#eceae4] focus:border-blue-500 rounded-lg pl-9 pr-14 py-1.5 text-xs text-[#1c1c1c] placeholder:text-[#5f5f5d] focus:outline-none transition-all"
          />
          {prompt.trim() && (
            <button
              type="button"
              onClick={() => setPrompt('')}
              className="absolute right-2 text-[#5f5f5d] hover:text-[#1c1c1c] text-xs px-1 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 justify-end">
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="text-[11px] font-semibold text-[#5f5f5d] hover:text-[#1c1c1c] px-2 py-1.5 rounded-lg border border-[#eceae4] hover:bg-[rgba(28,28,28,0.04)] transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>Examples</span>
            {showPresets ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            type="submit"
            className="bg-[#1c1c1c] hover:bg-slate-800 text-[#fcfbf8] font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer"
          >
            <span>Run</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </form>

      {/* Result Alert Pill */}
      {result && (
        <div
          className={`mt-2 p-2 rounded-lg text-xs flex items-center justify-between gap-2 transition-all ${
            result.success
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-1.5">
            {result.success ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            )}
            <span><strong>{result.success ? 'Scenario Adjusted:' : 'Notice:'}</strong> {result.feedback}</span>
          </div>
          <button
            onClick={() => setResult(null)}
            className="text-[#5f5f5d] hover:text-[#1c1c1c] text-xs font-bold px-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Collapsible Suggestion Pills */}
      {showPresets && (
        <div className="mt-2.5 pt-2 border-t border-[#eceae4] flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-[#5f5f5d] mr-1">Quick Scenarios:</span>
          {PRESET_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                handleRunCommand(p)
                setShowPresets(false)
              }}
              className="text-[11px] bg-[rgba(28,28,28,0.04)] hover:bg-slate-200 text-[#1c1c1c] px-2 py-0.5 rounded border border-[#eceae4] transition-all cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
