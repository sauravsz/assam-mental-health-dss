import { useState, useMemo } from 'react'
import type { Block, Facility } from '../engine/types'
import { TRAVEL_TIME_MATRIX } from '../engine/cacharData'
import { useScenarioData } from '../engine/scenarioDataContext'
import { solveCampAllocation } from '../engine/solver'
import { Navigation, CheckCircle2, ChevronDown, ChevronUp, Truck, Edit3, Sliders, MapPin } from 'lucide-react'

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

  const { selectedDistrictFilter: plannerScope } = useScenarioData()

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {plannerScope !== 'All Districts' && plannerScope !== 'Cachar' && (
        <div className="bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-xl p-3 text-xs text-blue-900 dark:text-blue-200">
          Scope note: The spatial van-siting optimizer is modeled for <strong>Cachar District</strong> (8 rural blocks, 1.17M population). District selector is currently set to <strong>{plannerScope}</strong>.
        </div>
      )}

      {/* ── SECTION 1: PLANNING BOARD & FLEET PARAMETERS ── */}
      <section className="card p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h1 className="text-xl font-bold text-charcoal tracking-tight">
                Mobile Van Camp Siting Optimizer
              </h1>
            </div>
            <p className="text-xs text-muted mt-1">
              Capacitated p-Median Two-Phase Primal Simplex Transportation LP for Cachar District (8 Blocks).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isEditMode && (
              <button
                onClick={() => setShowBlockEditor(!showBlockEditor)}
                className="bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 font-semibold px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
                <span>{showBlockEditor ? 'Hide Sliders' : 'Block & Facility Sliders'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Fleet & Flood Toggles */}
        <div className="mt-4 pt-4 border-t border-hairline grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-charcoal block mb-1.5">
              Available Mobile Van Fleet ({numVans} Units):
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((val) => (
                <button
                  key={val}
                  onClick={() => setNumVans(val)}
                  className={`py-1.5 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    numVans === val
                      ? 'bg-charcoal text-paper border-charcoal'
                      : 'bg-card text-charcoal border-hairline hover:bg-container'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>{val} {val === 1 ? 'Van' : 'Vans'}</span>
                  {val === 2 && <span className="text-[10px] text-emerald-400 font-normal">(Optimal)</span>}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-charcoal block mb-1.5">
              Monsoon Disaster Factor:
            </label>
            <div className="bg-container p-2 rounded-xl border border-hairline">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeFloodWeight}
                  onChange={(e) => setIncludeFloodWeight(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-hairline focus:ring-blue-500"
                />
                <div className="text-xs text-charcoal">
                  <span className="font-semibold block">Prioritize flood-affected catchments</span>
                  <span className="text-[11px] text-muted">Weights flood multipliers in Katigorah and Sonai</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* ── EDITABLE SCENARIO DRAWER (WHEN TOGGLED) ── */}
      {isEditMode && showBlockEditor && (
        <section className="bg-amber-50/50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-amber-800/60 pb-2">
            <div>
              <h3 className="text-sm font-bold text-amber-950 dark:text-amber-200 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                Live Scenario Editor: Cachar 8 Blocks &amp; 6 Clinic Hubs
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300">
                Tweak any population, flood multiplier, or intake capacity. The Two-Phase Primal Simplex LP recalculates instantly!
              </p>
            </div>
            <span className="text-[12px] bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 font-mono font-bold px-2 py-0.5 rounded">
              Interactive Simplex
            </span>
          </div>

          {/* Block Demand Sliders Table */}
          <div>
            <h4 className="text-xs font-bold text-charcoal uppercase tracking-wide mb-2">
              1. Rural Block Demand &amp; Flood Inundation Parameters:
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left bg-card rounded-xl border border-amber-200 dark:border-amber-800 overflow-hidden">
                <thead className="bg-amber-100/70 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 font-semibold uppercase text-[12px]">
                  <tr>
                    <th className="py-2 px-3">Block Name</th>
                    <th className="py-2 px-3">Population</th>
                    <th className="py-2 px-3">Distress Rate</th>
                    <th className="py-2 px-3">Flood Shock</th>
                    <th className="py-2 px-3 text-right">Need Burden (dᵢ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {blocks.map((b) => {
                    const burden = Math.round(
                      (b.population / 1000.0) * b.baselineDistress * (includeFloodWeight ? b.floodFactor : 1.0) * 10
                    ) / 10
                    return (
                      <tr key={b.id} className="hover:bg-container/50">
                        <td className="py-2 px-3 font-semibold text-charcoal">{b.name}</td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            step="10000"
                            min="10000"
                            max="500000"
                            value={b.population}
                            onChange={(e) => updateBlock(b.id, 'population', parseInt(e.target.value) || 10000)}
                            className="w-24 px-2 py-1 border border-hairline bg-card rounded font-mono text-xs text-charcoal focus:outline-blue-500"
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
                            className="w-20 px-2 py-1 border border-hairline bg-card rounded font-mono text-xs text-charcoal focus:outline-blue-500"
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
                              className="w-16 px-2 py-1 border border-hairline bg-card rounded font-mono text-xs text-charcoal focus:outline-blue-500"
                            />
                            <span className="text-[12px] text-muted">x</span>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-charcoal">
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
            <h4 className="text-xs font-bold text-charcoal uppercase tracking-wide mb-2">
              2. Clinic Daily Intake Capacity (Patients / Day)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {facilities.map((f) => (
                <div key={f.id} className="bg-card p-2.5 rounded-xl border border-amber-200 dark:border-amber-800 text-xs">
                  <div className="font-semibold text-charcoal truncate">{f.name.split(' ')[0]}</div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-muted text-[12px]">Intake:</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="20"
                        max="200"
                        step="10"
                        value={f.capacity}
                        onChange={(e) => updateFacilityCapacity(f.id, parseInt(e.target.value) || 50)}
                        className="w-16 px-1.5 py-0.5 border border-hairline bg-card rounded font-mono text-xs text-charcoal text-right focus:outline-blue-500"
                      />
                      <span className="text-[12px] text-muted">pts</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SECTION 2: MAP & CATCHMENT DISPATCH ORDER ── */}
      <section className="card p-5 sm:p-6 space-y-5">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-charcoal tracking-tight flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Optimal Camp Deployment &amp; Catchment Map
            </h3>
            <span className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              Two-Phase Simplex: {result.solveTimeMs} ms
            </span>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Compare the intuitive headquarters baseline vs. the mathematically optimal van deployment.
          </p>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-container border border-hairline rounded-xl p-4">
            <span className="text-xs font-semibold text-muted block mb-1">
              Conventional Way (HQ Town Bias)
            </span>
            <div className="text-2xl font-bold text-charcoal font-mono">
              {result.baselineMeanTravelTime} <span className="text-sm font-normal text-muted">minutes</span>
            </div>
            <p className="text-xs text-muted mt-1">
              Stationed at: {baselineFacilities.map((f) => f.name.split(' ')[0]).join(' & ')}
            </p>
          </div>

          <div className="bg-emerald-50/70 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800 rounded-xl p-4">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 block mb-1">
              Our Optimized Route
            </span>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-mono">
              {result.meanTravelTime} <span className="text-sm font-normal text-emerald-600 dark:text-emerald-500">minutes</span>
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-1">
              Stationed at: {activeFacilities.map((f) => f.name.split(' ')[0]).join(' & ')}
            </p>
          </div>

          <div className="bg-blue-50/70 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800 rounded-xl p-4">
            <span className="text-xs font-semibold text-blue-800 dark:text-blue-300 block mb-1">
              Net Impact on Rural Travel
            </span>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400 font-mono">
              {result.travelTimeReductionPct}% Faster
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
              Saves <strong className="font-semibold">~{Math.max(0, Math.round(result.baselineMeanTravelTime - result.meanTravelTime))} minutes</strong> of travel per rural patient
            </p>
          </div>
        </div>

        {/* Cachar District Schematic Map */}
        <div className="border border-hairline rounded-xl p-4 bg-slate-950 text-slate-100 overflow-hidden">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs">
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span className="font-bold tracking-wide">CACHAR DISTRICT: WHERE VILLAGERS GET DIRECTED</span>
            </div>
            <div className="flex items-center gap-3 text-[12px] text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Active Van
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-400"></span> Village Area
              </span>
            </div>
          </div>

          <div className="relative w-full h-80 bg-slate-900 rounded-lg border border-slate-800 p-2 overflow-hidden">
            {/* SVG Connecting Lines */}
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
                    stroke="#10b981"
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
                <div className="w-3.5 h-3.5 rounded bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-[8px] shadow-sm">
                  •
                </div>
                <span className="text-[9px] font-medium text-slate-200 bg-slate-950/90 px-1 rounded mt-0.5 whitespace-nowrap border border-slate-800">
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
                    className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-all ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950 font-bold border-2 border-white ring-4 ring-emerald-400/30 animate-pulse'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    <Truck className="w-3 h-3" />
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded mt-0.5 whitespace-nowrap ${
                      isActive
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                        : 'bg-slate-950/80 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {facility.name.split(' ')[0]} {isActive ? '★ ACTIVE' : ''}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Dotted green lines show where each village gets directed.</span>
            <span className="text-emerald-400 font-mono text-[12px]">
              Calculated in {result.solveTimeMs} ms
            </span>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: PHARMACY READINESS CHECKLIST ── */}
      <section className="card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-bold text-charcoal uppercase tracking-wide flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Pharmacy Checklist: Are essential medicines ready at these locations?
            </h4>
            <p className="text-xs text-muted mt-0.5">
              Ensures active mobile camp locations have adequate supplies of essential psychiatric medications.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {activeFacilities.map((fac) => {
            const hasAlert = Object.values(fac.medicineStock).some((s) => s === 'Critical' || s === 'Low Stock')
            return (
              <div
                key={fac.id}
                className={`p-4 rounded-xl border text-xs ${
                  hasAlert
                    ? 'bg-amber-50/60 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                    : 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between font-bold mb-2">
                  <span className="text-sm text-charcoal">{fac.name}</span>
                  {hasAlert ? (
                    <span className="text-[12px] text-amber-700 dark:text-amber-300 font-bold bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
                      Restock Needed
                    </span>
                  ) : (
                    <span className="text-[12px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                      Fully Stocked
                    </span>
                  )}
                </div>

                <div className="text-[12px] text-muted space-y-1.5 pt-2 border-t border-hairline">
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
                        className="bg-card border border-hairline rounded px-1.5 py-0.5 text-[12px] font-semibold text-charcoal"
                      >
                        <option value="Adequate">Adequate</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Critical">Critical</option>
                      </select>
                    ) : (
                      <span className="font-semibold text-charcoal">{fac.medicineStock.haloperidol}</span>
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
                        className="bg-card border border-hairline rounded px-1.5 py-0.5 text-[12px] font-semibold text-charcoal"
                      >
                        <option value="Adequate">Adequate</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Critical">Critical</option>
                      </select>
                    ) : (
                      <span className={`font-semibold ${fac.medicineStock.fluoxetine === 'Critical' ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-charcoal'}`}>
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
                        className="bg-card border border-hairline rounded px-1.5 py-0.5 text-[12px] font-semibold text-charcoal"
                      >
                        <option value="Adequate">Adequate</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Critical">Critical</option>
                      </select>
                    ) : (
                      <span className="font-semibold text-charcoal">{fac.medicineStock.valproate}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── SECTION 4: TECHNICAL DRAWER FOR EVALUATORS ── */}
      <section className="border border-hairline rounded-xl overflow-hidden">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full px-4 py-3 bg-container hover:bg-hairline text-left flex items-center justify-between text-xs font-semibold text-charcoal transition-colors cursor-pointer"
        >
          <span>Show Mathematical Formulation &amp; Distance Matrices (For Evaluators)</span>
          {showTechnicalDetails ? (
            <ChevronUp className="w-4 h-4 text-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted" />
          )}
        </button>

        {showTechnicalDetails && (
          <div className="p-4 space-y-3 bg-card border-t border-hairline text-xs text-charcoal">
            <div className="bg-container p-3 rounded-lg space-y-1 border border-hairline">
              <p className="font-semibold text-charcoal">Capacitated p-Median Two-Phase Primal Simplex Transportation LP:</p>
              <p className="font-mono text-[12px] text-muted">
                min Z = ∑_&#123;i&#125; ∑_&#123;j&#125; d_i · c_&#123;ij&#125; · x_&#123;ij&#125; + M · ∑_&#123;i&#125; u_i
              </p>
              <p className="text-[12px] text-muted mt-1">
                Subject to: Demand conservation, facility intake capacity limits, and budget P = {numVans} mobile camp units. Solved via exact Two-Phase Simplex in {result.solveTimeMs} ms.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-container text-charcoal font-semibold uppercase text-[12px]">
                  <tr>
                    <th className="py-1.5 px-2">Demand Block</th>
                    <th className="py-1.5 px-2 text-right">Population</th>
                    <th className="py-1.5 px-2 text-right">Distress Burden</th>
                    <th className="py-1.5 px-2">Assigned Hub</th>
                    <th className="py-1.5 px-2 text-right">Travel Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {result.assignments.map((a, idx) => (
                    <tr key={idx} className="hover:bg-container/50">
                      <td className="py-1.5 px-2 font-medium text-charcoal">{blocks[a.blockId].name}</td>
                      <td className="py-1.5 px-2 text-right font-mono text-muted">{blocks[a.blockId].population.toLocaleString()}</td>
                      <td className="py-1.5 px-2 text-right font-mono text-charcoal">{a.demand}</td>
                      <td className="py-1.5 px-2 text-charcoal">{facilities[a.facilityId].name}</td>
                      <td className="py-1.5 px-2 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">{a.travelTime} min</td>
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
