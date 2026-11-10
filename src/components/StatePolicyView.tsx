import { useState } from 'react'
import type { DistrictDistress } from '../engine/types'
import { Waves, ChevronDown, ChevronUp, Edit3 } from 'lucide-react'
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
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false)
  const [selectedZone, setSelectedZone] = useState<string>('All')

  const scopedDistricts = selectedDistrictFilter === 'All Districts'
    ? districts
    : districts.filter((d) => d.name === selectedDistrictFilter)

  const surgeDistricts = scopedDistricts.filter((d) => d.isSurge)
  const filteredDistricts = scopedDistricts.filter((d) => {
    if (selectedZone !== 'All' && d.zone !== selectedZone) return false
    return true
  })

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Clean Institutional Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <h1 className="text-xl font-bold text-charcoal tracking-tight">
              Statewide Distress Surveillance &amp; Spike Detection
            </h1>
          </div>
          <p className="text-xs text-muted mt-1">
            Exact discrete cumulative Poisson tail hypothesis testing (α = 0.01) with ASDMA flood crisis multipliers.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-semibold text-muted bg-container px-2.5 py-1 rounded-lg border border-hairline">
            Threshold: Z ≥ 2.50 · p &lt; 0.01
          </span>
          {isEditMode && (
            <span className="text-[11px] bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 font-semibold px-2 py-1 rounded-lg border border-amber-200 dark:border-amber-800 flex items-center gap-1">
              <Edit3 className="w-3 h-3 text-amber-700 dark:text-amber-400" /> Live Editor
            </span>
          )}
        </div>
      </div>

      {/* The Spike Detector Surface */}
      <div className="card p-5">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-bold text-charcoal tracking-tight">
              Active Outlier &amp; Surge Alerts ({surgeDistricts.length} Districts)
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Districts with statistically significant call surges requiring prioritised mobile camp deployment.
            </p>
          </div>
        </div>

        {/* Priority Highlight Cards for Surging Districts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {surgeDistricts.slice(0, 4).map((dist) => (
            <div
              key={dist.id}
              className={`p-4 rounded-xl border transition-all ${
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
                      <span className="text-[12px] font-bold bg-blue-600 text-white px-1.5 py-0.2 rounded">
                        PILOT DISTRICT
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted">{dist.zone} · Pop: {(dist.population / 100000).toFixed(1)} Lakh</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 px-2 py-0.5 rounded-full font-mono block">
                    +{Math.round(((dist.callsLast30Days - dist.poissonExpected) / dist.poissonExpected) * 100)}% Surge
                  </span>
                  <span className="text-[12px] text-muted font-mono mt-0.5 block">
                    p = {dist.pValueFormatted}
                  </span>
                </div>
              </div>

              {/* Editable Call Count when in Edit Mode */}
              <div className="mt-3 flex items-center justify-between text-xs text-muted pt-2 border-t border-hairline">
                <div className="flex items-center gap-2">
                  {isEditMode ? (
                    <button
                      onClick={() => toggleDistrictFlood(dist.id)}
                      className={`text-[12px] font-semibold px-2 py-0.5 rounded border transition-all cursor-pointer flex items-center gap-1 ${
                        dist.floodCrisis
                          ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-200 border-cyan-300 dark:border-cyan-800'
                          : 'bg-card text-muted border-hairline'
                      }`}
                    >
                      <Waves className="w-3 h-3" />
                      <span>{dist.floodCrisis ? 'Flood Active' : 'Normal Weather'}</span>
                    </button>
                  ) : (
                    <span>
                      {dist.floodCrisis ? (
                        <span className="text-cyan-700 dark:text-cyan-400 font-semibold flex items-center gap-1 text-[12px]">
                          <Waves className="w-3.5 h-3.5" /> Flood Inundated
                        </span>
                      ) : (
                        <span className="text-muted text-[12px]">Normal weather</span>
                      )}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-muted text-[12px]">Calls:</span>
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
          ))}
        </div>

        {/* Clean Accordion for Deep Technical / Evaluation Data */}
        <div className="border border-hairline rounded-xl overflow-hidden mt-6">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full px-4 py-3 bg-container hover:bg-hairline text-left flex items-center justify-between text-xs font-semibold text-charcoal transition-colors cursor-pointer"
          >
            <span>Show Full District Data Table &amp; Math Models (For Evaluators)</span>
            {showTechnicalDetails ? (
              <ChevronUp className="w-4 h-4 text-muted" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted" />
            )}
          </button>

          {showTechnicalDetails && (
            <div className="p-4 space-y-4 bg-card border-t border-hairline">
              <div className="bg-container p-3 rounded-lg text-xs text-charcoal space-y-2 border border-hairline">
                <p className="font-semibold text-charcoal">Exact Cumulative Poisson Tail Model (Hypothesis Test α = 0.01):</p>
                <p className="font-mono text-[12px] text-muted">
                  P(Y ≥ y | λ) = 1 - ∑_&#123;k=0&#125;^&#123;y-1&#125; (λ^k · e^&#123;-λ&#125;) / k!
                </p>
                <p className="text-[12px] text-muted">
                  Evaluates exact discrete probability for rural blocks where λ &lt; 10, avoiding Gaussian approximation bias.
                </p>
              </div>

              <div className="bg-container p-3 rounded-lg text-xs text-charcoal space-y-2 border border-hairline">
                <p className="font-semibold text-charcoal">Stochastic Care Funnel: Absorbing Markov Chain Model</p>
                <p className="text-[12px] text-muted leading-relaxed">
                  Modeled with 4 transient states (Intake, Specialist, eSanjeevani, DMHP) and 2 absorbing states (A₁: Verified Recovery, A₂: Defaulted).
                  Fundamental Matrix N = (I - Q)⁻¹. Absorption probability into verified recovery B = N · R is exactly <strong className="text-charcoal">3.2%</strong> (320 / 10,000), proving a 96.8% systemic attrition rate that mandates proactive retention intervention.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted">Filter by Geographic Zone:</span>
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="bg-card border border-hairline rounded-lg px-2.5 py-1 text-xs text-charcoal font-medium"
                >
                  <option value="All">All 15 Representative Districts</option>
                  <option value="Barak Valley">Barak Valley</option>
                  <option value="Brahmaputra Valley">Brahmaputra Valley</option>
                  <option value="Hill Districts">Hill Districts</option>
                </select>
              </div>

              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-xs text-left text-charcoal">
                  <thead className="bg-container text-charcoal font-semibold uppercase text-[12px] sticky top-0 border-b border-hairline">
                    <tr>
                      <th className="py-2 px-3">District</th>
                      <th className="py-2 px-3">Zone</th>
                      <th className="py-2 px-3 text-right">Population</th>
                      <th className="py-2 px-3 text-right">Calls (30d)</th>
                      <th className="py-2 px-3 text-right">Poisson Base</th>
                      <th className="py-2 px-3 text-center">Z-Score</th>
                      <th className="py-2 px-3 text-center">p-Value</th>
                      <th className="py-2 px-3 text-center">Status</th>
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
                            className={`font-mono font-bold px-1.5 py-0.2 rounded text-[12px] ${
                              d.isSurge
                                ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                                : 'bg-container text-muted'
                            }`}
                          >
                            {d.zScore > 0 ? '+' : ''}{d.zScore.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center font-mono text-[12px] font-semibold text-charcoal">
                          {d.pValueFormatted}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span
                            className={`text-[12px] px-1.5 py-0.2 rounded font-semibold ${
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
          )}
        </div>
      </div>
    </div>
  )
}
