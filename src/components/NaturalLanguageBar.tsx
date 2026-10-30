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
    <div className="bg-[#144837]/90 border border-[#B87333]/70 rounded-lg p-4 sm:p-5 shadow-[0_2px_14px_rgba(0,0,0,0.3)] transition-all mb-6 relative overflow-hidden font-sans-tech">
      {/* Decorative PCB Corner Solder Pads */}
      <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-[#B87333]"></div>
      <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#B87333]"></div>
      <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-[#B87333]"></div>
      <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#B87333]"></div>

      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#09231A] text-[#FFD700] border border-[#B87333]/60 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-xs sm:text-sm font-bold text-[#EAD0AC] font-serif-display tracking-wide">
            Natural Language Copilot · Command Interface
          </h2>
        </div>
        <span className="text-[10px] text-[#C2AB8E] font-mono hidden sm:inline">
          PROTOCOL: CLIENT_INTENT_PARSER // &lt;25ms
        </span>
      </div>

      <p className="text-xs text-[#C2AB8E] mb-3 leading-relaxed">
        Speak or type operational instructions in natural English. The parser adjusts simulation parameters and triggers real-time mathematical re-routing.
      </p>

      {/* Main Command Input Box */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. 'Severe floods hit Katigorah', 'Set vans to 3', 'Dima Hasao calls jump to 80', 'Reset'..."
          className="w-full bg-[#09231A] border border-[#B87333]/80 focus:border-[#FFD700] rounded-md px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-[#EAD0AC] placeholder:text-[#C2AB8E]/50 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/30 transition-all pr-24 font-sans-tech"
        />

        <div className="absolute right-1.5 flex items-center gap-1">
          {prompt.trim() && (
            <button
              type="button"
              onClick={() => setPrompt('')}
              className="text-[#C2AB8E] hover:text-[#FFD700] text-xs px-1.5 py-1"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            className="bg-[#D98C53] hover:bg-[#B87333] text-[#09231A] font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <span>Execute</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </form>

      {/* Result / Feedback Banner */}
      {result && (
        <div
          className={`mt-3 p-3 rounded-md text-xs flex items-start justify-between gap-2 border transition-all ${
            result.success
              ? 'bg-[#165B45] border-[#FFD700] text-[#EAD0AC]'
              : 'bg-[#09231A] border-[#D98C53] text-[#EAD0AC]'
          }`}
        >
          <div className="flex items-start gap-2">
            {result.success ? (
              <CheckCircle2 className="w-4 h-4 text-[#FFD700] shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#D98C53] shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold text-[#FFD700]">{result.success ? 'Bus Updated:' : 'Advisory:'}</span>{' '}
              <span>{result.feedback}</span>
            </div>
          </div>
          <button
            onClick={() => setResult(null)}
            className="text-[#C2AB8E] hover:text-[#FFD700] text-xs font-bold px-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Quick Suggestion Pills */}
      <div className="mt-3 pt-3 border-t border-[#B87333]/30 flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-semibold text-[#B87333] mr-1">Command Presets:</span>
        {PRESET_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleRunCommand(p)}
            className="text-[11px] bg-[#09231A] hover:bg-[#1A5944] text-[#EAD0AC] hover:text-[#FFD700] px-2.5 py-1 rounded border border-[#B87333]/50 transition-all cursor-pointer truncate max-w-full"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  )
}
