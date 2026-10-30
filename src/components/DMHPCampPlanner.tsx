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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ── SECTION 1: PLANNING BOARD & FLEET PARAMETERS ── */}
      <section className="bg-[#0d0d0d] border border-[#242728] rounded-xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#101111] text-[#59d499] border border-[#242728]">
                Module 02 · Fleet Logistics
              </span>
              <span className="text-xs text-[#6a6b6c]">•</span>
              <span className="text-xs text-[#9c9c9d]">Cachar District (1.16M Pop)</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-semibold text-[#f4f4f6] tracking-tight">
              Mobile Psychiatric Outreach Siting
            </h2>
            <p className="text-sm text-[#cdcdcd] leading-relaxed mt-1.5">
              Optimizes mobile clinic placement across 8 rural revenue blocks. The Two-Phase Primal Simplex LP solver calculates exact facility assignments to minimize rural patient travel burden.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isEditMode && (
              <button
                onClick={() => setShowBlockEditor(!showBlockEditor)}
                className="bg-[#101111] hover:bg-[#18191a] text-[#cdcdcd] hover:text-white border border-[#242728] font-medium px-3 py-2 rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-[#57c1ff]" />
                <span>{showBlockEditor ? 'Hide Sliders' : 'Manual Sliders (8 Blocks)'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Fleet & Flood Toggles */}
        <div className="mt-6 pt-5 border-t border-[#242728] grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[#9c9c9d] block mb-2">
              Available Mobile Vans ({numVans} Units):
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((val) => (
                <button
                  key={val}
                  onClick={() => setNumVans(val)}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    numVans === val
                      ? 'bg-white text-black border-white shadow-xs font-semibold'
                      : 'bg-[#101111] text-[#cdcdcd] border-[#242728] hover:text-white hover:bg-[#18191a]'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>{val} {val === 1 ? 'Van' : 'Vans'}</span>
                  {val === 2 && <span className="text-[10px] text-black/60 font-mono">(Opt)</span>}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#9c9c9d] block mb-2">
              Barak River Flood Factor:
            </label>
            <div className="bg-[#101111] p-2.5 rounded-lg border border-[#242728]">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeFloodWeight}
                  onChange={(e) => setIncludeFloodWeight(e.target.checked)}
                  className="w-4 h-4 text-[#57c1ff] bg-[#07080a] rounded border-[#242728] focus:ring-[#57c1ff]"
                />
                <div className="text-xs text-[#cdcdcd]">
                  <span className="font-medium text-white block">Prioritize Inundated Riverine Catchments</span>
                  <span className="text-[11px] text-[#6a6b6c]">
                    Applies ASDMA disaster multiplier (Katigorah 1.8x, Sonai 1.5x)
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* ── EDITABLE SCENARIO DRAWER (WHEN TOGGLED) ── */}
      {isEditMode && showBlockEditor && (
        <section className="bg-[#0d0d0d] border border-[#242728] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#242728] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-[#f4f4f6] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#57c1ff]" />
                Scenario Parameter Configuration (Cachar Node)
              </h3>
              <p className="text-xs text-[#9c9c9d] mt-0.5">
                Adjust block populations, flood severity, or clinic capacities. Simplex solver updates live.
              </p>
            </div>
            <span className="text-[10px] bg-[#101111] text-[#59d499] font-mono px-2 py-0.5 rounded border border-[#242728]">
              Simplex LP Active
            </span>
          </div>

          {/* Block Table Inputs */}
          <div>
            <h4 className="text-xs font-semibold text-[#9c9c9d] uppercase tracking-wider mb-2">
              1. Block Population &amp; Flood Multipliers
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left bg-[#101111] rounded-lg border border-[#242728] overflow-hidden">
                <thead className="bg-[#07080a] text-[#9c9c9d] font-semibold uppercase text-[10px] border-b border-[#242728]">
                  <tr>
                    <th className="py-2.5 px-3">Block Name</th>
                    <th className="py-2.5 px-3">Population</th>
                    <th className="py-2.5 px-3">Distress Rate</th>
                    <th className="py-2.5 px-3">Flood Multiplier</th>
                    <th className="py-2.5 px-3 text-right">Burden (dᵢ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#242728]">
                  {blocks.map((b) => {
                    const burden = Math.round(
                      (b.population / 1000.0) * b.baselineDistress * (includeFloodWeight ? b.floodFactor : 1.0) * 10
                    ) / 10
                    return (
                      <tr key={b.id} className="hover:bg-[#141517]">
                        <td className="py-2 px-3 font-medium text-white">{b.name}</td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            step="10000"
                            min="10000"
                            max="500000"
                            value={b.population}
                            onChange={(e) => updateBlock(b.id, 'population', parseInt(e.target.value) || 10000)}
                            className="w-24 px-2 py-1 bg-[#07080a] border border-[#242728] rounded font-mono text-xs text-white focus:outline-none focus:border-white/40"
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
                            className="w-20 px-2 py-1 bg-[#07080a] border border-[#242728] rounded font-mono text-xs text-white focus:outline-none focus:border-white/40"
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
                              className="w-16 px-2 py-1 bg-[#07080a] border border-[#242728] rounded font-mono text-xs text-white focus:outline-none focus:border-white/40"
                            />
                            <span className="text-[11px] text-[#6a6b6c]">x</span>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-white">
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
            <h4 className="text-xs font-semibold text-[#9c9c9d] uppercase tracking-wider mb-2">
              2. Clinic Daily Intake Capacity (Patients / Day)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {facilities.map((f) => (
                <div key={f.id} className="bg-[#101111] p-2.5 rounded-lg border border-[#242728] text-xs">
                  <div className="font-medium text-white truncate">{f.name.split(' ')[0]}</div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[#6a6b6c] text-[11px]">Daily Cap:</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="20"
                        max="200"
                        step="10"
                        value={f.capacity}
                        onChange={(e) => updateFacilityCapacity(f.id, parseInt(e.target.value) || 50)}
                        className="w-16 px-1.5 py-0.5 bg-[#07080a] border border-[#242728] rounded font-mono text-xs text-white text-right focus:outline-none"
                      />
                      <span className="text-[10px] text-[#6a6b6c]">pts</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SECTION 2: MAP & CATCHMENT DISPATCH ORDER ── */}
      <section className="bg-[#0d0d0d] border border-[#242728] rounded-xl p-6 shadow-xl space-y-5">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[#f4f4f6] tracking-tight flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#59d499]" />
              Optimization Outcome &amp; Catchment Topography
            </h3>
            <span className="text-xs font-mono text-[#59d499] bg-[#101111] px-2 py-0.5 rounded border border-[#242728]">
              Latency: {result.solveTimeMs} ms
            </span>
          </div>
          <p className="text-xs text-[#9c9c9d] mt-0.5">
            Empirical travel burden comparison: Conventional Administrative Habit vs. Mathematical Optimum.
          </p>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#101111] border border-[#242728] rounded-lg p-4">
            <span className="text-xs uppercase tracking-wider text-[#6a6b6c] block mb-1 font-mono">
              Status Quo · HQ Bias
            </span>
            <div className="text-2xl font-semibold text-[#cdcdcd]">
              {result.baselineMeanTravelTime} <span className="text-sm font-normal text-[#6a6b6c]">min</span>
            </div>
            <p className="text-xs text-[#6a6b6c] mt-1 truncate">
              Sited: {baselineFacilities.map((f) => f.name.split(' ')[0]).join(' + ')}
            </p>
          </div>

          <div className="bg-[#101111] border border-[#59d499]/40 rounded-lg p-4">
            <span className="text-xs uppercase tracking-wider text-[#59d499] block mb-1 font-mono">
              Optimal Siting (AMH-DSS)
            </span>
            <div className="text-2xl font-semibold text-white">
              {result.meanTravelTime} <span className="text-sm font-normal text-[#6a6b6c]">min</span>
            </div>
            <p className="text-xs text-[#59d499] mt-1 font-medium truncate">
              Sited: {activeFacilities.map((f) => f.name.split(' ')[0]).join(' + ')}
            </p>
          </div>

          <div className="bg-[#101111] border border-[#242728] rounded-lg p-4">
            <span className="text-xs uppercase tracking-wider text-[#57c1ff] block mb-1 font-mono">
              Travel Impedance Saved
            </span>
            <div className="text-2xl font-semibold text-[#57c1ff]">
              -{result.travelTimeReductionPct}%
            </div>
            <p className="text-xs text-[#cdcdcd] mt-1">
              Saves <strong className="text-white">~{Math.max(0, Math.round(result.baselineMeanTravelTime - result.meanTravelTime))} minutes</strong> per patient
            </p>
          </div>
        </div>

        {/* Cachar District Schematic Map */}
        <div className="border border-[#242728] rounded-lg p-4 bg-[#07080a] overflow-hidden">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#242728]">
            <div className="flex items-center gap-2 text-xs">
              <Navigation className="w-4 h-4 text-[#59d499]" />
              <span className="font-semibold text-white">Cachar District Transit Topology</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-[#9c9c9d]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#59d499]"></span> Active Van Hub
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#ffc533]"></span> Demand Node
              </span>
            </div>
          </div>

          <div className="relative w-full h-80 bg-[#07080a] rounded border border-[#242728]/60 p-2 overflow-hidden">
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
                    stroke="#59d499"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    strokeOpacity="0.7"
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
                <div className="w-3.5 h-3.5 rounded bg-[#ffc533] text-black font-bold flex items-center justify-center text-[8px] shadow-sm">
                  •
                </div>
                <span className="text-[9px] font-medium text-[#cdcdcd] bg-[#101111] border border-[#242728] px-1 rounded mt-0.5 whitespace-nowrap">
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
                        ? 'bg-[#59d499] text-black font-bold ring-4 ring-[#59d499]/20'
                        : 'bg-[#101111] text-[#6a6b6c] border border-[#242728]'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5 text-current" />
                  </div>
                  <span
                    className={`text-[9px] font-medium px-1.5 py-0.2 rounded mt-0.5 whitespace-nowrap ${
                      isActive
                        ? 'bg-[#101111] text-[#59d499] border border-[#59d499]/40'
                        : 'bg-[#07080a] text-[#6a6b6c]'
                    }`}
                  >
                    {facility.name.split(' ')[0]} {isActive ? '[Active]' : ''}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="mt-2 text-xs text-[#6a6b6c] flex items-center justify-between">
            <span>Dashed lines represent rural catchment vectors routed to active mobile units.</span>
            <span className="text-[#59d499] font-mono text-[11px]">
              HiGHS Objective: {result.totalImpedance.toLocaleString()}
            </span>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: PHARMACY READINESS CHECKLIST ── */}
      <section className="bg-[#0d0d0d] border border-[#242728] rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-semibold text-[#f4f4f6] flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-[#57c1ff]" />
              Pharmacy Component Readiness (Active Hubs)
            </h4>
            <p className="text-xs text-[#9c9c9d] mt-0.5">
              Verifies stock integrity for essential psychotropics before mobile team mobilization.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {activeFacilities.map((fac) => {
            const hasAlert = Object.values(fac.medicineStock).some((s) => s === 'Critical' || s === 'Low Stock')
            return (
              <div
                key={fac.id}
                className={`p-4 rounded-lg border text-xs ${
                  hasAlert
                    ? 'bg-[#101111] border-[#ff6161]/30'
                    : 'bg-[#101111] border-[#59d499]/30'
                }`}
              >
                <div className="flex items-center justify-between font-semibold mb-2">
                  <span className="text-sm text-white">{fac.name}</span>
                  {hasAlert ? (
                    <span className="text-[10px] text-[#ff6161] font-medium bg-[#ff6161]/10 px-2 py-0.5 rounded border border-[#ff6161]/20">
                      Restock Needed
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#59d499] font-medium bg-[#59d499]/10 px-2 py-0.5 rounded border border-[#59d499]/20">
                      Fully Stocked
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-[#9c9c9d] space-y-1.5 pt-2 border-t border-[#242728]">
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
                        className="bg-[#07080a] border border-[#242728] rounded px-1.5 py-0.5 text-[10px] text-white"
                      >
                        <option value="Adequate">Adequate</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Critical">Critical</option>
                      </select>
                    ) : (
                      <span className="font-medium text-[#cdcdcd]">{fac.medicineStock.haloperidol}</span>
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
                        className="bg-[#07080a] border border-[#242728] rounded px-1.5 py-0.5 text-[10px] text-white"
                      >
                        <option value="Adequate">Adequate</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Critical">Critical</option>
                      </select>
                    ) : (
                      <span className={`font-medium ${fac.medicineStock.fluoxetine === 'Critical' ? 'text-[#ff6161]' : 'text-[#cdcdcd]'}`}>
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
                        className="bg-[#07080a] border border-[#242728] rounded px-1.5 py-0.5 text-[10px] text-white"
                      >
                        <option value="Adequate">Adequate</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Critical">Critical</option>
                      </select>
                    ) : (
                      <span className="font-medium text-[#cdcdcd]">{fac.medicineStock.valproate}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── SECTION 4: TECHNICAL DRAWER ── */}
      <section className="border border-[#242728] rounded-xl overflow-hidden bg-[#0d0d0d]">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full px-4 py-3 bg-[#0d0d0d] hover:bg-[#101111] text-left flex items-center justify-between text-xs font-medium text-[#9c9c9d] hover:text-white transition-colors cursor-pointer"
        >
          <span>Show Two-Phase Simplex Mathematical Tableau &amp; Travel Matrix</span>
          {showTechnicalDetails ? (
            <ChevronUp className="w-4 h-4 text-[#6a6b6c]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#6a6b6c]" />
          )}
        </button>

        {showTechnicalDetails && (
          <div className="p-4 space-y-3 bg-[#07080a] border-t border-[#242728] text-xs text-[#cdcdcd]">
            <div className="bg-[#101111] p-3 rounded-lg border border-[#242728] space-y-1">
              <p className="font-semibold text-white">Capacitated p-Median Two-Phase Primal Simplex LP:</p>
              <p className="text-[11px] font-mono text-[#9c9c9d]">
                min Z = ∑_&#123;i&#125; ∑_&#123;j&#125; d_i · c_&#123;ij&#125; · x_&#123;ij&#125; + M · ∑_&#123;i&#125; u_i
              </p>
              <p className="text-[11px] text-[#6a6b6c] mt-1">
                Subject to demand conservation, capacity ceiling, and budget P = {numVans}. Solved via exact Two-Phase Simplex in {result.solveTimeMs} ms.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#101111] text-[#9c9c9d] font-semibold uppercase text-[10px] border-b border-[#242728]">
                  <tr>
                    <th className="py-2 px-2.5">Block Name</th>
                    <th className="py-2 px-2.5 text-right">Population</th>
                    <th className="py-2 px-2.5 text-right">Burden (dᵢ)</th>
                    <th className="py-2 px-2.5">Assigned Hub</th>
                    <th className="py-2 px-2.5 text-right">Travel Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#242728]">
                  {result.assignments.map((a, idx) => (
                    <tr key={idx} className="hover:bg-[#101111]">
                      <td className="py-1.5 px-2.5 font-medium text-white">{blocks[a.blockId].name}</td>
                      <td className="py-1.5 px-2.5 text-right text-[#9c9c9d]">{blocks[a.blockId].population.toLocaleString()}</td>
                      <td className="py-1.5 px-2.5 text-right text-[#9c9c9d]">{a.demand}</td>
                      <td className="py-1.5 px-2.5 text-[#cdcdcd]">{facilities[a.facilityId].name}</td>
                      <td className="py-1.5 px-2.5 text-right font-semibold text-[#59d499]">{a.travelTime} min</td>
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
