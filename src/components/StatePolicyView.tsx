import { useState } from 'react'
import type { DistrictDistress } from '../engine/types'
import { Waves, Edit3, Activity, ShieldCheck, MapPin } from 'lucide-react'
import { useScenarioData } from '../engine/scenarioDataContext'

interface StatePolicyViewProps {
  districts: DistrictDistress[]
  isEditMode: boolean
  updateDistrictCalls: (districtId: string, calls: number) => void
  toggleDistrictFlood: (districtId: string) => void
}

export const StatePolicyView = ({
  districts,
  isEditMode,
  updateDistrictCalls,
  toggleDistrictFlood,
}: StatePolicyViewProps) => {
  const { selectedDistrictFilter } = useScenarioData()
  const [selectedZone, setSelectedZone] = useState<string>('All')

  const scopedDistricts = selectedDistrictFilter === 'All Districts'
    ? districts
    : districts.filter((d) => d.name === selectedDistrictFilter)

  const surgeDistricts = scopedDistricts.filter((d) => d.isSurge)
  const filteredDistricts = scopedDistricts.filter((d) => {
    if (selectedZone !== 'All' && d.zone !== selectedZone) return false
    return true
  })

  // Geographic zone summary statistics
  const zones = ['Barak Valley', 'Brahmaputra Valley', 'Hill Districts'] as const
  const zoneStats = zones.map((z) => {
    const list = districts.filter((d) => d.zone === z)
    return {
      zone: z,
      totalCalls: list.reduce((acc, d) => acc + d.callsLast30Days, 0),
      surgeCount: list.filter((d) => d.isSurge).length,
      districtsCount: list.length,
    }
  })

  return (
    <div className="space-y-6 w-full">
      {/* Clean Institutional Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <h1 className="text-2xl font-bold text-charcoal tracking-tight">
              Statewide Distress Surveillance &amp; Spike Detection
            </h1>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Exact discrete cumulative Poisson tail hypothesis testing (α = 0.01) with ASDMA flood crisis multipliers.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-muted bg-container px-2.5 py-1 rounded-lg border border-hairline">
            Threshold: Z &ge; 2.50 &middot; p &lt; 0.01
          </span>
          {isEditMode && (
            <span className="text-xs bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 font-semibold px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800 flex items-center gap-1">
              <Edit3 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" /> Live Simulation
            </span>
          )}
        </div>
      </div>

      {/* Main 2-Column Split: Active Outlier Alerts (7 Cols) + Zone Telemetry (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (7 Cols / 58%): Active Outlier Alerts */}
        <section className="lg:col-span-7 card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div>
              <h2 className="text-base font-bold text-charcoal tracking-tight flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                Active Outlier Alerts ({surgeDistricts.length} Districts)
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Statistically anomalous call volumes requiring emergency mobile health camp deployment.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/80 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900">
              Spike Threshold Exceeded
            </span>
          </div>

          {surgeDistricts.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted">
              <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
              <p className="font-semibold text-charcoal">All districts operating within expected Poisson parameters.</p>
              <p className="mt-0.5">No critical outlier flags triggered for {selectedDistrictFilter}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {surgeDistricts.map((dist) => {
                const surgePct = Math.round(((dist.callsLast30Days - dist.poissonExpected) / dist.poissonExpected) * 100)
                const fillWidth = Math.min(100, Math.round((dist.callsLast30Days / (dist.poissonExpected * 2.2)) * 100))
                return (
                  <div
                    key={dist.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      dist.name === 'Cachar'
                        ? 'bg-blue-50/50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 ring-2 ring-blue-500/20'
                        : 'bg-container border-hairline'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-charcoal text-sm">{dist.name}</span>
                          {dist.name === 'Cachar' && (
                            <span className="text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.2 rounded">
                              PILOT
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-muted block mt-0.5">
                          {dist.zone} &middot; Pop: {(dist.population / 100000).toFixed(1)} Lakh
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/80 px-2 py-0.5 rounded-full font-mono block">
                          +{surgePct}%
                        </span>
                        <span className="text-[10px] text-muted font-mono mt-0.5 block">
                          Z = +{dist.zScore.toFixed(2)} &middot; {dist.pValueFormatted}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2">
                      <div className="flex justify-between text-[10px] font-mono text-muted mb-1">
                        <span>Base: {dist.poissonExpected}</span>
                        <span className="font-semibold text-charcoal">{dist.callsLast30Days} actual</span>
                      </div>
                      <div className="w-full bg-paper rounded-full h-1.5 overflow-hidden border border-hairline">
                        <div
                          className="bg-rose-500 h-1.5 rounded-full"
                          style={{ width: `${fillWidth}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Quick Stepper & Flood Toggle */}
                    <div className="mt-3 pt-2 border-t border-hairline flex items-center justify-between text-xs">
                      <div>
                        {isEditMode ? (
                          <button
                            onClick={() => toggleDistrictFlood(dist.id)}
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded border transition-all cursor-pointer flex items-center gap-1 ${
                              dist.floodCrisis
                                ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-200 border-cyan-300 dark:border-cyan-800'
                                : 'bg-card text-muted border-hairline'
                            }`}
                          >
                            <Waves className="w-3 h-3" />
                            <span>{dist.floodCrisis ? 'Flood Active' : 'Normal'}</span>
                          </button>
                        ) : (
                          <span>
                            {dist.floodCrisis ? (
                              <span className="text-cyan-700 dark:text-cyan-400 font-semibold flex items-center gap-1 text-[11px]">
                                <Waves className="w-3 h-3" /> Flood Inundated
                              </span>
                            ) : (
                              <span className="text-muted text-[11px]">Normal weather</span>
                            )}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-muted text-[11px]">Calls:</span>
                        {isEditMode ? (
                          <input
                            type="number"
                            min="0"
                            max="2000"
                            step="10"
                            value={dist.callsLast30Days}
                            onChange={(e) => updateDistrictCalls(dist.id, parseInt(e.target.value) || 0)}
                            className="w-16 px-1.5 py-0.5 border border-hairline bg-card rounded font-mono text-xs font-bold text-charcoal text-right focus:outline-blue-500"
                          />
                        ) : (
                          <span className="font-bold text-charcoal font-mono">{dist.callsLast30Days}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Right Column (5 Cols / 42%): Zone Telemetry & Anomaly Theory */}
        <section className="lg:col-span-5 space-y-4">
          {/* Geographic Zone Breakdown */}
          <div className="card p-5 space-y-3">
            <h2 className="text-base font-bold text-charcoal tracking-tight flex items-center justify-between border-b border-hairline pb-2.5">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Geographic Zone Distribution
              </span>
              <span className="text-xs text-muted">3 Regional Zones</span>
            </h2>

            <div className="space-y-2">
              {zoneStats.map((z) => (
                <div
                  key={z.zone}
                  className="p-3 rounded-xl border border-hairline bg-container flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-charcoal block">{z.zone}</span>
                    <span className="text-[11px] text-muted">{z.districtsCount} Districts Monitored</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-charcoal block">{z.totalCalls.toLocaleString()} calls</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      z.surgeCount > 0
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    }`}>
                      {z.surgeCount > 0 ? `${z.surgeCount} Surges` : 'Stable'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Anomaly Significance Scale */}
          <div className="card p-5 space-y-3">
            <h2 className="text-base font-bold text-charcoal tracking-tight flex items-center gap-2 border-b border-hairline pb-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Hypothesis Testing Significance Scale
            </h2>
            <div className="text-xs text-muted space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-container border border-hairline">
                <span className="font-semibold text-charcoal">Normal (p &ge; 0.05)</span>
                <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">Z &lt; 1.64</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-container border border-hairline">
                <span className="font-semibold text-charcoal">Elevated Caution (p &lt; 0.05)</span>
                <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">Z &ge; 1.96</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50/70 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900">
                <span className="font-semibold text-rose-900 dark:text-rose-200">Statutory Spike Alert (p &lt; 0.01)</span>
                <span className="font-mono text-rose-700 dark:text-rose-300 font-bold">Z &ge; 2.50</span>
              </div>
            </div>
            <p className="text-[11px] text-muted">
              Evaluates exact discrete tail probability for small rural numbers, avoiding the statistical distortion of naive Gaussian assumptions.
            </p>
          </div>
        </section>
      </div>

      {/* Full Statewide District Ledger & Evaluator Drawer */}
      <div className="card p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline pb-3">
          <div>
            <h3 className="text-base font-bold text-charcoal tracking-tight">
              Statewide District Ledger &amp; Poisson Surveillance Table
            </h3>
            <p className="text-xs text-muted mt-0.5">
              All 15 representative districts sorted by distress burden and flood crisis multipliers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Filter Zone:</span>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="bg-card border border-hairline rounded-lg px-2.5 py-1 text-xs text-charcoal font-medium cursor-pointer"
            >
              <option value="All">All 15 Districts</option>
              <option value="Barak Valley">Barak Valley</option>
              <option value="Brahmaputra Valley">Brahmaputra Valley</option>
              <option value="Hill Districts">Hill Districts</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-hairline">
          <table className="w-full text-xs text-left text-charcoal">
            <thead className="bg-container text-charcoal font-semibold uppercase text-[11px] sticky top-0 border-b border-hairline">
              <tr>
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3">Zone</th>
                <th className="py-2.5 px-3 text-right">Population</th>
                <th className="py-2.5 px-3 text-right">Calls (30d)</th>
                <th className="py-2.5 px-3 text-right">Poisson Base</th>
                <th className="py-2.5 px-3 text-center">Z-Score</th>
                <th className="py-2.5 px-3 text-center">p-Value</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filteredDistricts.map((d) => (
                <tr key={d.id} className="hover:bg-container/60 transition-colors">
                  <td className="py-2 px-3 font-semibold text-charcoal">{d.name}</td>
                  <td className="py-2 px-3 text-muted">{d.zone}</td>
                  <td className="py-2 px-3 text-right font-mono text-muted">{d.population.toLocaleString()}</td>
                  <td className="py-2 px-3 text-right">
                    {isEditMode ? (
                      <input
                        type="number"
                        min="0"
                        max="3000"
                        step="10"
                        value={d.callsLast30Days}
                        onChange={(e) => updateDistrictCalls(d.id, parseInt(e.target.value) || 0)}
                        className="w-16 px-1.5 py-0.5 border border-hairline bg-card rounded font-mono text-xs font-bold text-charcoal text-right focus:outline-blue-500"
                      />
                    ) : (
                      <span className="font-mono font-bold text-charcoal">{d.callsLast30Days}</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-muted">{d.poissonExpected}</td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`font-mono font-bold px-1.5 py-0.2 rounded text-[11px] ${
                        d.isSurge
                          ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                          : 'bg-container text-muted'
                      }`}
                    >
                      {d.zScore > 0 ? '+' : ''}{d.zScore.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center font-mono text-[11px] font-semibold text-charcoal">
                    {d.pValueFormatted}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`text-[11px] px-1.5 py-0.2 rounded font-semibold ${
                        d.isSurge
                          ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold'
                          : 'bg-container text-muted'
                      }`}
                    >
                      {d.isSurge ? 'Surge (p < 0.01)' : 'Normal'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
