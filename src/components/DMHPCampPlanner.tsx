import { useState, useMemo } from 'react'
import { CACHAR_BLOCKS, CACHAR_FACILITIES, TRAVEL_TIME_MATRIX } from '../engine/cacharData'
import { solveCampAllocation } from '../engine/solver'
import { Play, Navigation, Pill, Gauge } from 'lucide-react'

export const DMHPCampPlanner = () => {
  const [numVans, setNumVans] = useState<number>(2)
  const [capacityMultiplier, setCapacityMultiplier] = useState<number>(1.0)
  const [includeFloodWeight, setIncludeFloodWeight] = useState<boolean>(true)
  const [, setSolverTrigger] = useState<number>(0)

  // Memoize solver output
  const result = useMemo(() => {
    return solveCampAllocation(
      CACHAR_BLOCKS,
      CACHAR_FACILITIES,
      TRAVEL_TIME_MATRIX,
      numVans,
      includeFloodWeight,
      capacityMultiplier
    )
  }, [numVans, includeFloodWeight, capacityMultiplier])

  const activeFacilities = CACHAR_FACILITIES.filter((f) => result.activeFacilityIds.includes(f.id))
  const baselineFacilities = CACHAR_FACILITIES.filter((f) => result.baselineActiveFacilityIds.includes(f.id))

  return (
    <div className="space-y-6">
      {/* Nodal Officer Context Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 flex items-start justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3">
          <Navigation className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold uppercase tracking-wider text-blue-800">Operational Planning Surface:</span>{' '}
            District Mental Health Programme (DMHP) nodal planning portal for <strong>Cachar District, Assam</strong> (Barak Valley).
            This tool eliminates subjective headquarters bias by solving a Capacitated $p$-Median Linear Program (MILP) to position mobile psychiatric camps where rural patient transit impedance is minimized.
          </div>
        </div>
        <div className="hidden sm:block text-right shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Solver Engine</span>
          <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
            COIN-OR HiGHS / {result.solveTimeMs} ms
          </span>
        </div>
      </div>

      {/* Main Grid: Controls & Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Parameter Controls */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Gauge className="w-4 h-4 text-blue-600" />
              Optimization Parameters
            </h2>
            <p className="text-xs text-slate-500">Configure district constraints for the upcoming 30-day operating cycle</p>
          </div>

          {/* Number of Mobile Vans (P) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700">Deployable Mobile Vans ($P$):</label>
              <span className="font-mono font-bold text-blue-600 text-sm">{numVans} Vans</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((val) => (
                <button
                  key={val}
                  onClick={() => setNumVans(val)}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                    numVans === val
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {val} {val === 1 ? 'Van' : 'Vans'}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">Budget constraint on concurrently deployable mobile units.</p>
          </div>

          {/* Intake Capacity per Camp */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700">Clinic Daily Intake Capacity ($K$):</label>
              <span className="font-mono font-bold text-slate-800 text-xs">{Math.round(80 * capacityMultiplier)} pts / camp</span>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.5"
              step="0.25"
              value={capacityMultiplier}
              onChange={(e) => setCapacityMultiplier(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>60 pts (Lean)</span>
              <span>80 pts (Standard)</span>
              <span>120 pts (Surge)</span>
            </div>
          </div>

          {/* Flood Crisis Weighting Toggle */}
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeFloodWeight}
                onChange={(e) => setIncludeFloodWeight(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 block">ASDMA Flood Inundation Multiplier</span>
                <span className="text-slate-500 text-[11px]">
                  Heavily weights flood-affected riverine circles (Katigorah: $1.8\times$, Sonai: $1.5\times$).
                </span>
              </div>
            </label>
          </div>

          <button
            onClick={() => setSolverTrigger((prev) => prev + 1)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Re-run Mathematical Optimizer
          </button>
        </div>

        {/* Middle & Right: The Empirical Benchmark Comparison */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Status Quo */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Status Quo (Intuitive HQ)
              </span>
              <div className="text-xl font-bold text-slate-700 font-mono">
                {result.baselineMeanTravelTime} <span className="text-xs font-normal text-slate-500">min</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Stationed at: {baselineFacilities.map((f) => f.name.split(' ')[0]).join(' + ')}
              </p>
            </div>

            {/* Optimal MILP */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                AMH-DSS Optimal Siting
              </span>
              <div className="text-xl font-bold text-emerald-700 font-mono">
                {result.meanTravelTime} <span className="text-xs font-normal text-emerald-600">min</span>
              </div>
              <p className="text-[11px] text-emerald-700 mt-1 font-medium">
                Sited at: {activeFacilities.map((f) => f.name.split(' ')[0]).join(' + ')}
              </p>
            </div>

            {/* Net Gain */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block mb-1">
                Net Travel Reduction
              </span>
              <div className="text-xl font-bold text-blue-700 font-mono">
                -{result.travelTimeReductionPct}%
              </div>
              <p className="text-[11px] text-blue-700 mt-1">
                Saves ~{Math.round(result.baselineMeanTravelTime - result.meanTravelTime)} min travel per rural patient
              </p>
            </div>
          </div>

          {/* Interactive Geospatial Schematic Map */}
          <div className="bg-slate-900 rounded-xl p-4 text-white shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-xs">
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white tracking-wide">CACHAR DISTRICT CATCHMENT SCHEMATIC</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span> Optimal Active Camp
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block"></span> Bypassed Facility
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded bg-amber-400 inline-block"></span> Demand Block
                </span>
              </div>
            </div>

            {/* Canvas Schematic */}
            <div className="relative w-full h-72 bg-slate-950/70 rounded-lg border border-slate-800 p-2 overflow-hidden">
              {/* Connecting Assignment Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {result.assignments.map((assign, idx) => {
                  const block = CACHAR_BLOCKS.find((b) => b.id === assign.blockId)
                  const fac = CACHAR_FACILITIES.find((f) => f.id === assign.facilityId)
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
                      strokeDasharray="3 3"
                      strokeOpacity="0.6"
                    />
                  )
                })}
              </svg>

              {/* Render Blocks */}
              {CACHAR_BLOCKS.map((block) => (
                <div
                  key={block.id}
                  style={{ left: `${block.coords.x}%`, top: `${block.coords.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center"
                >
                  <div className="w-3.5 h-3.5 rounded bg-amber-500/90 border border-amber-300 shadow-sm flex items-center justify-center text-[8px] font-bold text-slate-950">
                    B
                  </div>
                  <span className="text-[9px] font-medium text-slate-300 bg-slate-900/90 px-1 rounded mt-0.5 whitespace-nowrap shadow-xs">
                    {block.name}
                  </span>
                </div>
              ))}

              {/* Render Candidate Facilities */}
              {CACHAR_FACILITIES.map((facility) => {
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
                          ? 'bg-emerald-500 text-slate-950 font-bold border-2 border-white ring-4 ring-emerald-500/30 animate-pulse'
                          : 'bg-slate-700 text-slate-400 border border-slate-600'
                      }`}
                    >
                      <Navigation className="w-3 h-3" />
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded mt-0.5 whitespace-nowrap shadow-xs ${
                        isActive ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' : 'bg-slate-900/90 text-slate-400'
                      }`}
                    >
                      {facility.name.split(' ')[0]} {isActive ? '(ACTIVE)' : ''}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
              <span>District: Cachar (8 Blocks · Pop: 1.16M)</span>
              <span className="text-emerald-400 font-semibold font-mono">
                Objective Impedance: {result.totalImpedance.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Logistics & Drug Inventory Manifest */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Pill className="w-4 h-4 text-blue-600" />
              Active Mobile Camp Logistics & Psychotropic Drug Readiness
            </h3>
            <p className="text-xs text-slate-500">
              Operational manifest for the active mobile psychiatric vans and designated health hub pharmacies
            </p>
          </div>
          <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md font-semibold">
            {activeFacilities.length} Camps Mobilized
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-100 text-slate-800 font-semibold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Camp Location</th>
                <th className="py-2.5 px-3">Revenue Block</th>
                <th className="py-2.5 px-3">Assigned Catchment</th>
                <th className="py-2.5 px-3 text-right">Intake Capacity</th>
                <th className="py-2.5 px-3 text-right">Allocated Demand</th>
                <th className="py-2.5 px-3 text-center">Haloperidol</th>
                <th className="py-2.5 px-3 text-center">Fluoxetine</th>
                <th className="py-2.5 px-3 text-center">Sodium Valproate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeFacilities.map((fac) => {
                const catchment = result.assignments
                  .filter((a) => a.facilityId === fac.id)
                  .map((a) => CACHAR_BLOCKS[a.blockId].name)
                const totalAlloc = result.assignments
                  .filter((a) => a.facilityId === fac.id)
                  .reduce((sum, a) => sum + a.demand, 0)
                const effectiveCap = Math.round(fac.capacity * capacityMultiplier)

                return (
                  <tr key={fac.id} className="hover:bg-slate-50 font-medium">
                    <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      {fac.name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{fac.blockName}</td>
                    <td className="py-2.5 px-3 text-slate-800 font-semibold">
                      {catchment.join(', ')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">{effectiveCap}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-600">
                      {Math.round(totalAlloc)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          fac.medicineStock.haloperidol === 'Adequate'
                            ? 'bg-emerald-50 text-emerald-700'
                            : fac.medicineStock.haloperidol === 'Low Stock'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700 font-bold'
                        }`}
                      >
                        {fac.medicineStock.haloperidol}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          fac.medicineStock.fluoxetine === 'Adequate'
                            ? 'bg-emerald-50 text-emerald-700'
                            : fac.medicineStock.fluoxetine === 'Low Stock'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-100 text-rose-700 font-bold border border-rose-200'
                        }`}
                      >
                        {fac.medicineStock.fluoxetine}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          fac.medicineStock.valproate === 'Adequate'
                            ? 'bg-emerald-50 text-emerald-700'
                            : fac.medicineStock.valproate === 'Low Stock'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700 font-bold'
                        }`}
                      >
                        {fac.medicineStock.valproate}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
