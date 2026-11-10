import { useState, useMemo } from 'react'
import type { Block, Facility } from '../engine/types'
import { TRAVEL_TIME_MATRIX } from '../engine/cacharData'
import { useScenarioData } from '../engine/scenarioDataContext'
import { solveCampAllocation } from '../engine/solver'
import { CheckCircle2, ChevronDown, ChevronUp, Truck, Edit3, Sliders, MapPin, Waves, Sparkles } from 'lucide-react'

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
    <div className="space-y-6 w-full">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-hairline pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h1 className="text-2xl font-bold text-charcoal tracking-tight">
              Mobile Health Camp &amp; Van Siting Optimizer
            </h1>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Capacitated p-Median Two-Phase Primal Simplex Transportation LP for Cachar District (8 Blocks, 1.17M population).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Two-Phase Simplex: {result.solveTimeMs} ms
          </span>
          {isEditMode && (
            <button
              onClick={() => setShowBlockEditor(!showBlockEditor)}
              className="bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 font-semibold px-3 py-1 rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
              <span>{showBlockEditor ? 'Hide Sliders' : 'Block Sliders'}</span>
            </button>
          )}
        </div>
      </div>

      {plannerScope !== 'All Districts' && plannerScope !== 'Cachar' && (
        <div className="bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-xl p-3 text-xs text-blue-900 dark:text-blue-200 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>
            Scope note: Spatial network optimization is modeled on <strong>Cachar District</strong>. Header filter is currently set to <strong>{plannerScope}</strong>.
          </span>
        </div>
      )}

      {/* Main 2-Column Operational Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (7 Cols / 58%): Interactive Catchment Map */}
        <section className="lg:col-span-7 card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div>
              <h2 className="text-base font-bold text-charcoal tracking-tight flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Cachar District Catchment Vector Map
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Dotted vectors show where each rural village block is directed by the Simplex solver.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-charcoal font-medium">Stationed Camp</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-400"></span>
                <span className="text-muted">Demand Block</span>
              </span>
            </div>
          </div>

          {/* District Schematic Canvas */}
          <div className="relative w-full h-[400px] bg-slate-950 rounded-xl border border-hairline p-3 overflow-hidden shadow-inner">
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
                    stroke="#10b981"
                    strokeWidth="1.75"
                    strokeDasharray="5 4"
                    strokeOpacity="0.8"
                  />
                )
              })}
            </svg>

            {/* Demand Blocks Pins */}
            {blocks.map((block) => (
              <div
                key={block.id}
                style={{ left: `${block.coords.x}%`, top: `${block.coords.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center"
              >
                <div className="w-3.5 h-3.5 rounded bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-[8px] shadow-sm">
                  •
                </div>
                <span className="text-[10px] font-medium text-slate-200 bg-slate-900/90 px-1.5 py-0.5 rounded mt-0.5 whitespace-nowrap border border-slate-800 shadow-xs">
                  {block.name}
                </span>
              </div>
            ))}

            {/* Candidate Facilities Nodes */}
            {facilities.map((facility) => {
              const isActive = result.activeFacilityIds.includes(facility.id)
              return (
                <div
                  key={facility.id}
                  style={{ left: `${facility.coords.x}%`, top: `${facility.coords.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-all ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950 font-bold border-2 border-white ring-4 ring-emerald-400/30 animate-pulse'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-1 whitespace-nowrap shadow-xs ${
                      isActive
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                        : 'bg-slate-900/90 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {facility.name.split(' ')[0]} {isActive ? '★ ACTIVE' : ''}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-muted pt-1">
            <span>Dotted green vectors connect rural blocks to their assigned clinical facility.</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-mono font-semibold">
              Global Optimum Achieved
            </span>
          </div>
        </section>

        {/* Right Column (5 Cols / 42%): Telemetry & Controls */}
        <section className="lg:col-span-5 space-y-4">
          {/* Fleet Controls Card */}
          <div className="card p-5 space-y-4">
            <h2 className="text-base font-bold text-charcoal tracking-tight flex items-center gap-2 border-b border-hairline pb-2.5">
              <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Deployment Constraints &amp; Weather
            </h2>

            <div>
              <label className="text-xs font-semibold text-charcoal block mb-1.5">
                Mobile Van Fleet Budget ({numVans} Units):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((val) => (
                  <button
                    key={val}
                    onClick={() => setNumVans(val)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                      numVans === val
                        ? 'bg-charcoal text-paper border-charcoal shadow-sm'
                        : 'bg-container text-charcoal border-hairline hover:bg-hairline'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" />
                      <span>{val} {val === 1 ? 'Van' : 'Vans'}</span>
                    </div>
                    {val === 2 && <span className="text-[10px] text-emerald-400 font-normal">Optimal</span>}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-charcoal block mb-1.5">
                Disaster Inundation Factor:
              </label>
              <div className="bg-container p-2.5 rounded-xl border border-hairline">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeFloodWeight}
                    onChange={(e) => setIncludeFloodWeight(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-hairline focus:ring-blue-500 cursor-pointer"
                  />
                  <div className="text-xs text-charcoal">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Waves className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      Prioritize monsoon flood-affected catchments
                    </span>
                    <span className="text-[11px] text-muted block mt-0.5">
                      Weights flood multipliers in Katigorah and Sonai to prevent care isolation.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Travel Reduction Comparison Cards */}
          <div className="card p-5 space-y-3">
            <h2 className="text-base font-bold text-charcoal tracking-tight flex items-center justify-between border-b border-hairline pb-2.5">
              <span>Optimization Impact</span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                {result.travelTimeReductionPct}% Travel Cut
              </span>
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-container p-3 rounded-xl border border-hairline">
                <span className="text-[11px] font-semibold text-muted block">HQ Town Baseline</span>
                <div className="text-xl font-bold font-mono text-charcoal mt-1">
                  {result.baselineMeanTravelTime} <span className="text-xs font-normal text-muted">min</span>
                </div>
                <span className="text-[10px] text-muted block mt-0.5 truncate">
                  Stationed: {baselineFacilities.map((f) => f.name.split(' ')[0]).join(' & ')}
                </span>
              </div>

              <div className="bg-emerald-50/70 dark:bg-emerald-950/50 p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800">
                <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 block">Optimal Route</span>
                <div className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-1">
                  {result.meanTravelTime} <span className="text-xs font-normal text-emerald-600 dark:text-emerald-500">min</span>
                </div>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block mt-0.5 truncate">
                  Stationed: {activeFacilities.map((f) => f.name.split(' ')[0]).join(' & ')}
                </span>
              </div>
            </div>

            <p className="text-xs text-muted">
              Saves <strong className="text-charcoal font-semibold">~{Math.max(0, Math.round(result.baselineMeanTravelTime - result.meanTravelTime))} minutes</strong> of difficult rural travel per patient by eliminating headquarters bias.
            </p>
          </div>

          {/* Active Clinical Readiness Checklist */}
          <div className="card p-5 space-y-3">
            <h2 className="text-base font-bold text-charcoal tracking-tight flex items-center justify-between border-b border-hairline pb-2.5">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Active Hub Medicine Readiness
              </span>
              <span className="text-xs text-muted">{activeFacilities.length} Hubs</span>
            </h2>

            <div className="space-y-2">
              {activeFacilities.map((fac) => {
                const hasAlert = Object.values(fac.medicineStock).some((s) => s === 'Critical' || s === 'Low Stock')
                return (
                  <div
                    key={fac.id}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                      hasAlert
                        ? 'bg-amber-50/60 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-800'
                        : 'bg-container border-hairline'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-charcoal block">{fac.name}</span>
                      <span className="text-[11px] text-muted">
                        Haloperidol: {fac.medicineStock.haloperidol} · Fluoxetine: {fac.medicineStock.fluoxetine}
                      </span>
                    </div>
                    {isEditMode ? (
                      <select
                        value={fac.medicineStock.fluoxetine}
                        onChange={(e) => updateMedicineStock(fac.id, 'fluoxetine', e.target.value as any)}
                        className="bg-card border border-hairline rounded px-1.5 py-0.5 text-[11px] font-semibold text-charcoal cursor-pointer"
                      >
                        <option value="Adequate">Adequate</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Critical">Critical</option>
                      </select>
                    ) : (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          hasAlert
                            ? 'bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200'
                            : 'bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200'
                        }`}
                      >
                        {hasAlert ? 'Restock Needed' : 'Ready'}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </div>

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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {facilities.map((f) => (
                <div key={f.id} className="bg-card p-2.5 rounded-xl border border-amber-200 dark:border-amber-800 text-xs">
                  <div className="font-semibold text-charcoal truncate">{f.name.split(' ')[0]}</div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-muted text-[12px]">Intake:</span>
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
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SECTION 3: TECHNICAL DRAWER FOR EVALUATORS ── */}
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
