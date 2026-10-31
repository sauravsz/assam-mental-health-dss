import { useState } from 'react'
import { Search, CornerDownLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import { parseNaturalLanguageCommand, type ParsedCommandResult, type DssTab } from '../engine/commandParser'
import type { Block, Facility } from '../engine/types'
import type { RawDistrictData } from '../engine/scenarioDataContext'

interface NaturalLanguageBarProps {
  blocks: Block[]
  facilities: Facility[]
  rawDistricts: RawDistrictData[]
  setActiveTab: (tab: DssTab) => void
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

const PRESETS = [
  'Flood Katigorah to 2.5x',
  'Set vans to 3',
  'Outbreak in Dima Hasao, set calls to 80',
  'Katigorah ran out of Fluoxetine',
  'Reset defaults',
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

  const handleRun = (text: string) => {
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
    if (res.success) setPrompt('')
  }

  return (
    <div className="mb-4">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (prompt.trim()) handleRun(prompt)
        }}
        className="flex items-center gap-2 bg-[var(--panel)] border border-[var(--line)] rounded p-1.5 focus-within:border-[var(--river)] shadow-2xs"
      >
        <Search className="w-4 h-4 text-[var(--mut)] ml-2 shrink-0" />
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='Type instruction in plain words (e.g. "Flood Katigorah to 2.5x", "Set vans to 3", "Reset")...'
          className="w-full bg-transparent border-0 text-[14px] text-[var(--ink)] placeholder:text-[var(--mut)] focus:outline-none px-2"
        />
        <button
          type="submit"
          className="bg-[var(--river)] text-white font-medium text-[13px] px-3 py-1.5 rounded flex items-center gap-1 shrink-0 cursor-pointer hover:opacity-90"
        >
          <span>Run</span>
          <CornerDownLeft className="w-3.5 h-3.5 opacity-80" />
        </button>
      </form>

      {/* 1-Line Status Feedback */}
      {result && (
        <div
          className={`mt-2 px-3 py-1.5 rounded text-[13px] flex items-center justify-between border ${
            result.success
              ? 'bg-[var(--panel)] border-[var(--ok)] text-[var(--ok)]'
              : 'bg-[var(--panel)] border-[var(--alert)] text-[var(--alert)]'
          }`}
        >
          <div className="flex items-center gap-2">
            {result.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{result.feedback}</span>
          </div>
          <button onClick={() => setResult(null)} className="text-[var(--mut)] hover:text-[var(--ink)] text-xs ml-2 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Clean Presets */}
      <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[12px] text-[var(--mut)]">
        <span>Quick:</span>
        {PRESETS.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleRun(p)}
            className="bg-[var(--panel)] border border-[var(--line)] text-[var(--ink)] hover:border-[var(--river)] px-2 py-0.5 rounded cursor-pointer transition-colors"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  )
}
