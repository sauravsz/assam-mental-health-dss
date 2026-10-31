import { useState, useMemo } from 'react'
import type { Block, Facility } from '../../engine/types'
import { TRAVEL_TIME_MATRIX } from '../../engine/cacharData'
import { solveCampAllocation } from '../../engine/solver'
import { Truck, Navigation, ChevronDown, ChevronUp, Sliders } from 'lucide-react'

interface CampSitingTabProps {
  blocks: Block[]
  facilities: Facility[]
  isEditMode: boolean
  updateBlock: (blockId: number, field: keyof Block, value: number) => void
  updateFacilityCapacity: (facId: number, capacity: number) => void
  numVans: number
  setNumVans: (n: number) => void
}

export const CampSitingTab = ({
  blocks,
  facilities,
  isEditMode,
  updateBlock,
  updateFacilityCapacity,
  numVans,
  setNumVans,
}: CampSitingTabProps) => {
  const [includeFloodWeight, setIncludeFloodWeight] = useState<boolean>(true)
  const [capacityMultiplier, setCapacityMultiplier] = useState<number>(1.0)
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false)
  const [showBlockEditor, setShowBlockEditor] = useState<boolean>(false)

  // Two-Phase Simplex LP Solver
  const result = useMemo(() => {
    return solveCampAllocation(
      blocks,
      facilities,
      TRAVEL_TIME_MATRIX,
      numVans,
      includeFloodWeight,
      capacityMultiplier
    )
  }, [blocks, facilities, numVans, includeFloodWeight, capacityMultiplier])

  const activeFacilities = facilities.filter((f) => result.activeFacilityIds.includes(f.id))
  const baselineFacilities = facilities.filter((f) => result.baselineActiveFacilityIds.includes(f.id))

  return (
    <div className="space-y-4">
      {/* Camp Siting Main Panel */}
      <div className="dss-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
          <h2 className="text-[19px] font-semibold text-[var(--ink)] font-serif-fraunces">
            Camp siting &amp; route optimization
          </h2>
          {isEditMode && (
            <button
              onClick={() => setShowBlockEditor(!showBlockEditor)}
              className="text-[12px] bg-[var(--panel)] border border-[var(--line)] hover:border-[var(--river)] px-2.5 py-1 rounded flex items-center gap-1.5 cursor-pointer text-[var(--ink)] self-start sm:self-auto"
            >
              <Sliders className="w-3.5 h-3.5 text-[var(--river)]" />
              <span>{showBlockEditor ? 'Hide Manual Sliders' : 'Manual Sliders (8 Blocks)'}</span>
            </button>
          )}
        </div>

        <p className="text-[13px] text-[var(--mut)] mb-3">
          A mixed-integer transportation program chooses camp locations and rural patient assignments together, mathematically minimizing patient travel impedance subject to intake ceilings and vehicle fleet capacity.
        </p>

        {/* Top Control Bar matching dss-1 .ctrl */}
        <div className="flex flex-wrap gap-5 items-end py-2.5 px-3 bg-[var(--line)]/20 rounded border border-[var(--line)] mb-4 text-[13px]">
          <label className="flex flex-col gap-1 text-[var(--mut)]">
            <span>Camps available (P): <b className="text-[var(--ink)] font-serif-fraunces text-[15px]">{numVans}</b></span>
            <input
              type="range"
              min="1"
              max="3"
              value={numVans}
              onChange={(e) => setNumVans(parseInt(e.target.value) || 2)}
              className="w-32 accent-[var(--river)] cursor-pointer"
            />
          </label>

          <label className="flex flex-col gap-1 text-[var(--mut)]">
            <span>Patients per camp: <b className="text-[var(--ink)] font-serif-fraunces text-[15px]">{Math.round(80 * capacityMultiplier)}</b></span>
            <input
              type="range"
              min="0.75"
              max="1.5"
              step="0.25"
              value={capacityMultiplier}
              onChange={(e) => setCapacityMultiplier(parseFloat(e.target.value))}
              className="w-36 accent-[var(--river)] cursor-pointer"
            />
          </label>

          <label className="flex items-center gap-2 cursor-pointer pb-1 text-[var(--ink)]">
            <input
              type="checkbox"
              checked={includeFloodWeight}
              onChange={(e) => setIncludeFloodWeight(e.target.checked)}
              className="w-4 h-4 accent-[var(--river)] rounded"
            />
            <span>Prioritize flooded river blocks</span>
          </label>
        </div>

        {/* 2-Column Grid matching dss-1: Left Map, Right Stats & Camp Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {/* Left Column: Interactive Cachar Map */}
          <div className="border border-[var(--line)] rounded bg-[var(--bg)] p-3 overflow-hidden">
            <div className="flex items-center justify-between text-[12px] text-[var(--mut)] mb-2">
              <span className="font-semibold text-[var(--ink)] flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-[var(--river)]" />
                Cachar District Catchment Map
              </span>
              <div className="flex items-center gap-2.5 text-[11px]">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--ok)]"></span> Active Hub
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded bg-[var(--tea)]"></span> Village Block
                </span>
              </div>
            </div>

            <div className="relative w-full h-72 bg-[var(--panel)] rounded border border-[var(--line)] overflow-hidden">
              {/* Catchment Assignment Vectors */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {result.assignments.map((assign, idx) => {
                  const block = blocks.find((b) => b.id === assign.blockId)
                  const fac = facilities.find((f) => f.id === assign.facilityId)
                  if (!block || !fac) return null
                  return (
                    <line
                      key={idx}
                      x1={`${block.coords.x}%`}
                      y1={`${block.coords.y}%`}
                      x2={`${fac.coords.x}%`}
                      y2={`${fac.coords.y}%`}
                      stroke="var(--river)"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      strokeOpacity="0.75"
                    />
                  )
                })}
              </svg>

              {/* Demand Blocks */}
              {blocks.map((block) => (
                <div
                  key={block.id}
                  style={{ left: `${block.coords.x}%`, top: `${block.coords.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center"
                >
                  <div className="w-3 h-3 rounded bg-[var(--tea)] text-white font-bold flex items-center justify-center text-[7px]">
                    •
                  </div>
                  <span className="text-[9px] font-medium text-[var(--ink)] bg-[var(--panel)] border border-[var(--line)] px-1 rounded mt-0.5 whitespace-nowrap shadow-2xs">
                    {block.name}
                  </span>
                </div>
              ))}

              {/* Health Facilities */}
              {facilities.map((facility) => {
                const isActive = result.activeFacilityIds.includes(facility.id)
                return (
                  <div
                    key={facility.id}
                    style={{ left: `${facility.coords.x}%`, top: `${facility.coords.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-white transition-all ${
                        isActive
                          ? 'bg-[var(--river)] ring-3 ring-[var(--river)]/20 shadow-xs'
                          : 'bg-[var(--line)] text-[var(--mut)]'
                      }`}
                    >
                      <Truck className="w-3 h-3 text-current" />
                    </div>
                    <span
                      className={`text-[9px] font-medium px-1 rounded mt-0.5 whitespace-nowrap ${
                        isActive
                          ? 'bg-[var(--river)] text-white'
                          : 'bg-[var(--panel)] text-[var(--mut)] border border-[var(--line)]'
                      }`}
                    >
                      {facility.name.split(' ')[0]} {isActive ? '[Active]' : ''}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column: Stats & Camp Allocation Table */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-4 pb-2 border-b border-[var(--line)]">
              <div>
                <span className="text-[12px] text-[var(--mut)] block">Optimized Mean Travel</span>
                <b className="text-[22px] font-serif-fraunces text-[var(--ok)]">{result.meanTravelTime} min</b>
              </div>
              <div>
                <span className="text-[12px] text-[var(--mut)] block">Status Quo (HQ Habit)</span>
                <b className="text-[22px] font-serif-fraunces text-[var(--mut)]">{result.baselineMeanTravelTime} min</b>
              </div>
              <div>
                <span className="text-[12px] text-[var(--mut)] block">Travel Time Saved</span>
                <b className="text-[22px] font-serif-fraunces text-[var(--river)]">-{result.travelTimeReductionPct}%</b>
              </div>
              <div>
                <span className="text-[12px] text-[var(--mut)] block">Unserved Burden</span>
                <b className="text-[22px] font-serif-fraunces text-[var(--ink)]">{result.unservedDemand}%</b>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13.5px]">
                <thead>
                  <tr className="border-b border-[var(--line)] text-[12px] text-[var(--mut)] font-medium">
                    <th className="py-1.5 px-2">Active Camp Site</th>
                    <th className="py-1.5 px-2">Revenue Circle</th>
                    <th className="py-1.5 px-2 text-right">Daily Cap</th>
                    <th className="py-1.5 px-2 text-right font-semibold">Patients Allocated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {activeFacilities.map((fac) => {
                    const totalAlloc = result.assignments
                      .filter((a) => a.facilityId === fac.id)
                      .reduce((sum, a) => sum + a.demand, 0)
                    const effectiveCap = Math.round(fac.capacity * capacityMultiplier)

                    return (
                      <tr key={fac.id}>
                        <td className="py-2 px-2 font-medium text-[var(--ink)]">
                          <span className="inline-block w-2 h-2 rounded-full bg-[var(--ok)] mr-1.5"></span>
                          {fac.name}
                        </td>
                        <td className="py-2 px-2 text-[var(--mut)]">{fac.blockName}</td>
                        <td className="py-2 px-2 text-right font-mono text-[var(--mut)]">{effectiveCap}</td>
                        <td className="py-2 px-2 text-right font-mono font-semibold text-[var(--river)]">
                          {Math.round(totalAlloc * 10) / 10}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <p className="text-[12.5px] text-[var(--mut)]">
              Stationing units at {activeFacilities.map((f) => f.name.split(' ')[0]).join(' & ')} saves ~{Math.max(0, Math.round(result.baselineMeanTravelTime - result.meanTravelTime))} minutes of rural road travel per patient over administrative baseline ({baselineFacilities.map((f) => f.name.split(' ')[0]).join(' + ')}).
            </p>
          </div>
        </div>
      </div>

      {/* Manual Sliders Drawer (when edit mode is active) */}
      {isEditMode && showBlockEditor && (
        <div className="dss-panel bg-[var(--line)]/10">
          <h3 className="text-[16px] font-semibold text-[var(--ink)] font-serif-fraunces mb-2">
            Manual block population &amp; flood multiplier adjustments
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] bg-[var(--panel)] rounded border border-[var(--line)]">
              <thead>
                <tr className="border-b border-[var(--line)] text-[11px] text-[var(--mut)] uppercase">
                  <th className="py-2 px-2.5">Block</th>
                  <th className="py-2 px-2.5">Population</th>
                  <th className="py-2 px-2.5">Distress</th>
                  <th className="py-2 px-2.5">Flood Multiplier</th>
                  <th className="py-2 px-2.5 text-right">Burden dᵢ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {blocks.map((b) => {
                  const burden = Math.round(
                    (b.population / 1000.0) * b.baselineDistress * (includeFloodWeight ? b.floodFactor : 1.0) * 10
                  ) / 10
                  return (
                    <tr key={b.id}>
                      <td className="py-1.5 px-2.5 font-medium">{b.name}</td>
                      <td className="py-1.5 px-2.5">
                        <input
                          type="number"
                          step="10000"
                          value={b.population}
                          onChange={(e) => updateBlock(b.id, 'population', parseInt(e.target.value) || 10000)}
                          className="w-20 px-1 py-0.5 border border-[var(--line)] rounded text-right bg-[var(--bg)] text-[var(--ink)] font-mono"
                        />
                      </td>
                      <td className="py-1.5 px-2.5">
                        <input
                          type="number"
                          step="0.01"
                          value={b.baselineDistress}
                          onChange={(e) => updateBlock(b.id, 'baselineDistress', parseFloat(e.target.value) || 0.04)}
                          className="w-16 px-1 py-0.5 border border-[var(--line)] rounded text-right bg-[var(--bg)] text-[var(--ink)] font-mono"
                        />
                      </td>
                      <td className="py-1.5 px-2.5">
                        <input
                          type="number"
                          step="0.1"
                          value={b.floodFactor}
                          onChange={(e) => updateBlock(b.id, 'floodFactor', parseFloat(e.target.value) || 1.0)}
                          className="w-14 px-1 py-0.5 border border-[var(--line)] rounded text-right bg-[var(--bg)] text-[var(--ink)] font-mono"
                        />
                      </td>
                      <td className="py-1.5 px-2.5 text-right font-mono font-semibold">{burden}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-3 pt-3 border-t border-[var(--line)]">
            <span className="text-[12px] font-semibold text-[var(--ink)] block mb-1.5">
              Facility Daily Intake Capacities (Kⱼ):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {facilities.map((f) => (
                <div key={f.id} className="p-1.5 bg-[var(--panel)] border border-[var(--line)] rounded flex items-center justify-between text-xs">
                  <span className="text-[var(--ink)] truncate">{f.name.split(' ')[0]}</span>
                  <input
                    type="number"
                    min="20"
                    max="200"
                    step="10"
                    value={f.capacity}
                    onChange={(e) => updateFacilityCapacity(f.id, parseInt(e.target.value) || 50)}
                    className="w-14 px-1 py-0.5 border border-[var(--line)] rounded bg-[var(--bg)] text-[var(--ink)] font-mono text-right"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Technical Accordion matching dss-1 note style */}
      <div className="dss-panel">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full text-left flex items-center justify-between text-[13px] font-medium text-[var(--mut)] hover:text-[var(--ink)] cursor-pointer"
        >
          <span>Mathematical formulation: Capacitated p-Median Two-Phase Primal Simplex LP</span>
          {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTechnicalDetails && (
          <div className="mt-3 pt-3 border-t border-[var(--line)] text-[13px] text-[var(--mut)] space-y-2">
            <p className="font-mono text-[12px] text-[var(--ink)]">
              min Z = ∑_&#123;i&#125; ∑_&#123;j&#125; d_i · c_&#123;ij&#125; · x_&#123;ij&#125; + M · ∑_&#123;i&#125; u_i
            </p>
            <p>
              Solved via exact client-side Two-Phase Primal Simplex in {result.solveTimeMs} ms. Evaluates all 15 location pairs without greedy index sorting bias, guaranteeing global travel impedance minimization.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
