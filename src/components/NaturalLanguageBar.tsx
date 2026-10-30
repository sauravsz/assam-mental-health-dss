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

const PRESET_COMMANDS = [
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
    <div className="bg-[#efe9de] border border-[#e6dfd8] rounded-xl p-5 sm:p-6 mb-8 transition-all">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#faf9f5] border border-[#e6dfd8] text-[#cc785c] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-lg sm:text-xl font-normal text-[#141413] font-serif-claude tracking-tight">
            Conversational Scenario Controller
          </h2>
        </div>
        <span className="text-xs text-[#8e8b82] hidden sm:inline">
          Natural Language Engine · Sub-25ms Simplex
        </span>
      </div>

      <p className="text-sm text-[#6c6a64] mb-4 leading-relaxed">
        Describe changes in conversational language. The algorithm identifies your intention, adjusts district or village parameters, and solves the Two-Phase Transportation Linear Program in real-time.
      </p>

      {/* Input Box Styled as Claude Prompt Input */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. 'Severe floods hit Katigorah', 'Set vans to 3', 'Dima Hasao calls jump to 80', 'Reset'..."
          className="w-full bg-[#faf9f5] border border-[#e6dfd8] focus:border-[#cc785c] rounded-lg pl-4 pr-24 py-3 text-sm text-[#141413] placeholder:text-[#8e8b82] focus:outline-none focus:ring-2 focus:ring-[#cc785c]/15 transition-all"
        />

        <div className="absolute right-1.5 flex items-center gap-1.5">
          {prompt.trim() && (
            <button
              type="button"
              onClick={() => setPrompt('')}
              className="text-[#8e8b82] hover:text-[#141413] text-xs px-2 py-1"
            >
              Clear
            </button>
          )}

          {/* Claude Signature Coral CTA Button */}
          <button
            type="submit"
            className="bg-[#cc785c] hover:bg-[#a9583e] active:bg-[#a9583e] text-white font-medium px-4 py-2 rounded-md text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <span>Run</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </form>

      {/* Result Card */}
      {result && (
        <div
          className={`mt-4 p-3.5 rounded-lg text-xs flex items-start justify-between gap-2 border transition-all ${
            result.success
              ? 'bg-[#faf9f5] border-[#5db872]/60 text-[#141413]'
              : 'bg-[#faf9f5] border-[#e8a55a]/60 text-[#141413]'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {result.success ? (
              <CheckCircle2 className="w-4 h-4 text-[#5db872] shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#e8a55a] shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-semibold text-[#141413]">
                {result.success ? 'Scenario Adjusted:' : 'Advisory:'}
              </span>{' '}
              <span className="text-[#3d3d3a]">{result.feedback}</span>
            </div>
          </div>
          <button
            onClick={() => setResult(null)}
            className="text-[#8e8b82] hover:text-[#141413] text-xs font-bold px-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Suggestion Chips */}
      <div className="mt-4 pt-3.5 border-t border-[#e6dfd8] flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-[#6c6a64] mr-1">Suggestions:</span>
        {PRESET_COMMANDS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleRunCommand(item)}
            className="text-xs bg-[#faf9f5] hover:bg-[#f5f0e8] text-[#3d3d3a] hover:text-[#141413] px-3 py-1 rounded-md border border-[#e6dfd8] transition-all cursor-pointer"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  )
}
