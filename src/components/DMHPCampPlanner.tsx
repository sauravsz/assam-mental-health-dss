import { useState, useMemo } from 'react'
import type { Block, Facility } from '../engine/types'
import { TRAVEL_TIME_MATRIX } from '../engine/cacharData'
import { solveCampAllocation } from '../engine/solver'
import { Navigation, ChevronDown, ChevronUp, Truck, Edit3, Sliders, MapPin, Pill } from 'lucide-react'

interface DMHPCampPlannerProps {
  blocks: Block[]
  facilities: Facility[]
  isEditMode: boolean
  updateBlock: (blockId: number, field: keyof Block, value: number) => void
  updateFacilityCapacity: (facId: number, capacity: number) => void
  updateMedicineStock: (
    facId: number,
    med: 'haloperidol' | 'fluoxetine' | 'valproate',
    status: 'Adequate' | 'Low Stock' | 'Critical'
  ) => void
  numVans: number
  setNumVans: (n: number) => void
}

export const DMHPCampPlanner = ({
  blocks,
  facilities,
  isEditMode,
  updateBlock,
  updateFacilityCapacity,
  updateMedicineStock,
  numVans,
  setNumVans,
}: DMHPCampPlannerProps) => {
  const [includeFloodWeight, setIncludeFloodWeight] = useState<boolean>(true)
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false)
  const [showBlockEditor, setShowBlockEditor] = useState<boolean>(false)

  // Memoize solver output with reactive blocks & facilities
  const result = useMemo(() => {
    return solveCampAllocation(
      blocks,
      facilities,
      TRAVEL_TIME_MATRIX,
      numVans,
      includeFloodWeight,
      1.0
    )
  }, [blocks, facilities, numVans, includeFloodWeight])

  const activeFacilities = facilities.filter((f) => result.activeFacilityIds.includes(f.id))
  const baselineFacilities = facilities.filter((f) => result.baselineActiveFacilityIds.includes(f.id))

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* ── SECTION 1: PLANNING BOARD & FLEET PARAMETERS ── */}
      <section className="bg-[#efe9de] border border-[#e6dfd8] rounded-xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#faf9f5] text-[#cc785c] border border-[#e6dfd8]">
                Module 02 · Operational Planning
              </span>
              <span className="text-xs text-[#8e8b82]">/</span>
              <span className="text-xs text-[#6c6a64]">Cachar District (1.16M Pop)</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-normal text-[#141413] font-serif-claude tracking-tight">
              Mobile Psychiatric Outreach Siting
            </h2>
            <p className="text-sm text-[#3d3d3a] leading-relaxed mt-2">
              Allocates mobile clinic vans across Cachar's 8 rural revenue circles. The Capacitated Transportation Linear Program determines the optimal facility pairings that mathematically minimize travel time for rural populations.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isEditMode && (
              <button
                onClick={() => setShowBlockEditor(!showBlockEditor)}
                className="bg-[#faf9f5] hover:bg-[#f5f0e8] text-[#141413] border border-[#e6dfd8] font-medium px-3.5 py-2 rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Sliders className="w-3.5 h-3.5 text-[#cc785c]" />
                <span>{showBlockEditor ? 'Hide Manual Sliders' : 'Manual Sliders (8 Blocks)'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Fleet & Disaster Controls */}
        <div className="mt-6 pt-6 border-t border-[#e6dfd8] grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-medium text-[#6c6a64] block mb-2">
              Available Mobile Units (Budget: {numVans} Vans):
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((val) => (
                <button
                  key={val}
                  onClick={() => setNumVans(val)}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    numVans === val
                      ? 'bg-[#cc785c] text-white border-[#cc785c] shadow-xs'
                      : 'bg-[#faf9f5] text-[#3d3d3a] border-[#e6dfd8] hover:bg-[#f5f0e8]'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>{val} {val === 1 ? 'Van' : 'Vans'}</span>
                  {val === 2 && <span className="text-[10px] opacity-80">(Opt)</span>}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#6c6a64] block mb-2">
              Barak River Flood Priority:
            </label>
            <div className="bg-[#faf9f5] p-3 rounded-lg border border-[#e6dfd8]">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeFloodWeight}
                  onChange={(e) => setIncludeFloodWeight(e.target.checked)}
                  className="w-4 h-4 text-[#cc785c] bg-white rounded border-[#e6dfd8] focus:ring-[#cc785c]"
                />
                <div className="text-xs text-[#3d3d3a]">
                  <span className="font-medium text-[#141413] block">Prioritize Inundated Riverine Catchments</span>
                  <span className="text-[11px] text-[#6c6a64]">
                    Applies ASDMA disaster weight (Katigorah 1.8x, Sonai 1.5x)
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* ── EDITABLE SCENARIO DRAWER (WHEN TOGGLED) ── */}
      {isEditMode && showBlockEditor && (
        <section className="bg-[#f5f0e8] border border-[#e6dfd8] rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#e6dfd8] pb-3">
            <div>
              <h3 className="text-base font-normal text-[#141413] font-serif-claude flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#cc785c]" />
                Interactive Block &amp; Clinic Configuration
              </h3>
              <p className="text-xs text-[#6c6a64] mt-0.5">
                Adjust block populations, disaster weights, or intake limits. The Simplex optimizer updates live.
              </p>
            </div>
            <span className="text-xs bg-[#faf9f5] text-[#cc785c] font-medium px-2.5 py-0.5 rounded border border-[#e6dfd8]">
              Two-Phase Simplex
            </span>
          </div>

          {/* Block Table Inputs */}
          <div>
            <h4 className="text-xs font-semibold text-[#6c6a64] uppercase tracking-wider mb-2">
              1. Block Population &amp; Flood Shocks
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left bg-[#faf9f5] rounded-lg border border-[#e6dfd8] overflow-hidden">
                <thead className="bg-[#efe9de] text-[#141413] font-medium text-[11px] border-b border-[#e6dfd8]">
                  <tr>
                    <th className="py-2.5 px-3">Block Name</th>
                    <th className="py-2.5 px-3">Population</th>
                    <th className="py-2.5 px-3">Distress Rate</th>
                    <th className="py-2.5 px-3">Flood Factor</th>
                    <th className="py-2.5 px-3 text-right">Need Burden (dᵢ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6dfd8]">
                  {blocks.map((b) => {
                    const burden = Math.round(
                      (b.population / 1000.0) * b.baselineDistress * (includeFloodWeight ? b.floodFactor : 1.0) * 10
                    ) / 10
                    return (
                      <tr key={b.id} className="hover:bg-[#f5f0e8]">
                        <td className="py-2 px-3 font-medium text-[#141413]">{b.name}</td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            step="10000"
                            min="10000"
                            max="500000"
                            value={b.population}
                            onChange={(e) => updateBlock(b.id, 'population', parseInt(e.target.value) || 10000)}
                            className="w-24 px-2 py-1 bg-white border border-[#e6dfd8] rounded text-xs text-[#141413] focus:outline-none focus:border-[#cc785c]"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            max="0.20"
                            value={b.baselineDistress}
                            onChange={(e) => updateBlock(b.id, 'baselineDistress', parseFloat(e.target.value) || 0.04)}
                            className="w-20 px-2 py-1 bg-white border border-[#e6dfd8] rounded text-xs text-[#141413] focus:outline-none focus:border-[#cc785c]"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              step="0.1"
                              min="1.0"
                              max="3.0"
                              value={b.floodFactor}
                              onChange={(e) => updateBlock(b.id, 'floodFactor', parseFloat(e.target.value) || 1.0)}
                              className="w-16 px-2 py-1 bg-white border border-[#e6dfd8] rounded text-xs text-[#141413] focus:outline-none focus:border-[#cc785c]"
                            />
                            <span className="text-[11px] text-[#8e8b82]">x</span>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right font-medium text-[#141413]">
                          {burden}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Clinic Capacity Inputs */}
          <div>
            <h4 className="text-xs font-semibold text-[#6c6a64] uppercase tracking-wider mb-2">
              2. Clinic Daily Intake Capacity (Patients / Day)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {facilities.map((f) => (
                <div key={f.id} className="bg-[#faf9f5] p-3 rounded-lg border border-[#e6dfd8] text-xs">
                  <div className="font-medium text-[#141413] truncate">{f.name.split(' ')[0]}</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[#6c6a64] text-[11px]">Daily Cap:</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="20"
                        max="200"
                        step="10"
                        value={f.capacity}
                        onChange={(e) => updateFacilityCapacity(f.id, parseInt(e.target.value) || 50)}
                        className="w-16 px-1.5 py-0.5 bg-white border border-[#e6dfd8] rounded text-xs text-[#141413] text-right focus:outline-none"
                      />
                      <span className="text-[10px] text-[#8e8b82]">pts</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SECTION 2: MAP & CATCHMENT DISPATCH ORDER ── */}
      <section className="bg-[#efe9de] border border-[#e6dfd8] rounded-xl p-6 sm:p-8 space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-normal text-[#141413] font-serif-claude tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#cc785c]" />
              Optimization Outcome &amp; Catchment Topography
            </h3>
            <span className="text-xs text-[#6c6a64] bg-[#faf9f5] px-2.5 py-1 rounded-full border border-[#e6dfd8]">
              Latency: {result.solveTimeMs} ms
            </span>
          </div>
          <p className="text-sm text-[#3d3d3a] mt-1">
            Empirical transit burden comparison: Conventional Administrative Habit vs. Two-Phase Simplex Optimum.
          </p>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="bg-[#faf9f5] border border-[#e6dfd8] rounded-xl p-5">
            <span className="text-xs uppercase tracking-wider text-[#8e8b82] block mb-1">
              Status Quo · HQ Bias
            </span>
            <div className="text-3xl font-normal text-[#141413] font-serif-claude">
              {result.baselineMeanTravelTime} <span className="text-sm font-sans text-[#6c6a64]">min</span>
            </div>
            <p className="text-xs text-[#6c6a64] mt-1 truncate">
              Sited: {baselineFacilities.map((f) => f.name.split(' ')[0]).join(' + ')}
            </p>
          </div>

          <div className="bg-[#faf9f5] border border-[#cc785c]/40 rounded-xl p-5">
            <span className="text-xs uppercase tracking-wider text-[#cc785c] block mb-1 font-medium">
              Optimal Siting (AMH-DSS)
            </span>
            <div className="text-3xl font-normal text-[#cc785c] font-serif-claude">
              {result.meanTravelTime} <span className="text-sm font-sans text-[#6c6a64]">min</span>
            </div>
            <p className="text-xs text-[#3d3d3a] mt-1 font-medium truncate">
              Sited: {activeFacilities.map((f) => f.name.split(' ')[0]).join(' + ')}
            </p>
          </div>

          <div className="bg-[#faf9f5] border border-[#e6dfd8] rounded-xl p-5">
            <span className="text-xs uppercase tracking-wider text-[#5db872] block mb-1 font-medium">
              Travel Burden Reduction
            </span>
            <div className="text-3xl font-normal text-[#5db872] font-serif-claude">
              -{result.travelTimeReductionPct}%
            </div>
            <p className="text-xs text-[#3d3d3a] mt-1">
              Saves <strong className="text-[#141413]">~{Math.max(0, Math.round(result.baselineMeanTravelTime - result.meanTravelTime))} minutes</strong> per patient
            </p>
          </div>
        </div>

        {/* Dark Product Showcase Card for Map (Claude Pacing: Cream to Dark Surface) */}
        <div className="bg-[#181715] rounded-xl p-5 sm:p-6 text-[#faf9f5] shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#252320]">
            <div className="flex items-center gap-2 text-xs">
              <Navigation className="w-4 h-4 text-[#cc785c]" />
              <span className="font-medium text-white tracking-wide">Cachar District Catchment Map</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#a09d96]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#cc785c]"></span> Active Van Hub
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#e8a55a]"></span> Village Catchment
              </span>
            </div>
          </div>

          <div className="relative w-full h-80 bg-[#1f1e1b] rounded-lg border border-[#252320] p-2 overflow-hidden">
            {/* SVG Connecting Vectors */}
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
                    stroke="#cc785c"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    strokeOpacity="0.8"
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
                <div className="w-3.5 h-3.5 rounded bg-[#e8a55a] text-black font-bold flex items-center justify-center text-[8px] shadow-sm">
                  •
                </div>
                <span className="text-[9px] font-medium text-[#faf9f5] bg-[#252320] px-1 rounded mt-0.5 whitespace-nowrap shadow-xs">
                  {block.name}
                </span>
              </div>
            ))}

            {/* Candidate Facilities */}
            {facilities.map((facility) => {
              const isActive = result.activeFacilityIds.includes(facility.id)
              return (
                <div
                  key={facility.id}
                  style={{ left: `${facility.coords.x}%`, top: `${facility.coords.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
                >
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center shadow-md transition-all ${
                      isActive
                        ? 'bg-[#cc785c] text-white font-bold ring-4 ring-[#cc785c]/25'
                        : 'bg-[#252320] text-[#a09d96] border border-white/10'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5 text-current" />
                  </div>
                  <span
                    className={`text-[9px] font-medium px-1.5 py-0.2 rounded mt-0.5 whitespace-nowrap ${
                      isActive
                        ? 'bg-[#cc785c] text-white font-semibold'
                        : 'bg-[#252320] text-[#a09d96]'
                    }`}
                  >
                    {facility.name.split(' ')[0]} {isActive ? '[Active]' : ''}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="mt-3 text-xs text-[#a09d96] flex items-center justify-between">
            <span>Dashed lines indicate rural patient assignments routed to active mobile units.</span>
            <span className="text-[#cc785c] font-mono text-[11px]">
              HiGHS Objective: {result.totalImpedance.toLocaleString()}
            </span>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: PHARMACY READINESS CHECKLIST ── */}
      <section className="bg-[#efe9de] border border-[#e6dfd8] rounded-xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="text-lg sm:text-xl font-normal text-[#141413] font-serif-claude tracking-tight flex items-center gap-2">
              <Pill className="w-4 h-4 text-[#cc785c]" />
              Pharmacy Readiness &amp; Psychotropic Stock
            </h4>
            <p className="text-xs text-[#6c6a64] mt-0.5">
              Verifies inventory readiness for essential psychotropics before mobile team mobilization.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
          {activeFacilities.map((fac) => {
            const hasAlert = Object.values(fac.medicineStock).some((s) => s === 'Critical' || s === 'Low Stock')
            return (
              <div
                key={fac.id}
                className="bg-[#faf9f5] border border-[#e6dfd8] rounded-xl p-5 text-xs shadow-2xs"
              >
                <div className="flex items-center justify-between font-medium mb-3">
                  <span className="text-base text-[#141413] font-serif-claude">{fac.name}</span>
                  {hasAlert ? (
                    <span className="text-[10px] text-[#c64545] font-semibold bg-[#c64545]/10 px-2.5 py-0.5 rounded-full border border-[#c64545]/20">
                      Restock Needed
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#5db872] font-semibold bg-[#5db872]/10 px-2.5 py-0.5 rounded-full border border-[#5db872]/20">
                      Fully Stocked
                    </span>
                  )}
                </div>

                <div className="text-xs text-[#6c6a64] space-y-2 pt-2 border-t border-[#e6dfd8]">
                  <div className="flex items-center justify-between">
                    <span>Haloperidol:</span>
                    {isEditMode ? (
                      <select
                        value={fac.medicineStock.haloperidol}
                        onChange={(e) =>
                          updateMedicineStock(
                            fac.id,
                            'haloperidol',
                            e.target.value as 'Adequate' | 'Low Stock' | 'Critical'
                          )
                        }
                        className="bg-white border border-[#e6dfd8] rounded px-2 py-0.5 text-xs text-[#141413]"
                      >
                        <option value="Adequate">Adequate</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Critical">Critical</option>
                      </select>
                    ) : (
                      <span className="font-medium text-[#141413]">{fac.medicineStock.haloperidol}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Fluoxetine:</span>
                    {isEditMode ? (
                      <select
                        value={fac.medicineStock.fluoxetine}
                        onChange={(e) =>
                          updateMedicineStock(
                            fac.id,
                            'fluoxetine',
                            e.target.value as 'Adequate' | 'Low Stock' | 'Critical'
                          )
                        }
                        className="bg-white border border-[#e6dfd8] rounded px-2 py-0.5 text-xs text-[#141413]"
                      >
                        <option value="Adequate">Adequate</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Critical">Critical</option>
                      </select>
                    ) : (
                      <span className={`font-medium ${fac.medicineStock.fluoxetine === 'Critical' ? 'text-[#c64545]' : 'text-[#141413]'}`}>
                        {fac.medicineStock.fluoxetine}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Sodium Valproate:</span>
                    {isEditMode ? (
                      <select
                        value={fac.medicineStock.valproate}
                        onChange={(e) =>
                          updateMedicineStock(
                            fac.id,
                            'valproate',
                            e.target.value as 'Adequate' | 'Low Stock' | 'Critical'
                          )
                        }
                        className="bg-white border border-[#e6dfd8] rounded px-2 py-0.5 text-xs text-[#141413]"
                      >
                        <option value="Adequate">Adequate</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Critical">Critical</option>
                      </select>
                    ) : (
                      <span className="font-medium text-[#141413]">{fac.medicineStock.valproate}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── SECTION 4: CODE-WINDOW CARD FOR EVALUATORS ── */}
      <section className="bg-[#181715] rounded-xl overflow-hidden text-[#faf9f5] border border-[#252320]">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full px-6 py-4 bg-[#181715] hover:bg-[#1f1e1b] text-left flex items-center justify-between text-xs font-medium text-[#a09d96] hover:text-white transition-colors cursor-pointer"
        >
          <span>Inspect Two-Phase Primal Simplex Mathematical Formulation &amp; Distance Matrices</span>
          {showTechnicalDetails ? (
            <ChevronUp className="w-4 h-4 text-[#a09d96]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#a09d96]" />
          )}
        </button>

        {showTechnicalDetails && (
          <div className="p-6 space-y-4 bg-[#1f1e1b] border-t border-[#252320] text-xs text-[#faf9f5]">
            <div className="bg-[#252320] p-4 rounded-lg space-y-1 font-mono-code text-[11px]">
              <p className="font-semibold text-[#cc785c]">Capacitated p-Median Two-Phase Primal Simplex LP:</p>
              <p className="text-[#a09d96]">
                min Z = ∑_&#123;i&#125; ∑_&#123;j&#125; d_i · c_&#123;ij&#125; · x_&#123;ij&#125; + M · ∑_&#123;i&#125; u_i
              </p>
              <p className="text-[#8e8b82] font-sans text-xs mt-1">
                Subject to demand conservation, capacity ceiling, and budget P = {numVans}. Solved via exact Two-Phase Simplex in {result.solveTimeMs} ms.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#252320] text-[#a09d96] uppercase text-[10px] border-b border-[#353330]">
                  <tr>
                    <th className="py-2 px-3">Block Name</th>
                    <th className="py-2 px-3 text-right">Population</th>
                    <th className="py-2 px-3 text-right">Burden (dᵢ)</th>
                    <th className="py-2 px-3">Assigned Hub</th>
                    <th className="py-2 px-3 text-right">Travel Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252320]">
                  {result.assignments.map((a, idx) => (
                    <tr key={idx} className="hover:bg-[#252320]">
                      <td className="py-2 px-3 font-medium text-white">{blocks[a.blockId].name}</td>
                      <td className="py-2 px-3 text-right text-[#a09d96]">{blocks[a.blockId].population.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right text-[#a09d96]">{a.demand}</td>
                      <td className="py-2 px-3 text-[#cdcdcd]">{facilities[a.facilityId].name}</td>
                      <td className="py-2 px-3 text-right font-medium text-[#5db872]">{a.travelTime} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
