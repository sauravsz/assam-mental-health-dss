import { useScenarioData } from '../engine/scenarioDataContext'
import { ArrowRight, CheckCircle2, PhoneCall, Pill, MapPin, Waves, Activity, ShieldCheck, Siren } from 'lucide-react'

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

  const pct = (n: number, d: number) => (d > 0 ? Math.min(100, Math.round((n / d) * 100)) : 0)
  const surgeCalls = surgeDistricts.reduce((a, d) => a + d.callsLast30Days, 0)
  const stalledList = scopedReferrals.filter((r) => r.status === 'Stalled')

  return (
    <div className="space-y-6 w-full">
      {/* Hero */}
      <div className="hero p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="eyebrow">Executive overview</span>
          <h1 className="mt-1">Executive Command Cockpit</h1>
          <p className="text-[13px] text-muted mt-1.5 max-w-2xl">
            Real-time Tele-MANAS distress surveillance, stalled care retention and pharmaceutical supply for{' '}
            <strong className="text-charcoal">{selectedDistrictFilter}</strong>.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="pill pill-info">
            <MapPin className="w-3 h-3" /> {selectedDistrictFilter}
          </span>
          <span className="pill pill-ok">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Surveillance engine active
          </span>
        </div>
      </div>

      {/* KPI ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="card kpi kpi-blue p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Tele-MANAS inflow</span>
            <span className="icon-chip"><Activity className="w-4 h-4" /></span>
          </div>
          <div>
            <div className="kpi-value">{totalCalls.toLocaleString()}</div>
            <div className="text-[12px] text-muted mt-1.5">Calls logged in the last 30 days</div>
          </div>
          <div className="space-y-1.5">
            <div className="mini-meter"><span style={{ width: `${pct(surgeCalls, totalCalls)}%` }} /></div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted">{pct(surgeCalls, totalCalls)}% from surge districts</span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="w-3 h-3" /> Salted SHA-256
              </span>
            </div>
          </div>
        </div>

        <div className="card kpi kpi-rose p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Surge outliers</span>
            <span className="icon-chip"><Siren className="w-4 h-4" /></span>
          </div>
          <div>
            <div className="kpi-value accent">{surgeDistricts.length}</div>
            <div className="text-[12px] text-muted mt-1.5">Districts with a significant spike (p &lt; 0.01)</div>
          </div>
          <div className="space-y-1.5">
            <div className="mini-meter"><span style={{ width: `${pct(surgeDistricts.length, scoped.length)}%` }} /></div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted">{surgeDistricts.length} of {scoped.length} in scope</span>
              <span className={`font-semibold ${surgeDistricts.length > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                {surgeDistricts.length > 0 ? 'Action prompt' : 'Normal'}
              </span>
            </div>
          </div>
        </div>

        <div className="card kpi kpi-amber p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Stalled care queue</span>
            <span className="icon-chip"><PhoneCall className="w-4 h-4" /></span>
          </div>
          <div>
            <div className="kpi-value accent">{stalled}</div>
            <div className="text-[12px] text-muted mt-1.5">More than 14 days without a clinic visit</div>
          </div>
          <div className="space-y-1.5">
            <div className="mini-meter"><span style={{ width: `${pct(stalled, scopedReferrals.length)}%` }} /></div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted">{pct(stalled, scopedReferrals.length)}% of {scopedReferrals.length} referrals</span>
              <span className="font-semibold text-amber-700 dark:text-amber-400">Human follow-up</span>
            </div>
          </div>
        </div>

        <div className="card kpi kpi-teal p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Critical medicines</span>
            <span className="icon-chip"><Pill className="w-4 h-4" /></span>
          </div>
          <div>
            <div className="kpi-value">{criticalDrugs.length}</div>
            <div className="text-[12px] text-muted mt-1.5">Facilities under 15 days of cover</div>
          </div>
          <div className="space-y-1.5">
            <div className="mini-meter"><span style={{ width: `${pct(criticalDrugs.length, drugMetrics.length)}%` }} /></div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted">{immediateTransfers.length} immediate of {drugRecommendations.length} rebalances</span>
              <span className="font-semibold text-teal-700 dark:text-teal-400">Supply</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: anomalies + van banner */}
        <section className="lg:col-span-7 space-y-5">
          <div className="card p-6">
            <div className="section-head">
              <div className="flex items-start gap-3">
                <span className="icon-chip"><Activity className="w-4 h-4" /></span>
                <div>
                  <h2>Statistically significant distress anomalies</h2>
                  <p className="text-[12px] text-muted mt-0.5">Discrete Poisson tail surveillance (Z ≥ 2.50, p &lt; 0.01) with monsoon flood multipliers.</p>
                </div>
              </div>
              <button onClick={() => onNavigate('state')} className="link-arrow">
                <span>Full ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {surgeDistricts.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted">
                <CheckCircle2 className="w-9 h-9 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                <p className="font-semibold text-charcoal text-sm">All districts within normal Poisson variance.</p>
                <p className="mt-0.5">No statutory spike thresholds breached for {selectedDistrictFilter}.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {surgeDistricts.map((d) => {
                  const surgePct = Math.round(((d.callsLast30Days - d.poissonExpected) / d.poissonExpected) * 100)
                  const fillWidth = Math.min(100, Math.round((d.callsLast30Days / (d.poissonExpected * 2.2)) * 100))
                  return (
                    <div key={d.id} className="row-card">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-extrabold text-charcoal text-[15px]">{d.name}</span>
                            {d.name === 'Cachar' && <span className="pill pill-solid">PILOT</span>}
                            {d.floodCrisis && (
                              <span className="pill pill-info">
                                <Waves className="w-3 h-3" /> Flood multiplier
                              </span>
                            )}
                          </div>
                          <span className="text-[12px] text-muted mt-0.5 block">
                            {d.zone} · Population {(d.population / 100000).toFixed(1)} Lakh
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="pill pill-rose text-[12px]">+{surgePct}% spike</span>
                          <span className="text-[11px] text-muted font-mono block mt-1">
                            Z = +{d.zScore.toFixed(2)} · {d.pValueFormatted}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3.5">
                        <div className="flex justify-between text-[11px] text-muted mb-1.5">
                          <span>Expected {d.poissonExpected} calls</span>
                          <span className="font-bold text-charcoal">{d.callsLast30Days} actual</span>
                        </div>
                        <div className="meter">
                          <div className="meter-fill" style={{ width: `${fillWidth}%` }}></div>
                          <div className="meter-tick" style={{ left: `${(100 / 2.2).toFixed(1)}%` }} title="Poisson expected baseline"></div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="promo p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <span className="icon-chip" style={{ ['--accent' as string]: 'var(--brand-2)' }}>
                <MapPin className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-[14px] font-semibold text-charcoal">Cachar mobile van optimisation</h3>
                <p className="text-[12.5px] text-muted mt-0.5">
                  Two-Phase Simplex routing saves about 16 minutes per patient, 31.0% faster than the HQ town baseline.
                </p>
              </div>
            </div>
            <button onClick={() => onNavigate('planner')} className="btn-tint shrink-0">
              View catchment map
            </button>
          </div>
        </section>

        {/* Right: action center */}
        <section className="lg:col-span-5 space-y-5 lg:sticky lg:top-40">
          <div className="card p-6">
            <div className="section-head">
              <div className="flex items-start gap-3">
                <span className="icon-chip" style={{ ['--accent' as string]: 'var(--brand-amber)' }}><PhoneCall className="w-4 h-4" /></span>
                <div>
                  <h2>Stalled care outreach</h2>
                  <p className="text-[12px] text-muted mt-0.5">Counsellor callbacks for referrals stalled more than 14 days.</p>
                </div>
              </div>
              <button onClick={() => onNavigate('queue')} className="link-arrow">
                <span>View all ({stalled})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {stalledList.length === 0 ? (
              <p className="text-xs text-muted p-4 text-center">No stalled referrals in current scope.</p>
            ) : (
              <div className="space-y-2.5">
                {stalledList.slice(0, 3).map((r) => (
                  <div key={r.id} className="row-card amber flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[13px] text-charcoal">{r.id}</span>
                        <span className="pill pill-info">{r.mhgapCode}</span>
                      </div>
                      <span className="text-[12px] text-muted block mt-0.5 truncate">
                        {r.block} · {r.assignedFacility}
                      </span>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1.5">
                      <span className="pill pill-rose">{r.daysStalled}d stalled</span>
                      <button onClick={() => onNavigate('queue')} className="link-arrow">
                        Check in <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6">
            <div className="section-head">
              <div className="flex items-start gap-3">
                <span className="icon-chip" style={{ ['--accent' as string]: 'var(--brand-2)' }}><Pill className="w-4 h-4" /></span>
                <div>
                  <h2>Pharmacy rebalancing</h2>
                  <p className="text-[12px] text-muted mt-0.5">Surplus-to-deficit tablet transfers to prevent stockouts.</p>
                </div>
              </div>
              <button onClick={() => onNavigate('pharmacy')} className="link-arrow">
                <span>Inventory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {drugRecommendations.length === 0 ? (
              <p className="text-xs text-muted p-4 text-center">All clinics maintain ≥30 days of medicine cover.</p>
            ) : (
              <div className="space-y-2.5">
                {drugRecommendations.slice(0, 3).map((r) => (
                  <div key={r.id} className="row-card teal space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="capitalize font-bold text-[13px] text-charcoal">
                        {r.drugName} · {r.unitsToTransfer} tabs
                      </span>
                      <span className={`pill ${r.urgency === 'Immediate' ? 'pill-rose' : 'pill-amber'}`}>{r.urgency}</span>
                    </div>
                    <div className="text-[12px] text-muted flex items-center justify-between gap-2">
                      <span className="truncate">{r.fromFacilityName} → {r.toFacilityName}</span>
                      <span className="font-mono shrink-0">{r.donorRemainingDays}d → {r.recipientNewDays}d</span>
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
