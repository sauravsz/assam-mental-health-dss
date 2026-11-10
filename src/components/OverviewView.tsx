import { useScenarioData } from '../engine/scenarioDataContext'
import { ArrowRight, CheckCircle2, PhoneCall, Pill, MapPin, Waves, Activity } from 'lucide-react'

export const OverviewView = ({ onNavigate }: { onNavigate: (v: 'state' | 'planner' | 'queue' | 'audit' | 'overview' | 'pharmacy' | 'method') => void }) => {
  const { districts, referrals, drugMetrics, drugRecommendations, selectedDistrictFilter } = useScenarioData()

  const scoped = selectedDistrictFilter === 'All Districts'
    ? districts
    : districts.filter((d) => d.name === selectedDistrictFilter)

  const scopedReferrals = selectedDistrictFilter === 'All Districts'
    ? referrals
    : referrals.filter((r) => r.district === selectedDistrictFilter)

  const surgeDistricts = scoped.filter((d) => d.isSurge)
  const totalCalls = scoped.reduce((a, d) => a + d.callsLast30Days, 0)
  const stalled = scopedReferrals.filter((r) => r.status === 'Stalled').length
  const criticalDrugs = drugMetrics.filter((m) => m.status === 'Critical')
  const immediateTransfers = drugRecommendations.filter((r) => r.urgency === 'Immediate')

  return (
    <div className="space-y-6 w-full">
      {/* Executive Command Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-hairline pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-charcoal">
            Executive Command Cockpit
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Real-time Tele-MANAS distress surveillance, stalled care retention, and pharmaceutical supply chain for <strong>{selectedDistrictFilter}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-muted bg-container px-2.5 py-1 rounded-lg border border-hairline flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Surveillance Engine Active
          </span>
        </div>
      </div>

      {/* 4-Card Balanced KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Tele-MANAS Inflow</span>
            <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold tnum text-charcoal font-mono">{totalCalls.toLocaleString()}</div>
            <div className="text-[11px] text-muted mt-0.5 flex items-center justify-between">
              <span>Calls logged (30d)</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">100% Salted SHA-256</span>
            </div>
          </div>
        </div>

        <div className="card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Surge Outliers</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300">
              p &lt; 0.01
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold tnum text-rose-600 dark:text-rose-400 font-mono">{surgeDistricts.length}</div>
            <div className="text-[11px] text-muted mt-0.5 flex items-center justify-between">
              <span>Districts with spike alert</span>
              <span className="text-rose-600 dark:text-rose-400 font-medium">{surgeDistricts.length > 0 ? 'Action Prompt' : 'Normal'}</span>
            </div>
          </div>
        </div>

        <div className="card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Stalled Care Queue</span>
            <PhoneCall className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold tnum text-amber-600 dark:text-amber-400 font-mono">{stalled}</div>
            <div className="text-[11px] text-muted mt-0.5 flex items-center justify-between">
              <span>&gt;14 days without clinic visit</span>
              <span className="text-amber-700 dark:text-amber-400 font-medium">Human follow-up</span>
            </div>
          </div>
        </div>

        <div className="card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Critical Medicines</span>
            <Pill className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold tnum text-charcoal font-mono">{criticalDrugs.length}</div>
            <div className="text-[11px] text-muted mt-0.5 flex items-center justify-between">
              <span>Facilities &lt;15 days cover</span>
              <span className="text-teal-700 dark:text-teal-400 font-medium">{immediateTransfers.length} Immediate ({drugRecommendations.length} Rebalances)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Command Split Canvas: 7 Columns (Left) + 5 Columns (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Outlier Distress Surveillance & Hotspots (7 Cols) */}
        <section className="lg:col-span-7 space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3 border-b border-hairline pb-3">
              <div>
                <h2 className="text-base font-bold text-charcoal tracking-tight flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Statistically Significant Distress Anomalies
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Discrete Poisson tail surveillance (Z ≥ 2.50, p &lt; 0.01) factoring in monsoon flood multipliers.
                </p>
              </div>
              <button
                onClick={() => onNavigate('state')}
                className="text-xs font-semibold text-charcoal hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Full Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {surgeDistricts.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                <p className="font-semibold text-charcoal">All districts within normal Poisson variance.</p>
                <p className="mt-0.5">No statutory spike thresholds breached for {selectedDistrictFilter}.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {surgeDistricts.map((d) => {
                  const surgePct = Math.round(((d.callsLast30Days - d.poissonExpected) / d.poissonExpected) * 100)
                  const fillWidth = Math.min(100, Math.round((d.callsLast30Days / (d.poissonExpected * 2.2)) * 100))
                  return (
                    <div
                      key={d.id}
                      className="p-3.5 rounded-xl border border-hairline bg-container hover:bg-hairline/60 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-charcoal text-sm">{d.name}</span>
                            {d.name === 'Cachar' && (
                              <span className="text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.2 rounded">
                                PILOT
                              </span>
                            )}
                            {d.floodCrisis && (
                              <span className="text-[10px] font-semibold text-cyan-800 dark:text-cyan-200 bg-cyan-100 dark:bg-cyan-950 px-1.5 py-0.2 rounded border border-cyan-300 dark:border-cyan-800 flex items-center gap-1">
                                <Waves className="w-2.5 h-2.5" /> Flood Multiplier
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted mt-0.5 block">
                            {d.zone} · Population: {(d.population / 100000).toFixed(1)} Lakh
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 font-mono">
                            +{surgePct}% Spike
                          </span>
                          <span className="text-[11px] text-muted font-mono block">
                            Z = +{d.zScore.toFixed(2)} · {d.pValueFormatted}
                          </span>
                        </div>
                      </div>

                      {/* Visual Poisson Surge Meter */}
                      <div className="mt-2.5">
                        <div className="flex justify-between text-[11px] font-mono text-muted mb-1">
                          <span>Baseline: {d.poissonExpected} calls</span>
                          <span className="font-semibold text-charcoal">{d.callsLast30Days} actual calls</span>
                        </div>
                        <div className="w-full bg-paper rounded-full h-2 overflow-hidden border border-hairline">
                          <div
                            className="bg-rose-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${fillWidth}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick Van Deployment Intelligence Banner */}
          <div className="card p-4 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                  Cachar District Mobile Van Optimization
                </h3>
                <p className="text-[12px] text-emerald-800 dark:text-emerald-300 mt-0.5">
                  Two-Phase Simplex routing saves ~16 minutes per patient (31.0% faster than HQ town baseline).
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('planner')}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 cursor-pointer transition-colors"
            >
              View Catchment Map
            </button>
          </div>
        </section>

        {/* Right Column: Urgent Action Center (5 Cols) */}
        <section className="lg:col-span-5 space-y-4">
          {/* Stalled Care Retention Card */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3 border-b border-hairline pb-3">
              <div>
                <h2 className="text-base font-bold text-charcoal tracking-tight flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Stalled Care Outreach Queue
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Counsellor callbacks (&gt;14 days stalled without hospital check-in).
                </p>
              </div>
              <button
                onClick={() => onNavigate('queue')}
                className="text-xs font-semibold text-charcoal hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>View All ({stalled})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {scopedReferrals.filter((r) => r.status === 'Stalled').length === 0 ? (
              <p className="text-xs text-muted p-4 text-center">No stalled referrals in current scope.</p>
            ) : (
              <div className="space-y-2.5">
                {scopedReferrals
                  .filter((r) => r.status === 'Stalled')
                  .slice(0, 3)
                  .map((r) => (
                    <div
                      key={r.id}
                      className="p-3 rounded-xl border border-hairline bg-container flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-charcoal">{r.id}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-paper text-muted border border-hairline">
                            {r.mhgapCode}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted block mt-0.5">
                          {r.block} · {r.assignedFacility}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-full block">
                          {r.daysStalled}d Stalled
                        </span>
                        <button
                          onClick={() => onNavigate('queue')}
                          className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline mt-1 cursor-pointer"
                        >
                          Check In →
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Pharmacy Lateral Rebalance Card */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3 border-b border-hairline pb-3">
              <div>
                <h2 className="text-base font-bold text-charcoal tracking-tight flex items-center gap-2">
                  <Pill className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  Pharmacy Rebalancing Queue
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Surplus-to-deficit tablet transfers to prevent stockouts.
                </p>
              </div>
              <button
                onClick={() => onNavigate('pharmacy')}
                className="text-xs font-semibold text-charcoal hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Inventory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {drugRecommendations.length === 0 ? (
              <p className="text-xs text-muted p-4 text-center">All clinics maintain ≥30 days of medicine cover.</p>
            ) : (
              <div className="space-y-2.5">
                {drugRecommendations.slice(0, 3).map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl border border-hairline bg-container text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="capitalize font-bold text-charcoal">
                        {r.drugName} · {r.unitsToTransfer} tabs
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                          r.urgency === 'Immediate'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {r.urgency}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted flex items-center justify-between">
                      <span>{r.fromFacilityName} → {r.toFacilityName}</span>
                      <span className="font-mono">{r.donorRemainingDays}d → {r.recipientNewDays}d</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
