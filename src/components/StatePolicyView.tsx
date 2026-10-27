import { useState } from 'react'
import { ASSAM_DISTRICTS, STATE_FUNNEL_DATA } from '../engine/stateSurveillance'
import { AlertTriangle, TrendingDown, PhoneCall, ShieldAlert, Waves } from 'lucide-react'

export const StatePolicyView = () => {
  const [selectedZone, setSelectedZone] = useState<string>('All')
  const [showOnlySurges, setShowOnlySurges] = useState<boolean>(false)

  const filteredDistricts = ASSAM_DISTRICTS.filter((d) => {
    if (selectedZone !== 'All' && d.zone !== selectedZone) return false
    if (showOnlySurges && !d.isSurge) return false
    return true
  })

  const totalSurgeCount = ASSAM_DISTRICTS.filter((d) => d.isSurge).length
  const totalFloodAffected = ASSAM_DISTRICTS.filter((d) => d.floodCrisis).length

  return (
    <div className="space-y-6">
      {/* Top Advisory Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3 shadow-xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold uppercase tracking-wider text-amber-800">Operational Decision Support Context:</span>{' '}
          This surface provides macro-level epidemiological and administrative surveillance for the State Mission Director.
          It isolates spatial distress surges and care attrition bottlenecks across Assam's 35 districts without ingesting or processing individual psychiatric diagnosis or PII.
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Tele-MANAS Inbound</span>
            <PhoneCall className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">10,000</div>
          <p className="text-xs text-slate-500 mt-1">Statewide monthly call cohort</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Verified Physical Care</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600">5.8%</div>
          <p className="text-xs text-slate-500 mt-1">
            <strong className="text-rose-600 font-semibold">94.2% drop-off</strong> across funnel
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Poisson Surge Alerts</span>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{totalSurgeCount} Districts</div>
          <p className="text-xs text-slate-500 mt-1">Statistically anomalous distress ($Z &gt; 2.5$)</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Flood Trauma Shocks</span>
            <Waves className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-bold text-cyan-600">{totalFloodAffected} Districts</div>
          <p className="text-xs text-slate-500 mt-1">Barak & Brahmaputra basin inundation</p>
        </div>
      </div>

      {/* The Tele-MANAS Blind-Spot Funnel Visualizer */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-blue-600" />
              The Care Retention Funnel & Attrition Bottlenecks
            </h2>
            <p className="text-xs text-slate-500">
              Tracking cohort attrition from initial telephone helpline intake to verified in-person DMHP care completion
            </p>
          </div>
          <div className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium border border-slate-200">
            Cohort N = 10,000 calls
          </div>
        </div>

        <div className="space-y-3">
          {STATE_FUNNEL_DATA.map((step, idx) => {
            const barWidth = `${step.conversionPct}%`
            const isCriticalDrop = step.dropPct > 40
            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium text-slate-800">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <span>{step.stage}</span>
                    <span className="text-slate-400 font-normal">({step.count.toLocaleString()} individuals)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {step.dropPct > 0 && (
                      <span className={`text-[11px] font-semibold ${isCriticalDrop ? 'text-rose-600' : 'text-slate-500'}`}>
                        {step.dropPct}% stage drop
                      </span>
                    )}
                    <span className="font-mono font-bold text-slate-900 w-12 text-right">
                      {step.conversionPct}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      idx === 0
                        ? 'bg-blue-600'
                        : idx < 3
                        ? 'bg-blue-500'
                        : idx === 3
                        ? 'bg-cyan-500'
                        : idx === 4
                        ? 'bg-amber-500'
                        : 'bg-emerald-600'
                    }`}
                    style={{ width: barWidth }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 pl-7">{step.description}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
          <strong className="text-slate-800">Policy Takeaway:</strong> Over 94% of individuals drop out before reaching verified physical DMHP care.
          AMH-DSS implements the closed-loop retention engine to capture the 434 consenting callers stalled between Stage 3 (Tier 2 Escalation) and Stage 5 (DMHP Visit) for proactive human follow-up.
        </div>
      </div>

      {/* Poisson Anomaly Surveillance Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/60">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Spatio-Temporal Poisson Anomaly Surveillance
            </h2>
            <p className="text-xs text-slate-500">
              Aggregated district-level distress signals. Anomalies flagged when standardized residual score $Z &gt; 2.5$.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium"
            >
              <option value="All">All Geographical Zones</option>
              <option value="Barak Valley">Barak Valley (Pilot Focus)</option>
              <option value="Brahmaputra Valley">Brahmaputra Valley</option>
              <option value="Hill Districts">Hill Districts</option>
            </select>

            <button
              onClick={() => setShowOnlySurges(!showOnlySurges)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                showOnlySurges
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {showOnlySurges ? 'Showing Surges Only (Z > 2.5)' : 'Filter Surges Only'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-100 text-slate-800 font-semibold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3">Zone</th>
                <th className="py-2.5 px-3 text-right">Population</th>
                <th className="py-2.5 px-3 text-right">Calls (30d)</th>
                <th className="py-2.5 px-3 text-right">Per 100k</th>
                <th className="py-2.5 px-3 text-right">Poisson Base</th>
                <th className="py-2.5 px-3 text-center">Z-Score</th>
                <th className="py-2.5 px-3 text-center">Flood Status</th>
                <th className="py-2.5 px-3 text-center">Camps Sited</th>
                <th className="py-2.5 px-3 text-center">Resource Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDistricts.map((d) => (
                <tr
                  key={d.id}
                  className={`hover:bg-slate-50 transition-colors ${
                    d.name === 'Cachar' || d.name === 'Kamrup Metropolitan' ? 'bg-blue-50/40 font-medium' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-semibold text-slate-900 flex items-center gap-1.5">
                    {d.name}
                    {(d.name === 'Cachar' || d.name === 'Kamrup Metropolitan') && (
                      <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-bold">
                        PILOT
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{d.zone}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">{d.population.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{d.callsLast30Days}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">{d.callsPer100k}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-500">{d.poissonExpected}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                        d.zScore >= 2.5
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      +{d.zScore.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {d.floodCrisis ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-700 bg-cyan-50 border border-cyan-200 px-1.5 py-0.5 rounded">
                        <Waves className="w-3 h-3" /> Inundated
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Normal</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-800">
                    {d.allocatedCamps}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        d.disparityGap === 'High Deficit'
                          ? 'bg-rose-100 text-rose-700 font-bold'
                          : d.disparityGap === 'Moderate'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {d.disparityGap}
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
