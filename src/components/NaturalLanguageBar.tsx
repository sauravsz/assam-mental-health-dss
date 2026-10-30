import { useState } from 'react'
import { Search, CornerDownLeft, AlertCircle, CheckCircle2 } from 'lucide-react'
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
  { label: 'Flood Katigorah 2.5x', cmd: 'Severe flood hits Katigorah to 2.5x', tag: 'Disaster' },
  { label: 'Deploy 3 Mobile Vans', cmd: 'We received an extra van, set vans to 3', tag: 'Fleet' },
  { label: 'Dima Hasao 80 Calls', cmd: 'Outbreak in Dima Hasao, set calls to 80', tag: 'Surveillance' },
  { label: 'Katigorah Fluoxetine Depleted', cmd: 'Katigorah ran out of Fluoxetine', tag: 'Pharmacy' },
  { label: 'Reset Benchmark', cmd: 'Reset everything to benchmark', tag: 'System' },
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
    <div className="bg-[#0d0d0d] border border-[#242728] rounded-xl overflow-hidden mb-6 shadow-2xl">
      {/* Top Command Palette Header Bar */}
      <div className="bg-[#0a0a0c] px-4 py-2.5 border-b border-[#242728] flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* macOS traffic light dots */}
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#242728] border border-white/5"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#242728] border border-white/5"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#242728] border border-white/5"></span>
          </div>
          <span className="text-xs font-medium text-[#f4f4f6]">
            Raycast Scenario Palette
          </span>
          <span className="text-[11px] text-[#6a6b6c]">/</span>
          <span className="text-[11px] text-[#9c9c9d] hidden sm:inline">
            Direct Natural Language Intent Bus
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-[#9c9c9d]">
          <span className="keycap px-1.5 py-0.5 rounded text-[10px] text-[#cdcdcd] font-mono">
            ⌘ K
          </span>
          <span className="hidden sm:inline text-[#6a6b6c]">to focus</span>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {/* Command Search Input */}
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <Search className="w-4 h-4 text-[#6a6b6c] absolute left-3.5 pointer-events-none" />

          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type in plain English (e.g. 'Flood Katigorah 2.5x', 'Set vans to 3', 'Dima Hasao calls 80', 'Reset')..."
            className="w-full bg-[#101111] border border-[#242728] focus:border-white/20 rounded-lg pl-10 pr-24 py-2.5 text-xs sm:text-sm text-[#f4f4f6] placeholder:text-[#6a6b6c] focus:outline-none transition-colors"
          />

          <div className="absolute right-1.5 flex items-center gap-1.5">
            {prompt.trim() && (
              <button
                type="button"
                onClick={() => setPrompt('')}
                className="text-[#6a6b6c] hover:text-[#cdcdcd] text-xs px-1.5 py-1"
              >
                Clear
              </button>
            )}

            {/* White Raycast Primary Pill */}
            <button
              type="submit"
              className="bg-[#ffffff] hover:bg-[#e8e8e8] text-[#000000] font-medium px-3 py-1.5 rounded-md text-xs flex items-center gap-1 transition-all cursor-pointer"
            >
              <span>Execute</span>
              <CornerDownLeft className="w-3 h-3 text-black/60" />
            </button>
          </div>
        </form>

        {/* Output Feedback Card */}
        {result && (
          <div
            className={`mt-3 p-3 rounded-lg text-xs flex items-start justify-between gap-2 border ${
              result.success
                ? 'bg-[#101111] border-[#59d499]/40 text-[#f4f4f6]'
                : 'bg-[#101111] border-[#ff6161]/40 text-[#f4f4f6]'
            }`}
          >
            <div className="flex items-start gap-2">
              {result.success ? (
                <CheckCircle2 className="w-4 h-4 text-[#59d499] shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-[#ff6161] shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-semibold text-white">
                  {result.success ? 'Command Executed:' : 'Parse Notice:'}
                </span>{' '}
                <span className="text-[#cdcdcd]">{result.feedback}</span>
              </div>
            </div>
            <button
              onClick={() => setResult(null)}
              className="text-[#6a6b6c] hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Quick Command Suggestions */}
        <div className="mt-3.5 pt-3 border-t border-[#242728] flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-[#6a6b6c] mr-1">Suggestions:</span>
          {PRESET_COMMANDS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleRunCommand(item.cmd)}
              className="text-[11px] bg-[#101111] hover:bg-[#18191a] text-[#cdcdcd] hover:text-white px-2.5 py-1 rounded-md border border-[#242728] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>{item.label}</span>
              <span className="keycap px-1 py-0.2 rounded text-[9px] text-[#6a6b6c]">
                {item.tag}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
