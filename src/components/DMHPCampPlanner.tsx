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
    <div className="space-y-6 max-w-5xl mx-auto font-sans-tech">
      {/* ── SECTION 1: PLANNING BOARD & FLEET PARAMETERS ── */}
      <section className="bg-[#144837]/90 border border-[#B87333]/70 rounded-lg p-5 sm:p-6 shadow-[0_2px_14px_rgba(0,0,0,0.3)] relative">
        {/* PCB Solder Pins */}
        <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-[#B87333]"></div>
        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#B87333]"></div>
        <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-[#B87333]"></div>
        <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#B87333]"></div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="max-w-2xl">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#FFD700] bg-[#09231A] px-2.5 py-1 rounded border border-[#B87333]/50">
              MODULE 02 // CAPACITATED_P_MEDIAN_ROUTING
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#EAD0AC] font-serif-display tracking-tight mt-2.5">
              Mobile Psychiatric Outreach Siting
            </h2>
            <p className="text-xs sm:text-sm text-[#C2AB8E] leading-relaxed mt-1.5">
              In Cachar District (1.16M population across 8 rural revenue circles), the health mission allocates{' '}
              <strong className="text-[#FFD700] font-semibold">{numVans} mobile psychiatric units</strong>.
              The Two-Phase Primal Simplex optimizer positions units where total patient transit impedance is minimized.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isEditMode && (
              <button
                onClick={() => setShowBlockEditor(!showBlockEditor)}
                className="bg-[#09231A] hover:bg-[#1A5944] text-[#FFD700] border border-[#B87333] font-semibold px-3 py-2 rounded text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-[#D98C53]" />
                <span>{showBlockEditor ? 'Hide Circuit Registers' : 'Manual Registers (8 Blocks)'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Fleet & Flood Toggles */}
        <div className="mt-5 pt-5 border-t border-[#B87333]/30 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-[#EAD0AC] block mb-1.5 uppercase tracking-wide">
              Active Van Fleet Capacity (P = {numVans}):
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((val) => (
                <button
                  key={val}
                  onClick={() => setNumVans(val)}
                  className={`py-2 px-3 text-xs font-semibold rounded border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    numVans === val
                      ? 'bg-[#D98C53] text-[#09231A] border-[#FFD700] shadow-xs font-bold'
                      : 'bg-[#09231A] text-[#EAD0AC] border-[#B87333]/60 hover:bg-[#1A5944]'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5 text-current" />
                  <span>{val} {val === 1 ? 'Van' : 'Vans'}</span>
                  {val === 2 && <span className="text-[9px] text-[#09231A] font-bold">(Optimal)</span>}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#EAD0AC] block mb-1.5 uppercase tracking-wide">
              Barak Basin Flood Trauma Multiplier:
            </label>
            <div className="bg-[#09231A] p-2.5 rounded border border-[#B87333]/50">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeFloodWeight}
                  onChange={(e) => setIncludeFloodWeight(e.target.checked)}
                  className="w-4 h-4 text-[#D98C53] bg-[#09231A] rounded border-[#B87333] focus:ring-[#D98C53]"
                />
                <div className="text-xs text-[#EAD0AC]">
                  <span className="font-semibold block">Prioritize Inundated Riverine Blocks</span>
                  <span className="text-[11px] text-[#C2AB8E]">
                    Weights flood-damaged catchments (Katigorah 1.8x, Sonai 1.5x)
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* ── EDITABLE SCENARIO DRAWER (WHEN TOGGLED) ── */}
      {isEditMode && showBlockEditor && (
        <section className="bg-[#09231A] border border-[#FFD700] rounded-lg p-5 shadow-[0_0_15px_rgba(255,215,0,0.15)] space-y-4">
          <div className="flex items-center justify-between border-b border-[#B87333]/40 pb-2">
            <div>
              <h3 className="text-sm font-bold text-[#FFD700] flex items-center gap-2 font-serif-display">
                <Edit3 className="w-4 h-4 text-[#D98C53]" />
                Direct Bus Register Configuration (Cachar Node)
              </h3>
              <p className="text-xs text-[#C2AB8E]">
                Edit population values, flood factors, or clinic intake capacities. Simplex optimizer recalculates live.
              </p>
            </div>
            <span className="text-[10px] bg-[#165B45] text-[#FFD700] font-mono font-bold px-2 py-0.5 rounded border border-[#FFD700]/50">
              SIMPLEX_LP_ONLINE
            </span>
          </div>

          {/* Block Table Inputs */}
          <div>
            <h4 className="text-xs font-bold text-[#EAD0AC] uppercase tracking-wide mb-2 font-mono">
              // 01. REVENUE BLOCK POPULATION &amp; FLOOD COVARIATES
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left bg-[#144837] rounded border border-[#B87333]/60 overflow-hidden">
                <thead className="bg-[#09231A] text-[#FFD700] font-mono font-semibold uppercase text-[10px] border-b border-[#B87333]/40">
                  <tr>
                    <th className="py-2 px-3">Block Node</th>
                    <th className="py-2 px-3">Population</th>
                    <th className="py-2 px-3">Distress Rate</th>
                    <th className="py-2 px-3">Flood Factor</th>
                    <th className="py-2 px-3 text-right">Burden dᵢ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#B87333]/30">
                  {blocks.map((b) => {
                    const burden = Math.round(
                      (b.population / 1000.0) * b.baselineDistress * (includeFloodWeight ? b.floodFactor : 1.0) * 10
                    ) / 10
                    return (
                      <tr key={b.id} className="hover:bg-[#1A5944]">
                        <td className="py-2 px-3 font-semibold text-[#EAD0AC]">{b.name}</td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            step="10000"
                            min="10000"
                            max="500000"
                            value={b.population}
                            onChange={(e) => updateBlock(b.id, 'population', parseInt(e.target.value) || 10000)}
                            className="w-24 px-2 py-1 bg-[#09231A] border border-[#B87333] rounded font-mono text-xs text-[#FFD700] focus:outline-none focus:border-[#FFD700]"
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
                            className="w-20 px-2 py-1 bg-[#09231A] border border-[#B87333] rounded font-mono text-xs text-[#FFD700] focus:outline-none focus:border-[#FFD700]"
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
                              className="w-16 px-2 py-1 bg-[#09231A] border border-[#B87333] rounded font-mono text-xs text-[#FFD700] focus:outline-none focus:border-[#FFD700]"
                            />
                            <span className="text-[11px] text-[#C2AB8E]">x</span>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-[#FFD700]">
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
            <h4 className="text-xs font-bold text-[#EAD0AC] uppercase tracking-wide mb-2 font-mono">
              // 02. INTAKE CAPACITIES (Kⱼ PATIENTS/DAY)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {facilities.map((f) => (
                <div key={f.id} className="bg-[#144837] p-2.5 rounded border border-[#B87333]/50 text-xs">
                  <div className="font-semibold text-[#EAD0AC] truncate">{f.name.split(' ')[0]}</div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[#C2AB8E] text-[11px]">Daily Cap:</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="20"
                        max="200"
                        step="10"
                        value={f.capacity}
                        onChange={(e) => updateFacilityCapacity(f.id, parseInt(e.target.value) || 50)}
                        className="w-16 px-1.5 py-0.5 bg-[#09231A] border border-[#B87333] rounded font-mono text-xs text-[#FFD700] text-right focus:outline-none"
                      />
                      <span className="text-[10px] text-[#C2AB8E]">pts</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SECTION 2: MAP & CATCHMENT DISPATCH ORDER ── */}
      <section className="bg-[#144837]/90 border border-[#B87333]/70 rounded-lg p-5 sm:p-6 shadow-[0_2px_14px_rgba(0,0,0,0.3)] space-y-5">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#EAD0AC] font-serif-display tracking-wide flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#FFD700]" />
              Optimization Outcome &amp; Catchment Topography
            </h3>
            <span className="text-xs font-mono font-semibold text-[#FFD700] bg-[#09231A] px-2 py-0.5 rounded border border-[#B87333]">
              EXEC: TWO_PHASE_SIMPLEX // {result.solveTimeMs} ms
            </span>
          </div>
          <p className="text-xs text-[#C2AB8E] mt-0.5">
            Empirical travel burden comparison: Conventional Administrative Habit vs. Mathematical Optimum.
          </p>
        </div>

        {/* 3 Metric Registers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#09231A] border border-[#B87333]/50 rounded-lg p-4">
            <span className="text-xs font-mono uppercase tracking-wider text-[#C2AB8E] block mb-1">
              STATUS QUO // HQ BIAS
            </span>
            <div className="text-3xl font-bold text-[#EAD0AC] font-serif-display">
              {result.baselineMeanTravelTime} <span className="text-sm font-sans-tech text-[#C2AB8E]">min</span>
            </div>
            <p className="text-xs text-[#C2AB8E] mt-1 font-mono text-[11px]">
              Sited: {baselineFacilities.map((f) => f.name.split(' ')[0]).join(' + ')}
            </p>
          </div>

          <div className="bg-[#165B45] border border-[#FFD700]/70 rounded-lg p-4 shadow-[0_0_12px_rgba(255,215,0,0.1)]">
            <span className="text-xs font-mono uppercase tracking-wider text-[#FFD700] block mb-1">
              AMH-DSS OPTIMAL ROUTE
            </span>
            <div className="text-3xl font-bold text-[#FFD700] font-serif-display">
              {result.meanTravelTime} <span className="text-sm font-sans-tech text-[#EAD0AC]">min</span>
            </div>
            <p className="text-xs text-[#EAD0AC] mt-1 font-mono text-[11px]">
              Sited: {activeFacilities.map((f) => f.name.split(' ')[0]).join(' + ')}
            </p>
          </div>

          <div className="bg-[#09231A] border border-[#D98C53] rounded-lg p-4">
            <span className="text-xs font-mono uppercase tracking-wider text-[#D98C53] block mb-1">
              TRAVEL IMPEDANCE SAVED
            </span>
            <div className="text-3xl font-bold text-[#D98C53] font-serif-display">
              -{result.travelTimeReductionPct}%
            </div>
            <p className="text-xs text-[#EAD0AC] mt-1">
              Saves <strong className="text-[#FFD700]">~{Math.max(0, Math.round(result.baselineMeanTravelTime - result.meanTravelTime))} minutes</strong> per rural patient
            </p>
          </div>
        </div>

        {/* Cachar District PCB Schematic Map */}
        <div className="border border-[#B87333] rounded-lg p-4 bg-[#09231A] text-white overflow-hidden relative">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#B87333]/30">
            <div className="flex items-center gap-2 text-xs font-mono">
              <Navigation className="w-4 h-4 text-[#FFD700]" />
              <span className="font-bold text-[#FFD700] tracking-wide">CACHAR DISTRICT CIRCUIT TOPOLOGY</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-[#C2AB8E] font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFD700] shadow-[0_0_6px_#FFD700]"></span> Active Van IC
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#D98C53]"></span> Village Node
              </span>
            </div>
          </div>

          <div className="relative w-full h-80 bg-[#061812] rounded border border-[#165B45] p-2 overflow-hidden">
            {/* SVG Circuit Traces Connecting Lines */}
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
                    stroke="#D98C53"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    strokeOpacity="0.85"
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
                <div className="w-3.5 h-3.5 rounded bg-[#D98C53] text-[#09231A] font-bold flex items-center justify-center text-[8px] shadow-sm">
                  •
                </div>
                <span className="text-[9px] font-mono text-[#EAD0AC] bg-[#09231A] border border-[#B87333]/50 px-1 rounded mt-0.5 whitespace-nowrap">
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
                        ? 'bg-[#FFD700] text-[#09231A] font-bold border-2 border-white ring-4 ring-[#FFD700]/30 animate-pulse'
                        : 'bg-[#144837] text-[#C2AB8E] border border-[#B87333]/60'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5 text-current" />
                  </div>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded mt-0.5 whitespace-nowrap ${
                      isActive
                        ? 'bg-[#165B45] text-[#FFD700] border border-[#FFD700]'
                        : 'bg-[#09231A] text-[#C2AB8E]'
                    }`}
                  >
                    {facility.name.split(' ')[0]} {isActive ? '[ACTIVE]' : ''}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="mt-2 text-xs text-[#C2AB8E] font-mono flex items-center justify-between">
            <span>Circuit trace lines map patient catchment vectors to active vans.</span>
            <span className="text-[#FFD700]">
              LATENCY: {result.solveTimeMs} ms
            </span>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: PHARMACY READINESS CHECKLIST ── */}
      <section className="bg-[#144837]/90 border border-[#B87333]/70 rounded-lg p-5 sm:p-6 shadow-[0_2px_14px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-bold text-[#EAD0AC] font-serif-display uppercase tracking-wide flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-[#FFD700]" />
              Pharmacy Component Readiness (Active Nodes)
            </h4>
            <p className="text-xs text-[#C2AB8E] mt-0.5">
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
                className={`p-4 rounded border text-xs ${
                  hasAlert
                    ? 'bg-[#09231A] border-[#D98C53] text-[#EAD0AC]'
                    : 'bg-[#165B45] border-[#FFD700]/60 text-[#EAD0AC]'
                }`}
              >
                <div className="flex items-center justify-between font-bold mb-2">
                  <span className="text-sm text-[#FFD700] font-serif-display">{fac.name}</span>
                  {hasAlert ? (
                    <span className="text-[10px] text-[#09231A] font-bold bg-[#D98C53] px-2 py-0.5 rounded font-mono">
                      DEPLETION_ALERT
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#09231A] font-bold bg-[#FFD700] px-2 py-0.5 rounded font-mono">
                      STOCKED
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-[#C2AB8E] space-y-1.5 pt-2 border-t border-[#B87333]/30 font-sans-tech">
                  <div className="flex items-center justify-between">
                    <span>Haloperidol (Antipsychotic):</span>
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
                        className="bg-[#09231A] border border-[#B87333] rounded px-1.5 py-0.5 text-[10px] text-[#FFD700]"
                      >
                        <option value="Adequate">Adequate</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Critical">Critical</option>
                      </select>
                    ) : (
                      <span className="font-semibold text-[#EAD0AC]">{fac.medicineStock.haloperidol}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Fluoxetine (Antidepressant):</span>
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
                        className="bg-[#09231A] border border-[#B87333] rounded px-1.5 py-0.5 text-[10px] text-[#FFD700]"
                      >
                        <option value="Adequate">Adequate</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Critical">Critical</option>
                      </select>
                    ) : (
                      <span className={`font-semibold ${fac.medicineStock.fluoxetine === 'Critical' ? 'text-[#D98C53] font-bold' : 'text-[#EAD0AC]'}`}>
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
                        className="bg-[#09231A] border border-[#B87333] rounded px-1.5 py-0.5 text-[10px] text-[#FFD700]"
                      >
                        <option value="Adequate">Adequate</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Critical">Critical</option>
                      </select>
                    ) : (
                      <span className="font-semibold text-[#EAD0AC]">{fac.medicineStock.valproate}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── SECTION 4: TECHNICAL REGISTER DRAWER ── */}
      <section className="border border-[#B87333]/50 rounded-lg overflow-hidden bg-[#09231A]">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full px-4 py-3 bg-[#09231A] hover:bg-[#144837] text-left flex items-center justify-between text-xs font-semibold text-[#EAD0AC] transition-colors cursor-pointer font-mono"
        >
          <span>// INSPECT EXACT TRANSPORTATION LP TABLEAU &amp; TRANSIT MATRICES</span>
          {showTechnicalDetails ? (
            <ChevronUp className="w-4 h-4 text-[#D98C53]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#D98C53]" />
          )}
        </button>

        {showTechnicalDetails && (
          <div className="p-4 space-y-3 bg-[#061812] border-t border-[#B87333]/40 text-xs text-[#EAD0AC]">
            <div className="bg-[#09231A] p-3 rounded border border-[#B87333]/30 space-y-1 font-mono">
              <p className="font-semibold text-[#FFD700]">Capacitated p-Median Two-Phase Primal Simplex LP:</p>
              <p className="text-[11px] text-[#C2AB8E]">
                min Z = ∑_&#123;i&#125; ∑_&#123;j&#125; d_i · c_&#123;ij&#125; · x_&#123;ij&#125; + M · ∑_&#123;i&#125; u_i
              </p>
              <p className="text-[11px] text-[#C2AB8E] mt-1 font-sans-tech">
                Subject to demand conservation, capacity ceiling, and budget P = {numVans}. Solved via exact Two-Phase Simplex in {result.solveTimeMs} ms.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left font-mono">
                <thead className="bg-[#09231A] text-[#FFD700] uppercase text-[10px] border-b border-[#B87333]/40">
                  <tr>
                    <th className="py-1.5 px-2">Block Node</th>
                    <th className="py-1.5 px-2 text-right">Population</th>
                    <th className="py-1.5 px-2 text-right">Burden dᵢ</th>
                    <th className="py-1.5 px-2">Assigned Hub</th>
                    <th className="py-1.5 px-2 text-right">Travel Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#B87333]/20">
                  {result.assignments.map((a, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 px-2 font-medium text-[#EAD0AC]">{blocks[a.blockId].name}</td>
                      <td className="py-1.5 px-2 text-right text-[#C2AB8E]">{blocks[a.blockId].population.toLocaleString()}</td>
                      <td className="py-1.5 px-2 text-right text-[#C2AB8E]">{a.demand}</td>
                      <td className="py-1.5 px-2 text-[#EAD0AC]">{facilities[a.facilityId].name}</td>
                      <td className="py-1.5 px-2 text-right font-bold text-[#FFD700]">{a.travelTime} min</td>
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
